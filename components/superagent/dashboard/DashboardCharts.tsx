"use client";

import { DealListDto } from "@/lib/api/generated/fetch-client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardChartsProps {
  deals?: DealListDto[];
}

export function DashboardCharts({
  deals = [],
}: Readonly<DashboardChartsProps>) {
  const draftCount = deals.filter((d) => d.status === "DRAFT").length;
  const waitingCount = deals.filter(
    (d) => d.status === "WAITING_SIGNATURE"
  ).length;
  const completedCount = deals.filter((d) => d.status === "COMPLETED").length;
  const blockedCount = deals.filter((d) => d.status === "BLOCKED").length;
  const total = deals.length || 1;

  const segments = [
    {
      label: "Draft",
      count: draftCount,
      color: "bg-[#6B7280]",
      height: (draftCount / total) * 100,
    },
    {
      label: "Waiting signature",
      count: waitingCount,
      color: "bg-[#0F766E]",
      height: (waitingCount / total) * 100,
    },
    {
      label: "Completed",
      count: completedCount,
      color: "bg-[#D1D5DB]",
      height: (completedCount / total) * 100,
    },
    {
      label: "Blocked",
      count: blockedCount,
      color: "bg-[#F3F4F6]",
      height: (blockedCount / total) * 100,
    },
  ];

  return (
    <div className="bg-white rounded-[10px] border border-[#E5E7EB] p-8 hover:border-[#0F766E] transition-all duration-200 h-full">
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-1">
          <h3 className="text-[18px] font-semibold text-[#111827] leading-tight">
            Purchase Contracts
          </h3>
          <p className="text-[12px] text-[#6B7280] font-medium uppercase tracking-widest">
            Distribution by State • Real Data
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest">
          <div className="flex items-center gap-1.5 text-[#0F766E]">
            <div className="w-2 h-2 rounded-full bg-[#0F766E]" />
            <span>Active</span>
          </div>
        </div>
      </div>

      <div className="relative h-[240px] w-full flex items-end justify-around px-8 gap-8">
        {segments.map((s, i) => (
          <div
            key={s.label}
            className="flex-1 flex flex-col items-center gap-4 group"
          >
            <div className="relative w-full max-w-[40px] h-full flex items-end">
              <motion.div
                className={cn("w-full rounded-t-[4px] transition-all", s.color)}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(s.height, 5)}%` }} // min 5% for visibility if 0
                transition={{ delay: i * 0.1, duration: 0.5 }}
              />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-[#111827]">
                {s.count}
              </div>
            </div>
            <span className="text-[11px] font-semibold text-[#6B7280] group-hover:text-[#111827] transition-colors whitespace-nowrap">
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mt-10 pt-8 border-t border-[#E5E7EB]">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7280] uppercase">
            Total Inventory
          </p>
          <p className="text-[14px] font-bold text-[#111827]">
            {deals.length} Contracts
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-[#6B7280] uppercase">
            Productivity
          </p>
          <p className="text-[14px] font-bold text-[#111827]">
            {completedCount} Finalized
          </p>
        </div>
      </div>
    </div>
  );
}
