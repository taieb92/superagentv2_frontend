"use client";

import { listItem, subtleHover } from "@/components/superagent/motion/motion";
import type { IDealListDto } from "@/lib/api/generated/fetch-client";
import { formatDistanceToNowStrict } from "date-fns";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import Link from "next/link";
import { StatusPill } from "./StatusPill";

export function DealCard({ deal }: Readonly<{ deal: IDealListDto }>) {
  const metaParts = [
    deal.buyerName ? `Buyer: ${deal.buyerName}` : null,
    deal.sellerName ? `Seller: ${deal.sellerName}` : null,
    deal.mlsId ? `MLS: ${deal.mlsId}` : null,
  ].filter(Boolean);

  const updatedAt = (() => {
    if (deal.updatedAtISO instanceof Date) return deal.updatedAtISO;
    if (deal.updatedAtISO)
      return new Date(deal.updatedAtISO as unknown as string);
    return null;
  })();
  const lastUpdated = updatedAt
    ? formatDistanceToNowStrict(updatedAt, { addSuffix: true })
    : null;

  return (
    <motion.div variants={listItem} {...subtleHover}>
      <Link
        href={`/dashboard/deals/${deal.id ?? ""}`}
        className="block min-h-[140px] rounded-none border border-[#E5E7EB] bg-white p-5 sm:p-6 shadow-sm transition-shadow hover:shadow hover:border-[#D1D5DB]"
      >
        <div className="flex flex-row items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-[#111827]">
              {deal.addressLine}
            </div>
            {deal.cityState ? (
              <div className="mt-1 text-xs sm:text-sm text-[#6B7280] truncate">
                {deal.cityState}
              </div>
            ) : null}
          </div>
          <StatusPill status={deal.status ?? "DRAFT"} />
        </div>

        <div className="mt-3 line-clamp-2 text-xs sm:text-sm text-[#6B7280]">
          {metaParts.length ? metaParts.join(" • ") : "—"}
        </div>

        {lastUpdated ? (
          <div className="mt-3 flex items-center gap-1.5 text-[12px] text-[#9CA3AF]">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {lastUpdated}
          </div>
        ) : null}
      </Link>
    </motion.div>
  );
}
