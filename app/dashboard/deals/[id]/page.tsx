"use client";

import { AddendumSelectModal } from "@/components/superagent/contracts/AddendumSelectModal";
import { ContractHeader } from "@/components/superagent/contracts/ContractHeader";
import { CounterOfferCreateModal } from "@/components/superagent/contracts/CounterOfferCreateModal";
import { AddendaTabContent } from "@/components/superagent/deals/AddendaTabContent";
import { ContractTabContent } from "@/components/superagent/deals/ContractTabContent";
import { CountersTabContent } from "@/components/superagent/deals/CountersTabContent";
import { DealTabs } from "@/components/superagent/deals/DealTabs";
import {
  useDealData,
  useFilteredDocuments,
} from "@/components/superagent/deals/useDealData";
import { GuestsTabContent } from "@/components/superagent/deals/GuestsTabContent";
import { GuestInviteModal } from "@/components/superagent/deals/GuestInviteModal";
import * as Types from "@/lib/api/generated/fetch-client";
import { PageShell } from "@/components/superagent/shell/PageShell";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import {
  useGetDealQuery,
  useListDocumentsQuery,
  useCreateDocumentMutation,
  useGetCurrentUserProfileQuery,
  listDocumentsQueryKey,
} from "@/lib/api/generated/fetch-client/Query";
import { fetchContractData } from "@/components/superagent/contracts/contract-api";
import {
  DocumentCreateRequest,
  type DocumentListDto,
  type CounterOfferDto,
} from "@/lib/api/generated/fetch-client";
// import type { CounterOfferDto } from "@/lib/api/types/counter-offer";
import {
  useCounterOffers,
  useCreateCounterOffer,
  useUploadCounterOfferPdf,
} from "@/lib/hooks/use-counter-offers";
import {
  useTemplatesByJurisdiction,
  type TemplateListItem,
} from "@/lib/hooks/use-templates";
import {
  useGuestLinks,
  useCreateGuestLink,
  useRevokeGuestLink,
} from "@/lib/hooks/use-guest-links";
import { parseAddendaFromFieldsJson } from "@/lib/utils/addendum-from-fields";
import { useUser } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useState, useMemo } from "react";
import { toast } from "sonner";

type TabType = "CONTRACT" | "ADDENDA" | "COUNTERS" | "GUESTS";

function ContractDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const dealId = params.id as string;

  const [activeTab, setActiveTab] = useState<TabType>("CONTRACT");
  const [isAddendumModalOpen, setIsAddendumModalOpen] = useState(false);
  const [isCreatingAddendum, setIsCreatingAddendum] = useState(false);
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [parentCounter, setParentCounter] = useState<CounterOfferDto | null>(
    null
  );

  // Fetch deal data using generated hook
  const { data: deal, isLoading: isLoadingDeal } = useGetDealQuery(dealId, {
    enabled: !!dealId && !!user,
  });

  // Fetch documents for this deal (backend derives current user from auth)
  const { data: documents = [], isLoading: isLoadingDocuments } =
    useListDocumentsQuery(dealId, {
      enabled: !!dealId && !!user,
    });

  // Fetch contract data (fieldsJson) for addenda from fieldsJson
  const { data: contractData } = useQuery({
    queryKey: ["contract-data", dealId],
    queryFn: () => fetchContractData(dealId),
    enabled: !!dealId && !!user,
  });

  // Fetch user profile for jurisdiction fallback
  const { data: userProfile } = useGetCurrentUserProfileQuery({
    enabled: !!user,
  });

  // Use custom hooks for data transformation
  const dealData = useDealData(deal, userProfile?.jurisdictionCode);
  const { addenda } = useFilteredDocuments(documents);
  const addendaFromFields = parseAddendaFromFieldsJson(
    contractData ?? undefined
  );
  const addendaCount = addenda.length + addendaFromFields.length;

  // Fetch counter offers from dedicated API
  const { data: counterOffers = [], isLoading: isLoadingCounterOffers } =
    useCounterOffers(dealId, !!dealId && !!user);

  // Sort counters by date (most recent first)
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

  // Fetch guest links
  const { data: guestLinks = [], isLoading: isLoadingGuestLinks } =
    useGuestLinks(dealId, !!dealId && !!user);

  // Create counter offer mutation
  const createCounterMutation = useCreateCounterOffer(dealId);

  // Upload counter offer PDF mutation
  const uploadMutation = useUploadCounterOfferPdf(dealId);

  // Create guest link mutation
  const createGuestLinkMutation = useCreateGuestLink(dealId);

  // Revoke guest link mutation
  const { mutate: revokeGuestLink } = useRevokeGuestLink(dealId);

  // Fetch addenda templates
  const { data: addendaTemplates = [], isLoading: isLoadingAddendaTemplates } =
    useTemplatesByJurisdiction(dealData.jurisdictionCode, "ADDENDA");

  // Create addendum mutation (backend derives current user from auth)
  const createAddendumMutation = useCreateDocumentMutation(dealId, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: listDocumentsQueryKey(dealId),
      });
      setIsAddendumModalOpen(false);
      toast.success("Addendum created successfully");
      setActiveTab("ADDENDA");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to create addendum: ${errorMessage}`);
    },
    onSettled: () => {
      setIsCreatingAddendum(false);
    },
  });

  const handleCreateAddendum = async (addendum: TemplateListItem) => {
    setIsCreatingAddendum(true);
    const request = new DocumentCreateRequest({
      title: addendum.title || addendum.slug || "Addendum",
      type: "ADDENDUM",
      templateId: addendum.id,
      // data is optional, omit it for now
    });
    createAddendumMutation.mutate(request);
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log("Download");
  };

  const handleAddendumClick = (addendum: DocumentListDto) => {
    if (addendum.id) {
      router.push(`/dashboard/deals/${dealId}/documents/${addendum.id}`);
    }
  };

  const handleCounterClick = (counter: CounterOfferDto) => {
    if (counter.id) {
      router.push(`/dashboard/deals/${dealId}/counteroffers/${counter.id}`);
    }
  };

  const handleAddCounter = () => {
    setParentCounter(null);
    setIsCounterModalOpen(true);
  };

  const handleCounterOffer = (counter: CounterOfferDto) => {
    setParentCounter(counter);
    setIsCounterModalOpen(true);
  };

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
        onSuccess: () => {
          setIsCounterModalOpen(false);
          setParentCounter(null);
          toast.success("Counter offer created");
          setActiveTab("COUNTERS");
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
      setParentCounter(null);
      toast.success("Counter offer uploaded successfully");
      setActiveTab("COUNTERS");
    } catch (error) {
      toast.error(
        "Upload failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      throw error;
    }
  };

  const handleCreateGuestLink = (request: Types.GuestLinkCreateRequest) => {
    createGuestLinkMutation.mutate(request, {
      onSuccess: () => {
        setIsGuestModalOpen(false);
        toast.success("Guest magic link generated");
        setActiveTab("GUESTS");
      },
      onError: (error: unknown) => {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast.error(`Failed to generate guest link: ${errorMessage}`);
      },
    });
  };

  const handleRevokeGuestLink = (id: string) => {
    revokeGuestLink(
      { linkId: id },
      {
        onSuccess: () => {
          toast.success("Guest access revoked");
        },
        onError: () => {
          toast.error("Failed to revoke guest access");
        },
      }
    );
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
            address={dealData.addressLine}
            status={dealData.status}
            buyerName={dealData.buyerName}
            lastSaved={dealData.lastSaved}
            onDownload={handleDownload}
            missingFieldsCount={2}
          />
        </div>

        <div className="flex flex-col flex-1 min-h-0 max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Breadcrumbs */}
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Purchase Contracts", href: "/dashboard/deals" },
              { label: dealData.addressLine, current: true },
            ]}
          />

          <div className="flex flex-col flex-1 min-h-0 w-full">
            <DealTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              addendaCount={addendaCount}
              countersCount={sortedCounters.length}
              guestsCount={guestLinks.length}
              onAddAddendum={() => setIsAddendumModalOpen(true)}
              onAddCounter={handleAddCounter}
              onAddGuest={() => setIsGuestModalOpen(true)}
            >
              {activeTab === "CONTRACT" && <ContractTabContent />}
              {activeTab === "ADDENDA" && (
                <AddendaTabContent
                  dealId={dealId}
                  addenda={addenda}
                  isLoading={isLoadingDocuments}
                  onAddendumClick={handleAddendumClick}
                  contractData={contractData ?? undefined}
                  jurisdictionCode={dealData.jurisdictionCode}
                  onContractDataUpdated={(newData) => {
                    queryClient.setQueryData(
                      ["contract-data", dealId],
                      newData
                    );
                  }}
                />
              )}
              {activeTab === "COUNTERS" && (
                <CountersTabContent
                  counters={sortedCounters as CounterOfferDto[]}
                  isLoading={isLoadingCounterOffers}
                  onCounterClick={handleCounterClick}
                  onCounter={handleCounterOffer}
                  userSide="BUYER"
                  onlyAllowReplyToLatest={true}
                />
              )}
              {activeTab === "GUESTS" && (
                <GuestsTabContent
                  guests={guestLinks}
                  isLoading={isLoadingGuestLinks}
                  onInviteClick={() => setIsGuestModalOpen(true)}
                  onRevoke={handleRevokeGuestLink}
                />
              )}
            </DealTabs>
          </div>
        </div>

        {/* Addendum Selection Modal */}
        <AddendumSelectModal
          open={isAddendumModalOpen}
          onOpenChange={setIsAddendumModalOpen}
          addenda={addendaTemplates}
          isLoading={isLoadingAddendaTemplates}
          onSelect={handleCreateAddendum}
          isCreating={isCreatingAddendum}
        />

        {/* Counter Offer Creation Modal */}
        <CounterOfferCreateModal
          open={isCounterModalOpen}
          onOpenChange={setIsCounterModalOpen}
          onSubmit={handleCreateCounter}
          onUpload={handleUploadCounter}
          isCreating={createCounterMutation.isPending}
          isUploading={uploadMutation.isPending}
          isAgent={true}
        />

        {/* Guest Invitation Modal */}
        <GuestInviteModal
          open={isGuestModalOpen}
          onOpenChange={setIsGuestModalOpen}
          onSubmit={handleCreateGuestLink}
          isCreating={createGuestLinkMutation.isPending}
        />
      </div>
    </PageShell>
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
