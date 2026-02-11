import type { DocumentListDto } from "@/lib/api/generated/fetch-client";
import { format } from "date-fns";
import { ChevronRight, FileStack } from "lucide-react";

export function AddendumCard({
  addendum,
  onClick,
}: {
  addendum: DocumentListDto;
  onClick: () => void;
}) {
  const updatedAt =
    addendum.updatedAtISO || addendum.updatedAt || new Date().toISOString();
  const displayName = addendum.title || addendum.templateName || "Addendum";

  return (
    <div
      className="bg-white border border-[#E5E7EB] rounded-none p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[#0F766E]/30 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 bg-[#F9FAFB] border border-[#E5E7EB] rounded-none flex items-center justify-center text-[#9CA3AF] shrink-0">
          <FileStack className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold text-[#111827] truncate">
            {displayName}
          </p>
          <p className="text-[12px] text-[#6B7280]">
            Updated {format(new Date(updatedAt), "MMM d, yyyy")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[12px] font-medium text-[#0F766E] bg-[#ECFDF5] px-2 py-0.5 rounded-none border border-[#0F766E]/20">
          {addendum.status}
        </span>
        <ChevronRight className="w-4 h-4 text-[#D1D5DB] group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
}
