import * as Types from "@/lib/api/generated/fetch-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { CounterOfferCreateModal } from "@/components/superagent/contracts/CounterOfferCreateModal";
import {
  useListGuestCounterOffers,
  useCreateGuestCounterOffer,
  useUploadGuestCounterOfferPdf,
  useGetGuestContractView,
} from "@/lib/hooks/use-guest-links";
import { CountersTabContent } from "@/components/superagent/deals/CountersTabContent";
import { useRouter } from "next/navigation";
import { PdfmeEditor } from "@/components/superagent/contracts/PdfmeEditor";
import { createTemplateFromLayout } from "@/components/superagent/contracts/contract-api";
import { motion } from "framer-motion";
import {
  Sparkles,
  FileText,
  Users,
  Loader2,
  Download,
  MessageSquare,
} from "lucide-react";
import { GuestAddendaTabContent } from "@/components/superagent/guest/GuestAddendaTabContent";
import { parseAddendaFromFieldsJson } from "@/lib/utils/addendum-from-fields";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabType = "CONTRACT" | "ADDENDA" | "COUNTERS";

interface GuestWorkspaceProps {
  session: Types.GuestLinkDto;
}

export function GuestWorkspace({ session }: GuestWorkspaceProps) {
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [parentCounter, setParentCounter] =
    useState<Types.CounterOfferDto | null>(null);
  const [viewMode] = useState<"form" | "pdf">("pdf");
  const [activeTab, setActiveTab] = useState<TabType>("CONTRACT");
  const router = useRouter();

  // Fetch counter offers
  const { data: counterOffers = [], isLoading: isLoadingCounters } =
    useListGuestCounterOffers(session.token!, !!session.token);

  const sortedCounters = useMemo(() => {
    return [...counterOffers].sort((a, b) => {
      const dateA = a.createdAt
        ? new Date(a.createdAt).getTime()
        : new Date(0).getTime();
      const dateB = b.createdAt
        ? new Date(b.createdAt).getTime()
        : new Date(0).getTime();
      return dateB - dateA;
    });
  }, [counterOffers]);

  // Check if it's the seller's turn to create a counter offer
  // Seller (guest) can create when:
  // 1. There are no counter offers yet (seller starts)
  // 2. Latest counter offer is from BUYER
  const canSellerCreateCounter = useMemo(() => {
    if (sortedCounters.length === 0) return true; // Seller can start
    const latestCounter = sortedCounters[0];
    return latestCounter.side === "BUYER"; // Seller can respond to buyer's counter
  }, [sortedCounters]);

  const counterButtonDisabledReason = useMemo(() => {
    if (canSellerCreateCounter) return null;
    const latestCounter = sortedCounters[0];
    if (latestCounter?.side === "SELLER") {
      return "Waiting for buyer's response to your counter offer";
    }
    return "Not your turn to counter";
  }, [canSellerCreateCounter, sortedCounters]);

  // Fetch contract view (template + data)
  const { data: contractView, isLoading: isLoadingContract } =
    useGetGuestContractView(session.token!, !!session.token);

  const template = useMemo(() => {
    if (!contractView?.pdfmeLayout) return null;
    return createTemplateFromLayout(contractView.pdfmeLayout);
  }, [contractView?.pdfmeLayout]);

  const contractData = useMemo(() => {
    return contractView?.contractData || {};
  }, [contractView?.contractData]);

  const addendaFromFields = parseAddendaFromFieldsJson(
    contractData ?? undefined
  );
  const jurisdictionCode = session.propertyAddress ? "AZ" : undefined; // TODO: Get from session or contract

  const createCounterMutation = useCreateGuestCounterOffer();
  const uploadMutation = useUploadGuestCounterOfferPdf();

  const handleDownloadPdf = async () => {
    if (!template || !contractData) {
      toast.error("Contract data not available for download");
      return;
    }

    try {
      toast.loading("Generating PDF...", { id: "pdf-download" });

      const { generate } = await import("@pdfme/generator");
      const { getFontsData } = await import("@/lib/helper");
      const { getPlugins } = await import("@/lib/plugins");
      const { convertContractDataToInputs } =
        await import("@/components/superagent/contracts/pdf-input-utils");

      const inputs = convertContractDataToInputs(template, contractData);
      const font = getFontsData();

      const pdf = await generate({
        template,
        inputs,
        options: {
          font,
          lang: "en",
          title: session.propertyAddress || "Contract",
        },
        plugins: getPlugins(),
      });

      const blob = new Blob([pdf.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${session.propertyAddress || "contract"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully", { id: "pdf-download" });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(
        "Failed to generate PDF: " +
          (error instanceof Error ? error.message : "Unknown error"),
        { id: "pdf-download" }
      );
    }
  };

  const handleCreateCounter = (voiceSessionId?: string) => {
    createCounterMutation.mutate(
      {
        x_Guest_Token: session.token!,
        body: new Types.CounterOfferCreateRequest({
          voiceSessionId,
        } as any),
      },
      {
        onSuccess: () => {
          setIsCounterModalOpen(false);
          setParentCounter(null);
          toast.success("Counter offer created successfully");
        },
        onError: (error: any) => {
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
        x_Guest_Token: session.token!,
        body: new Types.CounterOfferCreateRequest({} as any),
      });

      await uploadMutation.mutateAsync({
        x_Guest_Token: session.token!,
        id: counter.id!,
        body: { file } as any,
      });

      setIsCounterModalOpen(false);
      toast.success("Counteroffer uploaded successfully");
    } catch (error) {
      toast.error(
        "Upload failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Modern Gradient Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#0F766E] to-[#115E59] shadow-xl"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-emerald-300" />
                <span className="text-[12px] font-semibold uppercase tracking-wider text-emerald-200">
                  Guest Access
                </span>
              </div>
              <h1 className="text-[24px] sm:text-[28px] font-bold mb-2">
                {session.propertyAddress || "Contract Workspace"}
              </h1>
              <p className="text-[14px] sm:text-[15px] text-white/80">
                Review the contract and submit counter offers
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 text-white hover:bg-white/30 border-white/30">
                {session.guestName || session.guestEmail}
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="p-6 bg-white border border-[#E5E7EB] hover:border-[#0F766E] transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-[#ECFDF5] text-[#0F766E]">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
              Buyer
            </p>
            <h3 className="text-[20px] font-bold text-[#111827] tracking-tight mt-1">
              {session.buyerName || "N/A"}
            </h3>
          </div>

          <div className="p-6 bg-white border border-[#E5E7EB] hover:border-[#0F766E] transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-[#ECFDF5] text-[#0F766E]">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
              Seller
            </p>
            <h3 className="text-[20px] font-bold text-[#111827] tracking-tight mt-1">
              {session.sellerName || "N/A"}
            </h3>
          </div>

          <div className="p-6 bg-white border border-[#E5E7EB] hover:border-[#0F766E] transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-[#ECFDF5] text-[#0F766E]">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <p className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
              Counter Offers
            </p>
            <h3 className="text-[20px] font-bold text-[#111827] tracking-tight mt-1">
              {counterOffers.length}
            </h3>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Content (Tabbed View) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as TabType)}
              className="w-full"
            >
              <div className="bg-white border border-[#E5E7EB] shadow-sm">
                <TabsList className="w-full justify-start border-b border-[#E5E7EB] bg-gray-50/50 rounded-none p-0 h-auto">
                  <TabsTrigger
                    value="CONTRACT"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F766E] data-[state=active]:bg-white px-6 py-3"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Contract
                  </TabsTrigger>
                  <TabsTrigger
                    value="ADDENDA"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F766E] data-[state=active]:bg-white px-6 py-3"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Addenda
                    {addendaFromFields.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 h-5 text-[10px]"
                      >
                        {addendaFromFields.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="COUNTERS"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#0F766E] data-[state=active]:bg-white px-6 py-3"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Counters
                    {counterOffers.length > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 h-5 text-[10px]"
                      >
                        {counterOffers.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="CONTRACT" className="m-0 p-0">
                  <div
                    className="flex flex-col"
                    style={{
                      height: "calc(100vh - 280px)",
                      minHeight: "600px",
                    }}
                  >
                    <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100/50 rounded-lg">
                          <FileText className="h-5 w-5 text-[#0F766E]" />
                        </div>
                        <div>
                          <h2 className="text-sm font-semibold text-gray-900">
                            Original Contract
                          </h2>
                          <p className="text-xs text-gray-500">
                            Read-only view
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                        onClick={handleDownloadPdf}
                        disabled={!template || !contractData}
                      >
                        <Download className="h-3.5 w-3.5 mr-2" />
                        Download PDF
                      </Button>
                    </div>

                    <div className="flex-1 bg-gray-50/30 p-4 overflow-hidden">
                      {isLoadingContract ? (
                        <div className="flex items-center justify-center h-full min-h-[500px]">
                          <div className="text-center space-y-3">
                            <Loader2 className="w-10 h-10 text-[#0F766E] animate-spin mx-auto" />
                            <p className="text-sm font-medium text-gray-600">
                              Loading contract...
                            </p>
                          </div>
                        </div>
                      ) : template && contractData ? (
                        <div className="h-full bg-white shadow-sm border border-gray-100 overflow-hidden">
                          <PdfmeEditor
                            template={template}
                            contractData={contractData}
                            viewMode={viewMode}
                            readOnly={true}
                            zoomLevel={1.0}
                            onDataChange={() => {}}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full min-h-[500px] border-2 border-dashed border-gray-200 m-4 rounded-xl">
                          <div className="text-center">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">
                              Contract not available
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="ADDENDA" className="m-0 p-6">
                  <GuestAddendaTabContent
                    contractData={contractData}
                    jurisdictionCode={jurisdictionCode}
                  />
                </TabsContent>

                <TabsContent value="COUNTERS" className="m-0 p-6">
                  {counterOffers.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-sm text-gray-500">
                        No counter offers yet.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Start by creating one using the options on the right.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      <CountersTabContent
                        counters={sortedCounters as any}
                        isLoading={isLoadingCounters}
                        onCounterClick={(counter) => {
                          if (counter.id) {
                            router.push(
                              `/guest/${session.token}/counteroffers/${counter.id}`
                            );
                          }
                        }}
                        onCounter={(counter) => {
                          setParentCounter(counter as any);
                          setIsCounterModalOpen(true);
                        }}
                        compact={true}
                        onlyAllowReplyToLatest={true}
                        userSide="SELLER"
                      />
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>

          {/* Sidebar (Actions & History) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Actions Card */}
            <div className="bg-white border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="p-4 bg-[#0F766E] text-white">
                <h2 className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Response Options
                </h2>
              </div>
              <div className="p-5 space-y-3">
                {canSellerCreateCounter ? (
                  <p className="text-xs text-gray-500 mb-2">
                    Choose how you want to respond to this offer:
                  </p>
                ) : (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-none mb-2">
                    <MessageSquare className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">
                      {counterButtonDisabledReason}
                    </p>
                  </div>
                )}
                <Button
                  className="w-full justify-start bg-emerald-50 hover:bg-emerald-100 text-[#0F766E] border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-50"
                  variant="ghost"
                  disabled={!canSellerCreateCounter}
                  onClick={() => {
                    setParentCounter(null);
                    setIsCounterModalOpen(true);
                  }}
                >
                  <FileText className="h-4 w-4 mr-3" />
                  Draft Counter Offer
                </Button>
              </div>
            </div>
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
        guestToken={session.token!}
      />
    </div>
  );
}
