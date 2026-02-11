"use client";

import { listContainer, listItem } from "@/components/superagent/motion/motion";
import { formatDistanceToNowStrict } from "date-fns";
//TODO: to be removed
/** Local UI type for activity list items (not from API). */
export interface IActivityDto {
  id?: string;
  label?: string;
  timestampISO?: Date | string;
  tone?: string;
}
import { motion } from "framer-motion";
import { Check } from "lucide-react";

function timeAgo(iso: string) {
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

function toIsoString(ts: IActivityDto["timestampISO"]): string {
  if (ts == null) return "";
  return typeof ts === "string" ? ts : ts.toISOString();
}

export function ActivityList({ items }: Readonly<{ items: IActivityDto[] }>) {
  return (
    <motion.div
      variants={listContainer}
      initial="hidden"
      animate="show"
      className="divide-y divide-[#E5E7EB]  border border-[#E5E7EB] bg-white overflow-hidden"
    >
      {items.slice(0, 5).map((it) => (
        <motion.div
          key={it.id ?? ""}
          variants={listItem}
          className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-[#F8F9FB]"
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-none border border-[#E5E7EB] bg-[#F9FAFB]">
              <Check className="h-4 w-4 text-[#0F766E]" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-[14px] text-[#374151] font-normal">
                {it.label ?? ""}
              </div>
            </div>
          </div>
          <div className="shrink-0 text-[12px] text-[#9CA3AF] font-medium">
            {timeAgo(toIsoString(it.timestampISO))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
