"use client";

import { listItem, subtleHover } from "@/components/superagent/motion/motion";
import { formatDistanceToNowStrict } from "date-fns";
import { motion } from "framer-motion";
import { Clock, User } from "lucide-react";
import Link from "next/link";
import { StatusPill } from "./StatusPill";

export interface BbaListItem {
  id: string;
  buyerName: string;
  status: string;
  updatedAtISO: string;
  agentBrokerage?: string;
}

export function BbaCard({ bba }: Readonly<{ bba: BbaListItem }>) {
  const lastUpdated =
    bba.updatedAtISO &&
    formatDistanceToNowStrict(new Date(bba.updatedAtISO), { addSuffix: true });

  return (
    <motion.div variants={listItem} {...subtleHover}>
      <Link
        href={`/dashboard/bbas/${bba.id}`}
        className="block min-h-[140px] rounded-none border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-sm transition-shadow hover:shadow hover:border-[#D1D5DB]"
      >
        <div className="flex flex-row items-start justify-between gap-3">
          <div className="min-w-0 flex-1 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-[#111827]">
                {bba.buyerName}
              </div>
              <div className="mt-0.5 text-xs text-[#6B7280]">
                {bba.agentBrokerage || "BBA Agreement"}
              </div>
            </div>
          </div>
          <StatusPill status={bba.status} />
        </div>

        {lastUpdated ? (
          <div className="mt-4 flex items-center gap-1.5 text-[12px] text-[#9CA3AF]">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {lastUpdated}
          </div>
        ) : null}
      </Link>
    </motion.div>
  );
}
