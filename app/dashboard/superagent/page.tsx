"use client";
import { VoiceAgentUI } from "@/components/superagent/contracts/VoiceAgentUI";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { PageShell } from "@/components/superagent/shell/PageShell";

function VoiceSessionContent() {
  const searchParams = useSearchParams();
  const jurisdiction = searchParams.get("jurisdiction");
  const mlsId = searchParams.get("mlsId");

  return (
    <PageShell>
      <div className="min-h-screen bg-[#FAFAFA]">
        {/* Minimal header for mobile */}
        <div className="bg-white border-b border-[#E5E7EB] px-4 py-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-[18px] sm:text-[20px] font-semibold text-[#111827]">
              Voice Session
            </h1>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              Capture contract details with voice assistance
            </p>
          </div>
        </div>

        {/* Main content - full width on mobile */}
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <VoiceAgentUI
              mlsId={mlsId || undefined}
              jurisdiction={jurisdiction || undefined}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function VoiceSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
          <div className="flex items-center gap-3 text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      }
    >
      <VoiceSessionContent />
    </Suspense>
  );
}
