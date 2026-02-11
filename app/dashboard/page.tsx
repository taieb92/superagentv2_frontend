"use client";

import { PageShell } from "@/components/superagent/shell/PageShell";
import { SectionHeader } from "@/components/superagent/shell/SectionHeader";
import { ActivityList } from "@/components/superagent/ui/ActivityList";
import { StatCard } from "@/components/superagent/ui/StatCard";
import { RecentVoiceSessions } from "@/components/superagent/voice/RecentVoiceSessions";
import { Button } from "@/components/ui/button";
import type { DealListDto } from "@/lib/api/generated/fetch-client";
import type { IActivityDto } from "@/components/superagent/ui/ActivityList";
import { useListDealsQuery } from "@/lib/api/generated/fetch-client/Query";
import { getStartOfThisMonth, mostRecentBy } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, Briefcase, FileText, Mic, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export default function DashboardPage() {
  const { user } = useUser();

  const { data: dealsResponse, isLoading } = useListDealsQuery(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    { enabled: !!user }
  );

  const deals: DealListDto[] = useMemo(
    () => dealsResponse?.items ?? [],
    [dealsResponse?.items]
  );

  const toTime = (d: Date | string | undefined) =>
    d ? new Date(d).getTime() : 0;

  const completedThisMonth = useMemo(() => {
    const start = getStartOfThisMonth();
    return deals.filter(
      (d) => d.status === "COMPLETED" && toTime(d.updatedAtISO) >= start
    ).length;
  }, [deals]);

  const activityData = useMemo((): IActivityDto[] => {
    const byNewest = [...deals].sort(
      (a, b) => toTime(b.updatedAtISO) - toTime(a.updatedAtISO)
    );
    return byNewest.slice(0, 5).map((deal: DealListDto) => ({
      id: `act-${deal.id}`,
      label: deal.addressLine,
      timestampISO: deal.updatedAtISO,
      tone: "NEUTRAL",
    }));
  }, [deals]);

  const lastPurchaseDeal = useMemo(
    () =>
      mostRecentBy(
        deals.filter((d) => d.docType === "CONTRACT"),
        (d) =>
          d.updatedAtISO instanceof Date
            ? d.updatedAtISO.toISOString()
            : (d.updatedAtISO ?? "")
      ),
    [deals]
  );

  const lastBBADeal = useMemo(
    () =>
      mostRecentBy(
        deals.filter((d) => d.docType === "BBA"),
        (d) =>
          d.updatedAtISO instanceof Date
            ? d.updatedAtISO.toISOString()
            : (d.updatedAtISO ?? "")
      ),
    [deals]
  );

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <PageShell>
      <div className="space-y-8 sm:space-y-10">
        {/* PRIMARY ACTION HERO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#0F766E] to-[#115E59] p-6 sm:p-10 shadow-xl"
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-emerald-300" />
                <span className="text-[12px] font-semibold uppercase tracking-wider text-emerald-200">
                  SuperAgent
                </span>
              </div>
              <h1 className="text-[24px] sm:text-[28px] font-bold mb-2">
                {getGreeting()}, {user?.firstName || "Agent"}
              </h1>
              <p className="text-[14px] sm:text-[15px] text-white/80 max-w-md">
                Start a voice session to capture contract details in real-time
                with AI assistance.
              </p>
            </div>
            <Link href="/dashboard/superagent" className="shrink-0">
              <Button
                size="lg"
                className="w-full sm:w-auto h-14 px-8 bg-white hover:bg-gray-50 text-[#0F766E] text-[15px] font-semibold shadow-lg flex items-center justify-center gap-3 rounded-none transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Mic className="h-5 w-5" />
                Start Voice Session
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* STATS GRID */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <StatCard
            label="In Progress"
            count={deals.filter((d) => d.status === "DRAFT").length}
            active
          />
          <StatCard
            label="Awaiting Signature"
            count={deals.filter((d) => d.status === "WAITING_SIGNATURE").length}
          />
          <StatCard label="Completed This Month" count={completedThisMonth} />
        </motion.div>

        {/* RECENT ACTIVITY + SHORTCUTS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Recent Activity */}
          <div className="lg:col-span-8 space-y-4">
            <SectionHeader title="Recent Activity" />
            {(() => {
              if (isLoading) {
                return (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div
                        key={`skeleton-${i}`}
                        className="h-16 w-full animate-pulse bg-[#F9FAFB] border border-[#E5E7EB]"
                      />
                    ))}
                  </div>
                );
              }
              if (activityData.length === 0) {
                return (
                  <div className="flex h-32 flex-col items-center justify-center border border-dashed border-[#E5E7EB] text-center p-6 bg-white">
                    <p className="text-[13px] text-[#9CA3AF]">
                      No recent activity yet
                    </p>
                    <p className="text-[12px] text-[#9CA3AF] mt-1">
                      Start a voice session to create your first contract
                    </p>
                  </div>
                );
              }
              return <ActivityList items={activityData} />;
            })()}
          </div>

          {/* Quick Shortcuts */}
          <div className="lg:col-span-4 space-y-4">
            <SectionHeader title="Quick Access" />
            <div className="space-y-3">
              {/* Last Purchase Contract */}
              <Link
                href={
                  lastPurchaseDeal
                    ? `/dashboard/deals/${lastPurchaseDeal.id}`
                    : "/dashboard/deals"
                }
                className="group flex items-center gap-4 p-4 border border-[#E5E7EB] bg-white transition-all hover:bg-[#F8F9FB] hover:border-[#D1D5DB] hover:shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] group-hover:border-[#0F766E] group-hover:bg-[#ECFDF5] group-hover:text-[#0F766E] transition-colors">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-[#111827] group-hover:text-[#0F766E]">
                    Last Purchase Contract
                  </p>
                  {lastPurchaseDeal ? (
                    <p className="text-[12px] text-[#6B7280] truncate">
                      {lastPurchaseDeal.addressLine}
                    </p>
                  ) : (
                    <p className="text-[12px] text-[#9CA3AF] italic">
                      No contracts yet
                    </p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#0F766E] transition-colors" />
              </Link>

              {/* Last BBA */}
              <Link
                href={
                  lastBBADeal
                    ? `/dashboard/bbas/${lastBBADeal.id}`
                    : "/dashboard/bbas"
                }
                className="group flex items-center gap-4 p-4 border border-[#E5E7EB] bg-white transition-all hover:bg-[#F8F9FB] hover:border-[#D1D5DB] hover:shadow-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280] group-hover:border-[#0F766E] group-hover:bg-[#ECFDF5] group-hover:text-[#0F766E] transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium text-[#111827] group-hover:text-[#0F766E]">
                    Last BBA
                  </p>
                  {lastBBADeal ? (
                    <p className="text-[12px] text-[#6B7280] truncate">
                      {lastBBADeal.buyerName || "Buyer Brokerage Agreement"}
                    </p>
                  ) : (
                    <p className="text-[12px] text-[#9CA3AF] italic">
                      No BBAs yet
                    </p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#0F766E] transition-colors" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* RECENT VOICE SESSIONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="space-y-4"
        >
          <SectionHeader title="Recent Voice Sessions" />
          <RecentVoiceSessions />
        </motion.div>
      </div>
    </PageShell>
  );
}
