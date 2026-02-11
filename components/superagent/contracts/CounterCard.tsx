import * as Types from "@/lib/api/generated/fetch-client";
import { CounterOfferDto } from "@/lib/api/generated/fetch-client";
import { format } from "date-fns";
import { ChevronRight, History, Reply, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const methodLabel: Record<string, string> = {
  MANUAL: "Manual",
  VOICE: "Voice",
  UPLOAD: "Upload",
};

export function CounterCard({
  counter,
  onClick,
  onCounter,
  compact = false,
}: {
  counter: CounterOfferDto;
  onClick: () => void;
  onCounter?: (counter: CounterOfferDto) => void;
  compact?: boolean;
}) {
  const updatedAt = counter.updatedAt || new Date().toISOString();
  const displayName = `Counter Offer #${counter.sequenceNumber}`;

  if (compact) {
    return (
      <div
        className="bg-white p-3 flex flex-col gap-2 group hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-transparent hover:border-l-[#0F766E]"
        onClick={onClick}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] text-gray-400">
                {format(new Date(updatedAt), "MMM d")}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 truncate">
              {displayName}
            </p>
            {counter.parentCounterOfferId && (
              <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
                <Reply className="w-3 h-3" />
                <span>Replying to previous</span>
              </div>
            )}
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${
                counter.status === "DRAFT"
                  ? "bg-gray-100 text-gray-600 border-gray-200"
                  : counter.status === "SIGNED"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
              }`}
            >
              {counter.status}
            </span>
          </div>
        </div>

        {onCounter && (
          <div className="pt-2 mt-1 border-t border-gray-100 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] px-2 text-[#0F766E] hover:bg-emerald-50"
              onClick={(e) => {
                e.stopPropagation();
                onCounter(counter);
              }}
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="bg-white border border-[#E5E7EB] rounded-none p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-[#0F766E]/30 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 bg-[#F9FAFB] border border-[#E5E7EB] rounded-none flex items-center justify-center text-[#9CA3AF] shrink-0">
          <History className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-semibold text-[#111827] truncate">
              {displayName}
            </p>
            {counter.parentCounterOfferId && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded-none border border-[#E5E7EB]">
                <ArrowUpRight className="w-2.5 h-2.5" />
                Responding to previous
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] text-[#6B7280]">
              {counter.creationMethod &&
                (methodLabel[counter.creationMethod] || counter.creationMethod)}
            </span>
            <span className="text-[10px] text-[#D1D5DB]">·</span>
            <span className="text-[12px] text-[#6B7280]">
              {format(new Date(updatedAt), "MMM d, yyyy")}
            </span>
          </div>
          {counter.description && (
            <p className="text-[12px] text-[#9CA3AF] mt-1 truncate">
              {counter.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {onCounter && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-[#0F766E] hover:text-[#0F766E] hover:bg-[#ECFDF5] rounded-none gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              onCounter(counter);
            }}
          >
            <Reply className="w-3.5 h-3.5" />
            <span className="text-[12px]">Counter</span>
          </Button>
        )}
        <span className="text-[12px] font-medium text-[#0F766E] bg-[#ECFDF5] px-2 py-0.5 rounded-none border border-[#0F766E]/20">
          {counter.status}
        </span>
        <ChevronRight className="w-4 h-4 text-[#D1D5DB] group-hover:translate-x-0.5 transition-transform" />
      </div>
    </div>
  );
}
