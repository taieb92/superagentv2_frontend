"use client";

import "@livekit/components-styles";

import { Button } from "@/components/ui/button";
import { useUnfilledFields } from "./useUnfilledFields";
import { useFieldNavigator } from "./useFieldNavigator";
import { FieldNavigator } from "./FieldNavigator";
import { createDocument } from "@/lib/actions/documents";
import { useExtractions } from "@/lib/hooks/use-extractions";
import { useLivekitConnection } from "@/lib/hooks/use-livekit-connection";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Eye, Loader2, Mic, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { TranscriptMessage } from "../voice/TranscriptFeed";
import { toast } from "sonner";
import { TranscriptFeed } from "../voice/TranscriptFeed";
import {
  VoiceSessionToggle,
  VoiceSessionView,
} from "../voice/VoiceSessionToggle";
import { RealTimePdfPreview } from "../voice/RealTimePdfPreview";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  BarVisualizer,
  useVoiceAssistant,
  useRoomContext,
  useTrackTranscription,
  useLocalParticipant,
} from "@livekit/components-react";
interface VoiceAgentUIProps {
  mlsId?: string;
  jurisdiction?: string;
  template?: any;
  guestToken?: string;
  onFinalize?: (fields: { key: string; value: string }[]) => Promise<void>;
}

/**
 * Mobile-first Voice Agent UI with toggle-based views.
 * Prioritizes usability during active calls with large touch targets
 * and simplified interface.
 */
export function VoiceAgentUI({
  mlsId,
  jurisdiction,
  guestToken,
  onFinalize,
  template: externalTemplate,
}: VoiceAgentUIProps = {}) {
  const router = useRouter();
  const { user } = useUser();
  const [activeView, setActiveView] = useState<VoiceSessionView>("transcript");
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [loadedTemplate, setLoadedTemplate] = useState<any>(
    externalTemplate || null
  );

  const {
    connectionDetails,
    isConnecting,
    startCall,
    handleDisconnected,
  } = useLivekitConnection(guestToken);

  const isConnected = !!connectionDetails;

  const {
    fields,
    documentType,
    jurisdictionCode: extractedJurisdiction,
  } = useExtractions({
    userId: user?.id,
    callId: connectionDetails?.roomName ?? null,
    pollInterval: 1000,
    enabled: isConnected,
  });

  // Jurisdiction: user profile > extraction response > URL param
  const profileJurisdiction = user?.publicMetadata?.jurisdictionCode as
    | string
    | undefined;
  const resolvedJurisdiction =
    profileJurisdiction || extractedJurisdiction || jurisdiction;

  // Convert fields array to contract data object format
  const contractData = useMemo(() => {
    const data: Record<string, any> = {};
    fields.forEach((field) => {
      if (field.value) {
        data[field.key] = field.value;
      }
    });
    return data;
  }, [fields]);

  // Use template-based tracking if template is loaded, otherwise fall back to requiredFieldKeys
  const { unfilledFields, totalRequired, filledCount } = useUnfilledFields({
    template: loadedTemplate ?? undefined,
    contractData,
  });

  const navigator = useFieldNavigator({ unfilledFields });

  async function handleViewContractDraft() {
    if (!user?.id && !guestToken) {
      toast.error("Please sign in to continue");
      return;
    }

    setIsCreatingDocument(true);

    if (onFinalize) {
      try {
        await onFinalize(fields);
        setIsCreatingDocument(false);
        return;
      } catch (error) {
        toast.error(
          "Failed to finalize: " +
            (error instanceof Error ? error.message : "Unknown error")
        );
        setIsCreatingDocument(false);
        return;
      }
    }

    const documentData: Record<string, unknown> = {
      Source: "SuperAgent Voice Session",
    };

    fields.forEach((field) => {
      if (field.value) {
        documentData[field.key] = field.value;
      }
    });

    const result = await createDocument({
      title: "Residential Purchase Agreement",
      docType: "CONTRACT",
      data: documentData,
    });

    setIsCreatingDocument(false);

    if (result.success && result.document) {
      router.push(
        `/dashboard/superagent/send-for-signature/${result.document.id}`
      );
    } else {
      toast.error(result.error || "Failed to create document");
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[500px] max-h-[800px]">
      {/* HEADER: Status + Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        {/* Session Status */}
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              isConnected
                ? "bg-emerald-500 animate-[pulse_2s_infinite]"
                : isConnecting
                  ? "bg-amber-400 animate-pulse"
                  : "bg-zinc-300"
            )}
          />
          <span className="text-[16px] font-semibold text-[#111827]">
            {isConnected
              ? "Live Session"
              : isConnecting
                ? "Connecting..."
                : "Ready to Start"}
          </span>
        </div>

        {/* View Toggle - Only show when connected */}
        {isConnected && (
          <VoiceSessionToggle
            activeView={activeView}
            onViewChange={setActiveView}
            extractedCount={fields.length}
          />
        )}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 bg-white border border-[#E5E7EB] overflow-hidden flex flex-col">
        {/* Pre-Session State */}
        {!isConnected && !isConnecting && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-[#ECFDF5] rounded-full flex items-center justify-center mb-6">
              <Mic className="w-10 h-10 text-[#0F766E]" />
            </div>
            <h3 className="text-[20px] font-semibold text-[#111827] mb-2">
              Ready for Voice Session
            </h3>
            <p className="text-[14px] text-[#6B7280] max-w-sm mb-8">
              Start a voice session to capture contract details in real-time.
              Your conversation will be transcribed and key fields extracted
              automatically.
            </p>
            <Button
              onClick={() => startCall()}
              size="lg"
              className="bg-[#0F766E] hover:bg-[#115E59] text-white px-8 h-14 text-[16px] font-semibold shadow-lg"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Voice Session
            </Button>
          </div>
        )}

        {/* Connecting State */}
        {isConnecting && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <Loader2 className="w-12 h-12 text-[#0F766E] animate-spin mb-4" />
            <p className="text-[14px] font-medium text-[#111827]">
              Connecting to voice agent...
            </p>
          </div>
        )}

        {/* Active Session — LiveKit Room */}
        {isConnected && connectionDetails && (
          <LiveKitRoom
            serverUrl={connectionDetails.url}
            token={connectionDetails.token}
            audio={true}
            connectOptions={{ autoSubscribe: true }}
            onDisconnected={handleDisconnected}
            onError={(err) => {
              console.error("LiveKit room error:", err);
              toast.error("Voice connection error");
            }}
            onMediaDeviceFailure={(failure) => {
              console.error("Media device failure:", failure);
              toast.error(
                "Microphone access failed. Please allow microphone permissions."
              );
            }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <ConnectedLayout
              activeView={activeView}
              fields={fields}
              documentType={documentType}
              resolvedJurisdiction={resolvedJurisdiction}
              contractData={contractData}
              navigator={navigator}
              totalRequired={totalRequired}
              filledCount={filledCount}
              onTemplateLoaded={setLoadedTemplate}
              isCreatingDocument={isCreatingDocument}
              handleViewContractDraft={handleViewContractDraft}
              isConnecting={isConnecting}
            />
            <RoomAudioRenderer />
          </LiveKitRoom>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ConnectedLayout — rendered inside <LiveKitRoom>                    */
/* ------------------------------------------------------------------ */

interface ConnectedLayoutProps {
  activeView: VoiceSessionView;
  fields: { key: string; value: string }[];
  documentType: string | undefined;
  resolvedJurisdiction: string | undefined;
  contractData: Record<string, any>;
  navigator: ReturnType<typeof useFieldNavigator>;
  totalRequired: number;
  filledCount: number;
  onTemplateLoaded: (t: any) => void;
  isCreatingDocument: boolean;
  handleViewContractDraft: () => void;
  isConnecting: boolean;
}

function ConnectedLayout({
  activeView,
  fields,
  documentType,
  resolvedJurisdiction,
  contractData,
  navigator,
  totalRequired,
  filledCount,
  onTemplateLoaded,
  isCreatingDocument,
  handleViewContractDraft,
  isConnecting,
}: ConnectedLayoutProps) {
  const { state, audioTrack, agentTranscriptions } = useVoiceAssistant();
  const { microphoneTrack, localParticipant } = useLocalParticipant();

  const localMicTrackRef = useMemo(() => {
    if (!microphoneTrack || !localParticipant) return undefined;
    return {
      participant: localParticipant,
      publication: microphoneTrack,
      source: microphoneTrack.source,
    };
  }, [microphoneTrack, localParticipant]);

  const { segments: userSegments } = useTrackTranscription(localMicTrackRef);

  // Build a chronologically ordered transcript from both agent and user segments
  const messages = useMemo<TranscriptMessage[]>(() => {
    const merged: { time: number; role: "agent" | "user"; text: string }[] = [];

    for (const seg of agentTranscriptions) {
      if (seg.text.trim()) {
        merged.push({
          time: seg.firstReceivedTime,
          role: "agent",
          text: seg.text,
        });
      }
    }

    for (const seg of userSegments) {
      if (seg.text.trim()) {
        merged.push({
          time: seg.firstReceivedTime,
          role: "user",
          text: seg.text,
        });
      }
    }

    merged.sort((a, b) => a.time - b.time);

    return merged.map((m) => ({ role: m.role, content: m.text }));
  }, [agentTranscriptions, userSegments]);

  const statusLabel = (() => {
    switch (state) {
      case "connecting":
        return "Connecting...";
      case "initializing":
        return "Agent joining...";
      case "listening":
        return "Listening...";
      case "thinking":
        return "Thinking...";
      case "speaking":
        return "Speaking...";
      default:
        return "";
    }
  })();

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Voice status + visualizer bar */}
        <div className="flex items-center gap-4 px-4 sm:px-6 pt-4 pb-2">
          {statusLabel && (
            <span className="text-[13px] font-medium text-[#6B7280] min-w-[100px]">
              {statusLabel}
            </span>
          )}
          <div className="flex-1 h-10">
            <BarVisualizer
              state={state}
              barCount={5}
              trackRef={audioTrack}
              className="h-full"
            />
          </div>
        </div>

        {/* Toggle Content */}
        <div className="flex-1 overflow-hidden p-4 sm:p-6">
          <AnimatePresence mode="wait">
            {activeView === "transcript" ? (
              <motion.div
                key="transcript"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <TranscriptFeed messages={messages} className="h-full" />
              </motion.div>
            ) : activeView === "extracted" ? (
              <motion.div
                key="extracted"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full overflow-y-auto"
              >
                {/* Simplified Extracted Fields - Latest on top */}
                <div className="space-y-3">
                  {fields.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-[14px] text-[#6B7280]">
                        Fields will appear here as they are detected...
                      </p>
                    </div>
                  ) : (
                    [...fields].reverse().map((field) => (
                      <div
                        key={field.key}
                        data-field-key={field.key}
                        className="bg-[#F9FAFB] border border-[#E5E7EB] p-4"
                      >
                        <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1">
                          {field.key}
                        </div>
                        <div className="text-[15px] text-[#111827]">
                          {field.value || (
                            <span className="text-[#9CA3AF] italic">
                              Waiting...
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <RealTimePdfPreview
                  documentType={documentType}
                  jurisdictionCode={resolvedJurisdiction}
                  contractData={contractData}
                  isActive={true}
                  activeFieldName={navigator.currentField?.name ?? null}
                  onTemplateLoaded={onTemplateLoaded}
                />
                <FieldNavigator
                  currentField={navigator.currentField}
                  currentIndex={navigator.currentIndex}
                  totalRemaining={navigator.totalRemaining}
                  totalRequired={totalRequired}
                  filledCount={filledCount}
                  onNext={navigator.goNext}
                  onPrev={navigator.goPrev}
                  className="absolute bottom-0 left-0 right-0 z-20"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="bg-white border border-[#E5E7EB] border-t-0 p-4 sm:p-6">
        <div className="flex items-center justify-center gap-4">
          {/* View Contract Draft Button */}
          <Button
            onClick={handleViewContractDraft}
            disabled={isCreatingDocument || fields.length === 0}
            variant="outline"
            className="h-12 px-6 border-[#E5E7EB] text-[#111827] hover:bg-[#F9FAFB]"
          >
            {isCreatingDocument ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            View Draft
          </Button>

          {/* End Call Button */}
          <DisconnectButton isConnecting={isConnecting} />

          {/* Finalize Button (when enough data) */}
          <Button
            onClick={handleViewContractDraft}
            disabled={isCreatingDocument || fields.length < 3}
            className="h-12 px-6 bg-[#0F766E] hover:bg-[#115E59] text-white"
          >
            {isCreatingDocument ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            Finalize
          </Button>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* DisconnectButton — uses useRoomContext for proper disconnect        */
/* ------------------------------------------------------------------ */

function DisconnectButton({ isConnecting }: { isConnecting: boolean }) {
  const room = useRoomContext();

  return (
    <Button
      onClick={() => room.disconnect()}
      disabled={isConnecting}
      className="h-14 w-14 rounded-full p-0 bg-red-500 hover:bg-red-600 text-white shadow-lg"
    >
      {isConnecting ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <PhoneOff className="w-6 h-6" />
      )}
    </Button>
  );
}
