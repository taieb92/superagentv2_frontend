"use client";

import { ContractHeader } from "@/components/superagent/contracts/ContractHeader";
import { DocumentEditor } from "@/components/superagent/contracts/DocumentEditor";
import { PageShell } from "@/components/superagent/shell/PageShell";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useGetDealQuery } from "@/lib/api/generated/fetch-client/Query";
import { useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import { ChevronRight, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Suspense } from "react";

function BbaDetailsContent() {
  const params = useParams();
  const { user } = useUser();
  const dealId = params.id as string;

  // Fetch deal data using generated hook
  const { data: deal, isLoading: isLoadingDeal } = useGetDealQuery(dealId, {
    enabled: !!dealId && !!user,
  });

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Download");
  };

  // BBA data with fallbacks
  const bbaData = {
    buyerName: deal?.buyerName || "Loading...",
    status: deal?.status || "DRAFT",
    lastSaved: deal?.updatedAtISO
      ? format(new Date(deal.updatedAtISO), "MMM d, yyyy 'at' h:mm a")
      : "Just now",
  };

  if (isLoadingDeal) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 text-[#0F766E] animate-spin" />
      </div>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col min-h-screen">
        {/* Sticky Header */}
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 sticky top-0 z-30 bg-white">
          <ContractHeader
            address={bbaData.buyerName}
            status={bbaData.status}
            buyerName={bbaData.buyerName}
            lastSaved={bbaData.lastSaved}
            onDownload={handleDownload}
            missingFieldsCount={1}
          />
        </div>

        <div className="flex flex-col flex-1 min-h-0 max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Breadcrumbs */}
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "BBAs", href: "/dashboard/bbas" },
              { label: bbaData.buyerName, current: true },
            ]}
          />

          {/* Full-width document area (same layout as contract details) */}
          <div className="flex flex-col flex-1 min-h-0 w-full">
            {/* Page Navigator */}
            <div className="flex items-center gap-2 text-[12px] font-medium text-[#6B7280] shrink-0">
              <span className="text-[#111827]">Page 1</span>
              <ChevronRight className="w-3 h-3" />
              <span>Buyer Representation Agreement</span>
            </div>

            {/* Document editor - flex-1 for proper PDF margin/space and zoom (same as contract) */}
            <div className="flex flex-col flex-1 min-h-[70vh] mt-6 sm:mt-8">
              <DocumentEditor />
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function BbaDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-[#F8F9FB]">
          <Loader2 className="w-6 h-6 text-[#0F766E] animate-spin" />
        </div>
      }
    >
      <BbaDetailsContent />
    </Suspense>
  );
}
