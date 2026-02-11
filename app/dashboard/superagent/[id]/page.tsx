"use client";

import { ChecklistPanel } from "@/components/superagent/contracts/ChecklistPanel";
import { ContractHeader } from "@/components/superagent/contracts/ContractHeader";
import { DocumentEditor } from "@/components/superagent/contracts/DocumentEditor";
import { PageShell } from "@/components/superagent/shell/PageShell";
import { EmptyState } from "@/components/superagent/ui/EmptyState";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, FileStack, History, Loader2, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";

// Mock Data for UI demonstration
const MOCK_CHECKLIST_ITEMS = [
  {
    id: "1",
    label: "Escrow Company",
    type: "MISSING" as const,
    description: "Required for CA standard",
  },
  {
    id: "2",
    label: "Earnest Amount",
    type: "MISSING" as const,
    description: "Missing from voice session",
  },
  {
    id: "3",
    label: "Buyer Name",
    type: "INFO" as const,
    description: "Confidence: 98% (Voice)",
  },
  {
    id: "4",
    label: "Closing Date > 45 Days",
    type: "WARNING" as const,
    description: "Review contingency periods",
  },
];

function ContractDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("CONTRACT");

  // Mock deal data
  const deal = {
    addressLine: "123 Maple Street, Los Angeles, CA",
    status: "DRAFT",
    buyerName: "Jane Doe",
    lastSaved: "2 mins ago",
  };

  const handleDownload = () => console.log("Download");

  return (
    <PageShell>
      <div className="flex flex-col min-h-screen">
        {/* Sticky Header */}
        <div className="-mx-6 sm:-mx-8 -mt-6 sm:-mt-8 sticky top-0 z-30">
          <ContractHeader
            address={deal.addressLine}
            status={deal.status}
            buyerName={deal.buyerName}
            lastSaved={deal.lastSaved}
            onDownload={handleDownload}
            missingFieldsCount={2}
          />
        </div>

        <div className="max-w-[1360px] mx-auto w-full px-4 lg:px-8 py-8 space-y-8">
          {/* Breadcrumbs */}
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Purchase Contracts", href: "/dashboard/deals" },
              { label: deal.addressLine, current: true },
            ]}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Main Content (Tabs + Document) */}
            <div className="lg:col-span-9 space-y-8">
              {/* Tabs */}
              <div className="flex items-center justify-between border-b border-[#E5E7EB]">
                <div className="flex gap-8 overflow-x-auto">
                  <TabButton
                    active={activeTab === "CONTRACT"}
                    onClick={() => setActiveTab("CONTRACT")}
                    label="Purchase Contract"
                  />
                  <TabButton
                    active={activeTab === "ADDENDA"}
                    onClick={() => setActiveTab("ADDENDA")}
                    label="Addenda"
                    count={0}
                  />
                  <TabButton
                    active={activeTab === "COUNTERS"}
                    onClick={() => setActiveTab("COUNTERS")}
                    label="Counters"
                    count={1}
                  />
                </div>

                {activeTab !== "CONTRACT" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mb-2 text-[#0F766E] font-semibold hover:bg-[#ECFDF5] gap-2 rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                    New {activeTab === "ADDENDA" ? "Addendum" : "Counter"}
                  </Button>
                )}
              </div>

              {/* Tab Content */}
              <div className="min-h-[600px]">
                {/* Contract Tab - Always mounted, hidden when inactive */}
                <div
                  className={cn(
                    "space-y-6",
                    activeTab !== "CONTRACT" && "hidden"
                  )}
                >
                  {/* Page Navigator Placeholder */}
                  <div className="flex items-center gap-2 text-[12px] font-medium text-[#6B7280]">
                    <span className="text-[#111827]">Page 1</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>Parties & Offer</span>
                  </div>
                  <DocumentEditor />
                </div>

                {/* Addenda Tab */}
                {activeTab === "ADDENDA" && (
                  <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-12">
                    <EmptyState
                      icon={<FileStack className="w-8 h-8 text-[#9CA3AF]" />}
                      title="No addenda documents found."
                      description="Click the button above to start a voice session for an addendum."
                    />
                  </div>
                )}

                {/* Counters Tab */}
                {activeTab === "COUNTERS" && (
                  <div className="space-y-4">
                    <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-6 flex items-center justify-between group hover:border-[#0F766E]/30 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg flex items-center justify-center text-[#9CA3AF]">
                          <History className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#111827]">
                            Counter Offer #1
                          </p>
                          <p className="text-[12px] text-[#6B7280]">
                            Created Jan 21, 2026 • 2:30 PM
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-[#0F766E] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                          DRAFT
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#D1D5DB] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel (Checklist) */}
            <div className="lg:col-span-3 space-y-6">
              <ChecklistPanel items={MOCK_CHECKLIST_ITEMS} />

              <div className="bg-[#111827] rounded-[10px] p-6 text-white space-y-4 shadow-lg shadow-black/5">
                <div className="space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
                    Review Summary
                  </p>
                  <p className="text-[16px] font-semibold font-serif italic text-blue-100">
                    Almost ready to send.
                  </p>
                </div>
                <p className="text-[12px] text-zinc-400 leading-relaxed">
                  2 required fields remain. AI extraction confidence is high for
                  all major terms.
                </p>
                <Button className="w-full bg-white hover:bg-zinc-100 text-[#111827] font-bold h-11 rounded-lg">
                  Finalize for Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "pb-4 text-[14px] font-semibold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 px-1",
        active
          ? "border-[#0F766E] text-[#0F766E]"
          : "border-transparent text-[#6B7280] hover:text-[#4B5563] hover:border-[#D1D5DB]"
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "text-[10px] px-1.5 py-0.5 rounded-md",
            active
              ? "bg-[#ECFDF5] text-[#0F766E]"
              : "bg-[#F3F4F6] text-[#6B7280]"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export default function ContractDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-[#F8F9FB]">
          <Loader2 className="w-6 h-6 text-[#0F766E] animate-spin" />
        </div>
      }
    >
      <ContractDetailsContent />
    </Suspense>
  );
}
