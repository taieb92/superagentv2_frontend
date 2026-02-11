"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  MessageSquare,
  Loader2,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CounterOfferCreateModal } from "@/components/superagent/contracts/CounterOfferCreateModal";
import {
  useGetGuestCounterOffer,
  useCreateGuestCounterOffer,
  useUploadGuestCounterOfferPdf,
  useListGuestCounterOffers,
} from "@/lib/hooks/use-guest-links";
import * as Types from "@/lib/api/generated/fetch-client";
import { toast } from "sonner";

export default function GuestCounterOfferPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const counterId = params.id as string;

  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);

  // Fetch counter offer data
  const { data: counterOffer, isLoading: isLoadingCounter } =
    useGetGuestCounterOffer(token, counterId, !!token && !!counterId);

  // Fetch all counter offers to determine if this is the newest one
  const { data: allCounterOffers } = useListGuestCounterOffers(token, !!token);

  const createCounterMutation = useCreateGuestCounterOffer();
  const uploadMutation = useUploadGuestCounterOfferPdf();

  const handleCreateCounter = (voiceSessionId?: string) => {
    createCounterMutation.mutate(
      {
        x_Guest_Token: token,
        body: new Types.CounterOfferCreateRequest({
          voiceSessionId: voiceSessionId || undefined,
        }),
      },
      {
        onSuccess: (newCounter) => {
          setIsCounterModalOpen(false);
          toast.success("Counter offer created successfully");
          if (newCounter.id) {
            router.push(`/guest/${token}/counteroffers/${newCounter.id}`);
          }
        },
        onError: (error: unknown) => {
          toast.error(
            "Failed to create counter offer: " +
              (error instanceof Error ? error.message : "Unknown error")
          );
        },
      }
    );
  };

  const handleUploadCounter = async (file: File) => {
    try {
      const counter = await createCounterMutation.mutateAsync({
        x_Guest_Token: token,
        body: new Types.CounterOfferCreateRequest({}),
      });

      await uploadMutation.mutateAsync({
        x_Guest_Token: token,
        id: counter.id!,
        body: { file },
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

  if (isLoadingCounter) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 text-[#0F766E] animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-600">
            Loading counter offer...
          </p>
        </div>
      </div>
    );
  }

  if (!counterOffer) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Counter offer not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push(`/guest/${token}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workspace
          </Button>
        </div>
      </div>
    );
  }

  const sideLabel = counterOffer.side === "BUYER" ? "Buyer" : "Seller";
  const sideColor =
    counterOffer.side === "BUYER"
      ? "bg-blue-50 text-blue-700"
      : "bg-green-50 text-green-700";

  // Determine if this is the newest counter offer
  const isNewestCounterOffer = (() => {
    if (!allCounterOffers || allCounterOffers.length === 0) return false;

    // Find the counter offer with the highest sequence number
    const newestCounter = allCounterOffers.reduce((max, current) => {
      const maxSeq = max.sequenceNumber || 0;
      const currentSeq = current.sequenceNumber || 0;
      return currentSeq > maxSeq ? current : max;
    }, allCounterOffers[0]);

    return newestCounter?.id === counterOffer.id;
  })();

  // Can only counter if it's from BUYER side AND it's the newest counter offer
  const canCounterThisOffer =
    counterOffer.side === "BUYER" && isNewestCounterOffer;

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Modern Gradient Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#0F766E] to-[#115E59] shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col gap-4">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 w-fit"
              onClick={() => router.push(`/guest/${token}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Workspace
            </Button>

            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-emerald-300" />
                <span className="text-[12px] font-semibold uppercase tracking-wider text-emerald-200">
                  Counter Offer #{counterOffer.sequenceNumber}
                </span>
              </div>
              <h1 className="text-[24px] sm:text-[28px] font-bold mb-2">
                {counterOffer.description ||
                  `Counter Offer #${counterOffer.sequenceNumber}`}
              </h1>
              <div className="flex items-center gap-3 text-[14px] text-white/80">
                <Badge className={`${sideColor} border-0`}>
                  {sideLabel} Counter
                </Badge>
                {counterOffer.createdAt && (
                  <span>
                    Created{" "}
                    {new Date(counterOffer.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb for parent counter */}
        {counterOffer.parentCounterOfferId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6"
          >
            <div className="bg-white border border-[#E5E7EB] p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>In response to:</span>
                <button
                  onClick={() =>
                    router.push(
                      `/guest/${token}/counteroffers/${counterOffer.parentCounterOfferId}`
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
                <div className="h-[calc(100vh-250px)] min-h-[600px]">
                  <iframe
                    src={counterOffer.uploadedPdfUrl}
                    className="w-full h-full border border-gray-200"
                    title="Counter Offer PDF"
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
              </div>
            </div>

            {/* Only show actions if this is a BUYER counter AND it's the newest counter offer */}
            {canCounterThisOffer && (
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
      </main>

      <CounterOfferCreateModal
        open={isCounterModalOpen}
        onOpenChange={setIsCounterModalOpen}
        onSubmit={handleCreateCounter}
        onUpload={handleUploadCounter}
        isCreating={createCounterMutation.isPending}
        isUploading={uploadMutation.isPending}
        isAgent={false}
        guestToken={token}
      />
    </div>
  );
}
