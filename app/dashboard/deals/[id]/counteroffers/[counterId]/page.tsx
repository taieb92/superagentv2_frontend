"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MessageSquare,
  Loader2,
  FileText,
  ChevronRight,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { PdfmeEditor } from "@/components/superagent/contracts/PdfmeEditor";
import { CounterOfferCreateModal } from "@/components/superagent/contracts/CounterOfferCreateModal";
import { PageShell } from "@/components/superagent/shell/PageShell";
import {
  useCounterOffer,
  useCounterOffers,
  useCreateCounterOffer,
  useUploadCounterOfferPdf,
} from "@/lib/hooks/use-counter-offers";
import { useGetDealQuery } from "@/lib/api/generated/fetch-client/Query";
import * as Types from "@/lib/api/generated/fetch-client";
import { toast } from "sonner";
import { createTemplateFromLayout } from "@/components/superagent/contracts/contract-api";
import { useUser } from "@clerk/nextjs";

function CounterOfferDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const dealId = params.id as string;
  const counterId = params.counterId as string;

  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [viewMode] = useState<"form" | "pdf">("pdf");

  // Fetch deal data
  const { data: deal, isLoading: isLoadingDeal } = useGetDealQuery(dealId, {
    enabled: !!dealId && !!user,
  });

  // Fetch counter offer data
  const { data: counterOffer, isLoading: isLoadingCounter } = useCounterOffer(
    counterId,
    !!counterId && !!user
  );

  // Fetch all counter offers for this deal to check if this is the latest
  const { data: allCounterOffers = [] } = useCounterOffers(
    dealId,
    !!dealId && !!user
  );

  // Check if this is the latest SELLER counter offer
  const isLatestSellerCounter = useMemo(() => {
    if (!counterOffer || counterOffer.side !== "SELLER") return false;

    // Filter SELLER counters and sort by creation date
    const sellerCounters = allCounterOffers
      .filter((c) => c.side === "SELLER")
      .sort((a, b) => {
        const dateA = a.createdAt
          ? new Date(a.createdAt).getTime()
          : new Date(0).getTime();
        const dateB = b.createdAt
          ? new Date(b.createdAt).getTime()
          : new Date(0).getTime();
        return dateB - dateA;
      });

    // Check if this counter is the most recent SELLER counter
    return sellerCounters.length > 0 && sellerCounters[0].id === counterId;
  }, [counterOffer, allCounterOffers, counterId]);

  const createCounterMutation = useCreateCounterOffer(dealId);
  const uploadMutation = useUploadCounterOfferPdf(dealId);

  // Extract template and data from counter offer
  const template = useMemo(() => {
    if (!counterOffer?.fieldsJson) return null;
    // TODO: Template should come from the deal's template, not from counter offer
    return null;
  }, [counterOffer?.fieldsJson]);

  const contractData = useMemo(() => {
    return counterOffer?.fieldsJson || {};
  }, [counterOffer?.fieldsJson]);

  const handleCreateCounter = (
    voiceSessionId?: string,
    onBehalfOfSeller?: boolean
  ) => {
    createCounterMutation.mutate(
      new Types.CounterOfferCreateRequest({
        voiceSessionId: voiceSessionId || undefined,
        onBehalfOfSeller: onBehalfOfSeller || undefined,
      }),
      {
        onSuccess: (newCounter) => {
          setIsCounterModalOpen(false);
          toast.success("Counter offer created successfully");
          if (newCounter.id) {
            router.push(
              `/dashboard/deals/${dealId}/counteroffers/${newCounter.id}`
            );
          }
        },
        onError: (error: unknown) => {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          toast.error(`Failed to create counter offer: ${errorMessage}`);
        },
      }
    );
  };

  const handleUploadCounter = async (
    file: File,
    onBehalfOfSeller?: boolean
  ) => {
    try {
      const counter = await createCounterMutation.mutateAsync(
        new Types.CounterOfferCreateRequest({
          onBehalfOfSeller: onBehalfOfSeller || undefined,
        })
      );

      await uploadMutation.mutateAsync({
        id: counter.id!,
        body: { file } as any,
      });

      setIsCounterModalOpen(false);
      toast.success("Counter offer uploaded successfully");
    } catch (error) {
      toast.error(
        "Upload failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      throw error;
    }
  };

  const isLoading = isLoadingDeal || isLoadingCounter;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 text-[#0F766E] animate-spin" />
      </div>
    );
  }

  if (!counterOffer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Counter offer not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(`/dashboard/deals/${dealId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deal
          </Button>
        </div>
      </div>
    );
  }

  const sideLabel = counterOffer.side === "BUYER" ? "Buyer" : "Seller";
  const sideColor =
    counterOffer.side === "BUYER"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : "bg-green-50 text-green-700 border-green-200";

  return (
    <PageShell>
      <div className="space-y-6">
        {/* Breadcrumbs */}
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Purchase Contracts", href: "/dashboard/deals" },
            {
              label: deal?.addressLine || "Deal",
              href: `/dashboard/deals/${dealId}`,
            },
            {
              label: `Counter Offer #${counterOffer.sequenceNumber}`,
              current: true,
            },
          ]}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-[#E5E7EB] p-6"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-[24px] font-bold text-[#111827]">
                  Counter Offer #{counterOffer.sequenceNumber}
                </h1>
                <Badge className={`${sideColor}`}>{sideLabel} Counter</Badge>
              </div>
              {counterOffer.description && (
                <p className="text-[14px] text-gray-600">
                  {counterOffer.description}
                </p>
              )}
              {counterOffer.createdAt && (
                <p className="text-[12px] text-gray-500 mt-1">
                  Created {new Date(counterOffer.createdAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/deals/${dealId}`)}
                variant="ghost"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Deal
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Breadcrumb for parent counter */}
        {counterOffer.parentCounterOfferId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="bg-white border border-[#E5E7EB] p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>In response to:</span>
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/deals/${dealId}/counteroffers/${counterOffer.parentCounterOfferId}`
                    )
                  }
                  className="text-[#0F766E] hover:underline font-medium"
                >
                  Counter Offer (Parent)
                </button>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-gray-900">
                  Current Counter
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Counter Offer PDF) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white border border-[#E5E7EB] p-6 min-h-[600px]">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Counter Offer Document
              </h2>

              {counterOffer.uploadedPdfUrl ? (
                <div className="h-[700px]">
                  <iframe
                    src={counterOffer.uploadedPdfUrl}
                    className="w-full h-full border border-gray-200"
                    title="Counter Offer PDF"
                  />
                </div>
              ) : template && contractData ? (
                <div className="h-[700px]">
                  <PdfmeEditor
                    template={template}
                    contractData={contractData}
                    viewMode={viewMode}
                    onDataChange={() => {}}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[600px] border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">
                      Counter offer document not available
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar (Metadata & Actions) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="bg-white border border-[#E5E7EB] p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Details
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-500">Sequence Number:</span>
                  <p className="font-medium text-gray-900">
                    #{counterOffer.sequenceNumber}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Side:</span>
                  <p className="font-medium text-gray-900">{sideLabel}</p>
                </div>
                {counterOffer.description && (
                  <div>
                    <span className="text-gray-500">Description:</span>
                    <p className="font-medium text-gray-900">
                      {counterOffer.description}
                    </p>
                  </div>
                )}
                {counterOffer.createdAt && (
                  <div>
                    <span className="text-gray-500">Created:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(counterOffer.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {counterOffer.updatedAt && (
                  <div>
                    <span className="text-gray-500">Last Updated:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(counterOffer.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Only show actions if this is the latest SELLER counter (agent is BUYER, can only counter the most recent SELLER offer) */}
            {isLatestSellerCounter && (
              <div className="bg-white border border-[#E5E7EB] p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Actions
                </h2>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white"
                    size="lg"
                    onClick={() => setIsCounterModalOpen(true)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Counter this Offer
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      toast.info("Accept functionality coming soon");
                    }}
                  >
                    Accept Offer
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <CounterOfferCreateModal
        open={isCounterModalOpen}
        onOpenChange={setIsCounterModalOpen}
        onSubmit={handleCreateCounter}
        onUpload={handleUploadCounter}
        isCreating={createCounterMutation.isPending}
        isUploading={uploadMutation.isPending}
        isAgent={true}
      />
    </PageShell>
  );
}

export default function CounterOfferDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-[#F8F9FB]">
          <Loader2 className="w-6 h-6 text-[#0F766E] animate-spin" />
        </div>
      }
    >
      <CounterOfferDetailsContent />
    </Suspense>
  );
}
