"use client";

import { CounterCard } from "@/components/superagent/contracts/CounterCard";
import { EmptyState } from "@/components/superagent/ui/EmptyState";
import type { CounterOfferDto } from "@/lib/api/generated/fetch-client";
import { History, Loader2 } from "lucide-react";

interface CountersTabContentProps {
  counters: CounterOfferDto[];
  isLoading: boolean;
  onCounterClick: (counter: CounterOfferDto) => void;
  onCounter?: (counter: CounterOfferDto) => void;
  compact?: boolean;
  userSide?: "BUYER" | "SELLER";
}

export function CountersTabContent({
  counters,
  isLoading,
  onCounterClick,
  onCounter,
  compact = false,
  onlyAllowReplyToLatest = false,
  userSide,
}: CountersTabContentProps & { onlyAllowReplyToLatest?: boolean }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#0F766E] animate-spin" />
      </div>
    );
  }

  if (counters.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-none p-8 sm:p-12">
        <EmptyState
          icon={<History className="w-8 h-8 text-[#9CA3AF]" />}
          title="No counter offers found."
          description="Counter offers will appear here once created."
          primaryActionLabel=""
        />
      </div>
    );
  }

  return (
    <div
      className={compact ? "space-y-0 divide-y divide-gray-100" : "space-y-4"}
    >
      {counters.map((counter, index) => {
        // Only allow countering if:
        // 1. onCounter callback is provided
        // 2. User can counter this offer (counter.side is opposite of userSide)
        // 3. If onlyAllowReplyToLatest is true, only allow for the first counter
        const canCounter =
          onCounter &&
          (!userSide ||
            (userSide === "BUYER" && counter.side === "SELLER") ||
            (userSide === "SELLER" && counter.side === "BUYER")) &&
          (!onlyAllowReplyToLatest || index === 0);

        return (
          <CounterCard
            key={counter.id}
            counter={counter}
            onClick={() => onCounterClick(counter)}
            onCounter={canCounter ? onCounter : undefined}
            compact={compact}
          />
        );
      })}
    </div>
  );
}
