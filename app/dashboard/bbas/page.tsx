"use client";

import { listContainer } from "@/components/superagent/motion/motion";
import { PageShell } from "@/components/superagent/shell/PageShell";
import { BbaCard, type BbaListItem } from "@/components/superagent/ui/BbaCard";
import { FiltersBar } from "@/components/superagent/ui/FiltersBar";
import { useListDealsQuery } from "@/lib/api/generated/fetch-client/Query";
import type { DealListDto } from "@/lib/api/generated/fetch-client";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

export default function BbasPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");

  // Fetch BBAs only (filter by document type)
  const { data: dealsResponse, isLoading } = useListDealsQuery(
    undefined, // status
    undefined, // search
    undefined, // limit
    undefined, // offset
    "BBA", // docType: only deals that have a BBA document
    {
      enabled: !!user,
    }
  );

  // Transform to BBA format (same API, different list shape for card UX)
  const bbas: BbaListItem[] = useMemo(() => {
    if (!dealsResponse?.items) return [];
    return dealsResponse.items.map((item: DealListDto) => ({
      id: item.id || "",
      buyerName: item.buyerName || "Unnamed Buyer",
      status: item.status ?? "DRAFT",
      updatedAtISO: item.updatedAtISO?.toISOString() || "",
    }));
  }, [dealsResponse]);

  const filteredBbas = useMemo(() => {
    let filtered = [...bbas];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((bba) =>
        bba.buyerName?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((bba) => {
        if (statusFilter === "DRAFT") return bba.status === "DRAFT";
        if (statusFilter === "WAITING")
          return bba.status === "WAITING_SIGNATURE";
        if (statusFilter === "COMPLETED") return bba.status === "COMPLETED";
        return true;
      });
    }

    filtered.sort((a, b) => {
      const dateA = a.updatedAtISO ? new Date(a.updatedAtISO).getTime() : 0;
      const dateB = b.updatedAtISO ? new Date(b.updatedAtISO).getTime() : 0;
      return dateB - dateA;
    });

    return filtered;
  }, [bbas, searchQuery, statusFilter, sortBy]);

  const stats = {
    drafts: bbas.filter((b) => b.status === "DRAFT").length,
    sent: bbas.filter((b) => b.status === "WAITING_SIGNATURE").length,
  };

  return (
    <PageShell>
      <div className="space-y-8 max-w-[1360px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-[24px] font-semibold text-[#111827]">
              Buyer Brokerage Agreements
            </h1>
            <div className="flex items-center gap-4 text-[13px] text-[#6B7280]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>{stats.drafts} drafts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{stats.sent} sent for signature</span>
              </div>
            </div>
          </div>
        </div>

        <FiltersBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* CARD LIST (same layout as Purchase Contracts) */}
        <div className="min-h-[400px]">
          {(() => {
            if (isLoading) {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={`bba-skeleton-${i}`}
                      className="h-[160px] rounded-none border border-[#E5E7EB] bg-white animate-pulse"
                    />
                  ))}
                </div>
              );
            }
            if (filteredBbas.length === 0) {
              const emptyMessage =
                bbas.length === 0
                  ? "No BBAs found."
                  : "No BBAs match your filters.";
              return (
                <div className="py-12 text-center text-[14px] text-[#6B7280]">
                  {emptyMessage}
                </div>
              );
            }
            return (
              <motion.div
                variants={listContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredBbas.map((bba) => (
                  <BbaCard key={bba.id} bba={bba} />
                ))}
              </motion.div>
            );
          })()}
        </div>
      </div>
    </PageShell>
  );
}
