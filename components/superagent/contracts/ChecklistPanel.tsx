"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  type: "MISSING" | "WARNING" | "INFO";
  description?: string;
}

interface ChecklistPanelProps {
  items: ChecklistItem[];
}

export function ChecklistPanel({ items }: ChecklistPanelProps) {
  const missing = items.filter((i) => i.type === "MISSING");
  const warnings = items.filter((i) => i.type === "WARNING");
  const inferred = items.filter((i) => i.type === "INFO");

  return (
    <div className="bg-white border border-[#E5E7EB]  overflow-hidden shadow-sm sticky top-[88px]">
      <div className="p-5 border-b border-[#F3F4F6] bg-[#F9FAFB]/50">
        <h3 className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider flex items-center justify-between">
          Transaction Review
          {missing.length > 0 && (
            <span className="text-[#B91C1C] bg-red-50 px-2 py-0.5 rounded-full text-[11px] font-bold border border-red-100">
              {missing.length} missing
            </span>
          )}
        </h3>
      </div>

      <div className="divide-y divide-[#F3F4F6]">
        {items.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="mx-auto w-12 h-12 bg-[#ECFDF5] rounded-none flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-[#0F766E]" />
            </div>
            <div className="space-y-1">
              <p className="text-[14px] font-semibold text-[#111827]">
                All Ready
              </p>
              <p className="text-[12px] text-[#6B7280]">
                No critical issues detected.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Missing Section */}
            {missing.length > 0 && (
              <div className="py-2">
                <p className="px-5 py-2 text-[11px] font-bold text-red-600 uppercase tracking-tighter">
                  Required
                </p>
                {missing.map((item) => (
                  <ChecklistItemView key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Inferred Section */}
            {inferred.length > 0 && (
              <div className="py-2">
                <p className="px-5 py-2 text-[11px] font-bold text-[#0F766E] uppercase tracking-tighter flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> Inferred
                </p>
                {inferred.map((item) => (
                  <ChecklistItemView key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Warnings Section */}
            {warnings.length > 0 && (
              <div className="py-2">
                <p className="px-5 py-2 text-[11px] font-bold text-amber-600 uppercase tracking-tighter">
                  Warnings
                </p>
                {warnings.map((item) => (
                  <ChecklistItemView key={item.id} item={item} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ChecklistItemView({ item }: { item: ChecklistItem }) {
  return (
    <button className="w-full flex items-start gap-4 px-5 py-3 hover:bg-[#F8F9FB] transition-all group text-left">
      <div className="mt-0.5">
        {item.type === "MISSING" && (
          <AlertCircle className="w-4 h-4 text-[#B91C1C]" />
        )}
        {item.type === "WARNING" && (
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        )}
        {item.type === "INFO" && (
          <div className="w-4 h-4 rounded-full bg-[#ECFDF5] border border-[#0F766E]/20" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-[#111827] group-hover:text-[#0F766E] transition-colors truncate">
          {item.label}
        </div>
        <div className="text-[11px] text-[#6B7280] truncate">
          {item.description ||
            (item.type === "MISSING"
              ? "Field must be completed"
              : "Please verify accuracy")}
        </div>
      </div>
      <ChevronRight className="w-3.5 h-3.5 text-[#D1D5DB] mt-1 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}
