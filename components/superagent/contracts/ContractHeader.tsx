"use client";

import { StatusPill } from "@/components/superagent/ui/StatusPill";
import { Button } from "@/components/ui/button";
import { Download, Mail, Mic, MoreHorizontal, Send } from "lucide-react";
import { useRouter } from "next/navigation";

interface ContractHeaderProps {
  address: string;
  status: string;
  buyerName?: string;
  lastSaved?: string;
  onDownload: () => void;
  missingFieldsCount?: number;
}

export function ContractHeader({
  address,
  status,
  buyerName,
  lastSaved,
  onDownload,
  missingFieldsCount = 0,
}: Readonly<ContractHeaderProps>) {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-[#E5E7EB] px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div className="min-w-0">
        <div className="flex items-center gap-3 mb-1.5 flex-wrap">
          <h1
            className="text-[20px] font-bold text-[#111827] tracking-tight truncate max-w-[500px]"
            title={address}
          >
            {address}
          </h1>
          <StatusPill status={status} />
          {missingFieldsCount > 0 && (
            <span className="text-[12px] font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
              Missing {missingFieldsCount} required fields
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
          <span className="font-medium text-[#4B5563]">{buyerName || "—"}</span>
          <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
          <span>Synced {lastSaved || "Just now"}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="contents sm:flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {}} // Email for review
            className="h-10 border-[#E5E7EB] text-[#4B5563] hover:bg-[#F8F9FB] rounded-none font-medium"
          >
            <Mail className="w-4 h-4 mr-2" />
            <span className="hidden lg:inline">Email for Review</span>
            <span className="lg:hidden">Email</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="h-10 border-[#E5E7EB] text-[#4B5563] hover:bg-[#F8F9FB] rounded-none font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden lg:inline">Download</span>
            <span className="lg:hidden">DL</span>
          </Button>

          {status === "DRAFT" ? (
            <Button
              onClick={() => router.push("/dashboard/superagent")}
              className="h-10 px-5 bg-[#0F766E] hover:bg-[#115E59] text-white rounded-none font-semibold shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              <Mic className="w-4 h-4" />
              Resume Voice
            </Button>
          ) : (
            <Button className="h-10 px-5 bg-[#111827] hover:bg-black text-white rounded-none font-semibold shadow-sm flex items-center gap-2 transition-all active:scale-[0.98]">
              <Send className="w-4 h-4" />
              Send for Signature
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-[#6B7280] hover:bg-[#F8F9FB] rounded-none"
        >
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
