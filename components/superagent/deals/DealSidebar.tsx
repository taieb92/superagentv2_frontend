"use client";

import { ChecklistPanel } from "@/components/superagent/contracts/ChecklistPanel";
import { Button } from "@/components/ui/button";

interface ChecklistItem {
  id: string;
  label: string;
  type: "MISSING" | "INFO" | "WARNING";
  description: string;
}

interface DealSidebarProps {
  checklistItems: ChecklistItem[];
}

export function DealSidebar({ checklistItems }: DealSidebarProps) {
  return (
    <div className="space-y-6">
      <ChecklistPanel items={checklistItems} />

      <div className="bg-white border border-[#E5E7EB] rounded-none p-6 space-y-4 shadow-sm">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
            Review Summary
          </p>
          <p className="text-[16px] font-semibold text-[#111827]">
            Almost ready to send.
          </p>
        </div>
        <p className="text-[12px] text-[#6B7280] leading-relaxed">
          2 required fields remain. AI extraction confidence is high for all
          major terms.
        </p>
        <Button className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white font-semibold h-11 rounded-none">
          Finalize for Review
        </Button>
      </div>
    </div>
  );
}
