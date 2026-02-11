"use client";

import { listContainer } from "@/components/superagent/motion/motion";
import { PageShell } from "@/components/superagent/shell/PageShell";
import { DealCard } from "@/components/superagent/ui/DealCard";
import { FiltersBar } from "@/components/superagent/ui/FiltersBar";
import { useListDealsQuery } from "@/lib/api/generated/fetch-client/Query";
import type { DealListDto } from "@/lib/api/generated/fetch-client";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

export default function DealsPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updated");

  // Fetch purchase contracts only (filter by document type)
  const { data: dealsResponse, isLoading } = useListDealsQuery(
    statusFilter === "all" ? undefined : statusFilter,
    searchQuery || undefined,
    undefined, // limit
    undefined, // offset
    "CONTRACT", // docType: only deals that have a purchase contract document
    {
      enabled: !!user,
    }
  );

  const deals: DealListDto[] = useMemo(
    () => dealsResponse?.items ?? [],
    [dealsResponse?.items]
  );

  // Filter and sort deals
  const filteredDeals = useMemo(() => {
    let filtered: DealListDto[] = [...deals];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (deal) =>
          deal.addressLine?.toLowerCase().includes(query) ||
          deal.buyerName?.toLowerCase().includes(query) ||
          deal.mlsId?.toLowerCase().includes(query)
      );
    }

    // Status filter (API: DRAFT, WAITING_SIGNATURE, COMPLETED, BLOCKED)
    if (statusFilter !== "all") {
      filtered = filtered.filter((deal) => {
        const status = deal.status ?? "";
        if (statusFilter === "DRAFT") return status === "DRAFT";
        if (statusFilter === "WAITING") return status === "WAITING_SIGNATURE";
        if (statusFilter === "COMPLETED") return status === "COMPLETED";
        return true;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = a.updatedAtISO ? new Date(a.updatedAtISO).getTime() : 0;
      const dateB = b.updatedAtISO ? new Date(b.updatedAtISO).getTime() : 0;
      if (sortBy === "updated" || sortBy === "created") return dateB - dateA;
      if (sortBy === "status")
        return (a.status ?? "").localeCompare(b.status ?? "");
      return 0;
    });

    return filtered;
  }, [deals, searchQuery, statusFilter, sortBy]);

  const stats = {
    drafts: deals.filter((d) => (d.status ?? "") === "DRAFT").length,
    sent: deals.filter((d) => (d.status ?? "") === "WAITING_SIGNATURE").length,
  };

  return (
    <PageShell>
      <div className="space-y-8 max-w-[1360px] mx-auto px-4 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-[24px] font-semibold text-[#111827]">
              Purchase Contracts
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

        {/* FILTERS */}
        <FiltersBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {/* CARD LIST */}
        <div className="min-h-[400px]">
          {(() => {
            if (isLoading) {
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }, (_, i) => (
                    <div
                      key={`deal-skeleton-${i}`}
                      className="h-[160px] rounded-none border border-[#E5E7EB] bg-white animate-pulse"
                    />
                  ))}
                </div>
              );
            }
            if (filteredDeals.length === 0) {
              const emptyMessage =
                deals.length === 0
                  ? "No purchase contracts found."
                  : "No contracts match your filters.";
              return (
                <div className="py-12 text-center">
                  <p className="text-[14px] text-[#6B7280]">{emptyMessage}</p>
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
                {filteredDeals.map((deal) => (
                  <DealCard key={deal.id ?? ""} deal={deal} />
                ))}
              </motion.div>
            );
          })()}
        </div>
      </div>
    </PageShell>
  );
}
