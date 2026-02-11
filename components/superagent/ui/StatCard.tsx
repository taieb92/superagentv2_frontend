"use client";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  count: number;
  highlight?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export function StatCard({
  label,
  count,
  highlight,
  active,
  onClick,
}: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-1 flex-col items-start border border-[#E5E7EB] bg-white p-5 text-left transition-all hover:bg-[#F8F9FB] ",
        active ? "border-[#0F766E] ring-1 ring-[#0F766E]" : "",
        "focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:ring-offset-2"
      )}
    >
      <div className="text-2xl font-semibold text-[#111827]">{count}</div>
      <div className="mt-1 text-[13px] font-normal text-[#6B7280]">{label}</div>
    </button>
  );
}
