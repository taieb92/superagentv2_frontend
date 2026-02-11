"use client";

import { TabButton } from "@/components/superagent/contracts/TabButton";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type TabType = "CONTRACT" | "ADDENDA" | "COUNTERS" | "GUESTS";

interface DealTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  addendaCount: number;
  countersCount: number;
  guestsCount?: number;
  onAddAddendum: () => void;
  onAddCounter: () => void;
  onAddGuest: () => void;
  children: React.ReactNode;
}

export function DealTabs({
  activeTab,
  onTabChange,
  addendaCount,
  countersCount,
  guestsCount = 0,
  onAddAddendum,
  onAddCounter,
  onAddGuest,
  children,
}: DealTabsProps) {
  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-6 sm:space-y-8">
      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB]">
        <div className="flex gap-4 sm:gap-8 overflow-x-auto pb-2">
          <TabButton
            active={activeTab === "CONTRACT"}
            onClick={() => onTabChange("CONTRACT")}
            label="Purchase Contract"
          />
          <TabButton
            active={activeTab === "ADDENDA"}
            onClick={() => onTabChange("ADDENDA")}
            label="Addenda"
            count={addendaCount}
          />
          <TabButton
            active={activeTab === "COUNTERS"}
            onClick={() => onTabChange("COUNTERS")}
            label="Counters"
            count={countersCount}
          />
          <TabButton
            active={activeTab === "GUESTS"}
            onClick={() => onTabChange("GUESTS")}
            label="Guests"
            count={guestsCount}
          />
        </div>

        {activeTab !== "CONTRACT" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (activeTab === "ADDENDA") {
                onAddAddendum();
              } else if (activeTab === "COUNTERS") {
                onAddCounter();
              } else {
                onAddGuest();
              }
            }}
            className="mb-2 text-[#0F766E] font-semibold hover:bg-[#ECFDF5] gap-2 rounded-none"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">
              New{" "}
              {activeTab === "ADDENDA"
                ? "Addendum"
                : activeTab === "COUNTERS"
                  ? "Counter"
                  : "Guest Link"}
            </span>
            <span className="sm:hidden">New</span>
          </Button>
        )}
      </div>

      {/* Tab Content - fills available space for contract editor */}
      <div className="flex flex-col flex-1 min-h-[70vh]">{children}</div>
    </div>
  );
}
