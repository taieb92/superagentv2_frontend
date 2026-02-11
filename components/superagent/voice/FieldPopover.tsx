"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";

interface FieldPopoverProps {
  label: string;
  value: string;
  source?: "VOICE" | "AGENT_PROFILE" | "MLS" | "DEFAULT";
  confidence?: number; // 0 to 1
  evidence?: string;
  children: React.ReactNode;
}

export function FieldPopover({
  label,
  value,
  source = "VOICE",
  confidence = 1,
  evidence,
  children,
}: FieldPopoverProps) {
  const getConfidenceIcon = () => {
    if (confidence >= 0.9)
      return <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />;
    if (confidence >= 0.6)
      return <HelpCircle className="w-3.5 h-3.5 text-[#F59E0B]" />;
    return <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />;
  };

  const getConfidenceText = () => {
    if (confidence >= 0.9) return "High Confidence";
    if (confidence >= 0.6) return "Medium Confidence";
    return "Low Confidence";
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-72 p-4  border-[#E5E7EB] shadow-lg"
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">
              Field Label
            </h4>
            <p className="text-[14px] font-medium text-[#111827]">{label}</p>
          </div>

          <div>
            <h4 className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">
              Detected Value
            </h4>
            <p className="text-[14px] text-[#111827] bg-[#F9FAFB] p-2 rounded-none border border-[#E5E7EB]">
              {value || "---"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E5E7EB]">
            <div>
              <h4 className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">
                Source
              </h4>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                <span className="text-[12px] font-medium text-[#111827]">
                  {source}
                </span>
              </div>
            </div>
            <div>
              <h4 className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider mb-1">
                Verification
              </h4>
              <div className="flex items-center gap-1.5">
                {getConfidenceIcon()}
                <span className="text-[12px] font-medium text-[#111827]">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            </div>
          </div>

          {evidence && (
            <div className="pt-2">
              <h4 className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider mb-1">
                Evidence
              </h4>
              <p className="text-[12px] text-[#6B7280] italic leading-relaxed">
                "{evidence}"
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
