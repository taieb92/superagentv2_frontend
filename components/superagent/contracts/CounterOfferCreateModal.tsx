"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { CounterPdfUploader } from "./CounterPdfUploader";
import { VoiceAgentUI } from "./VoiceAgentUI";
import { Checkbox } from "@/components/ui/checkbox";

interface CounterOfferCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (voiceSessionId?: string, onBehalfOfSeller?: boolean) => void;
  onUpload?: (file: File, onBehalfOfSeller?: boolean) => Promise<void>;
  isCreating?: boolean;
  isUploading?: boolean;
  /** Optional deal ID for tracking purposes */
  dealId?: string;
  isAgent?: boolean;
  guestToken?: string;
}

export function CounterOfferCreateModal({
  open,
  onOpenChange,
  onSubmit,
  onUpload,
  isCreating = false,
  isUploading = false,
  isAgent = false,
  guestToken,
}: Readonly<CounterOfferCreateModalProps>) {
  const [onBehalfOfSeller, setOnBehalfOfSeller] = useState(false);
  const handleVoiceFinalize = async (
    fields: { key: string; value: string }[]
  ) => {
    onSubmit(undefined, onBehalfOfSeller);
  };

  const handleFileUpload = async (file: File) => {
    if (onUpload) {
      await onUpload(file, onBehalfOfSeller);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-0 overflow-hidden border border-[#E5E7EB] shadow-xl bg-white rounded-none">
        <DialogHeader className="px-6 py-5 border-b border-[#E5E7EB]">
          <DialogTitle className="text-[18px] font-semibold text-[#111827]">
            New Counter Offer
          </DialogTitle>
          <DialogDescription className="text-[13px] text-[#6B7280]">
            {isAgent && onBehalfOfSeller
              ? "Creating counter offer on behalf of seller"
              : "Choose a method to respond to this offer"}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full">
          <div className="px-6 pt-4 border-b border-[#E5E7EB]">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-8">
              <TabsTrigger
                value="upload"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F766E] data-[state=active]:bg-transparent px-0 pb-4 text-[14px] font-medium transition-all"
              >
                Upload PDF
              </TabsTrigger>
              <TabsTrigger
                value="voice"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F766E] data-[state=active]:bg-transparent px-0 pb-4 text-[14px] font-medium transition-all"
              >
                Voice Assistant
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upload" className="m-0">
            <div className="px-6 py-8 space-y-6">
              {isAgent && (
                <div className="flex items-center space-x-2 p-4 bg-amber-50 border border-amber-200 rounded-none">
                  <Checkbox
                    id="onBehalfOfSeller"
                    checked={onBehalfOfSeller}
                    onCheckedChange={(checked) =>
                      setOnBehalfOfSeller(checked === true)
                    }
                  />
                  <Label
                    htmlFor="onBehalfOfSeller"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    I'm submitting this counter offer on behalf of the seller
                  </Label>
                </div>
              )}
              <CounterPdfUploader
                onUpload={handleFileUpload}
                isUploading={isUploading}
              />
            </div>
          </TabsContent>

          <TabsContent value="voice" className="m-0">
            <div className="p-6">
              <VoiceAgentUI
                guestToken={guestToken}
                onFinalize={handleVoiceFinalize}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
