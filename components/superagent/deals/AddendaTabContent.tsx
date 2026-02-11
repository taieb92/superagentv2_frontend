"use client";

import { useState } from "react";
import { AddendumEditor } from "@/components/superagent/contracts/AddendumEditor";
import { AddendumFromFieldsCardWithTemplate } from "@/components/superagent/deals/AddendumFromFieldsCard";
import { AddendumCard } from "@/components/superagent/contracts/AddendumCard";
import { EmptyState } from "@/components/superagent/ui/EmptyState";
import type { DocumentListDto } from "@/lib/api/generated/fetch-client";
import { parseAddendaFromFieldsJson } from "@/lib/utils/addendum-from-fields";
import { FileStack, Loader2 } from "lucide-react";

interface AddendaTabContentProps {
  dealId: string;
  addenda: DocumentListDto[];
  isLoading: boolean;
  onAddendumClick: (addendum: DocumentListDto) => void;
  contractData?: Record<string, unknown> | null;
  jurisdictionCode?: string;
  onContractDataUpdated?: (data: Record<string, unknown>) => void;
}

export function AddendaTabContent({
  dealId,
  addenda,
  isLoading,
  onAddendumClick,
  contractData,
  jurisdictionCode,
  onContractDataUpdated,
}: AddendaTabContentProps) {
  const [selectedAddendumSlug, setSelectedAddendumSlug] = useState<string | null>(
    null
  );

  const addendaFromFields = parseAddendaFromFieldsJson(contractData ?? undefined);
  const hasAddendaFromFields = addendaFromFields.length > 0;
  const hasDocumentAddenda = addenda.length > 0;
  const isEmpty = !hasAddendaFromFields && !hasDocumentAddenda;

  const selectedAddendum = selectedAddendumSlug
    ? addendaFromFields.find((a) => a.slug === selectedAddendumSlug)
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#0F766E] animate-spin" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-[14px] p-8 sm:p-12">
        <EmptyState
          icon={<FileStack className="w-8 h-8 text-[#9CA3AF]" />}
          title="No addenda documents found."
          description="Click the button above to add an addendum from available templates."
          primaryActionLabel=""
        />
      </div>
    );
  }

  if (selectedAddendum && jurisdictionCode && contractData) {
    return (
      <AddendumEditor
        dealId={dealId}
        slug={selectedAddendum.slug}
        fieldValues={selectedAddendum.fieldValues}
        contractData={contractData}
        jurisdictionCode={jurisdictionCode}
        onBack={() => setSelectedAddendumSlug(null)}
        onSaved={(newData) => {
          onContractDataUpdated?.(newData);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {hasAddendaFromFields && jurisdictionCode && (
        <div className="space-y-6">
          {addendaFromFields.map(({ slug, fieldValues }) => (
            <AddendumFromFieldsCardWithTemplate
              key={slug}
              slug={slug}
              fieldValues={fieldValues}
              jurisdictionCode={jurisdictionCode}
              onClick={() => setSelectedAddendumSlug(slug)}
            />
          ))}
        </div>
      )}
      {hasDocumentAddenda && (
        <div className="space-y-4">
          {addenda.map((addendum) => (
            <AddendumCard
              key={addendum.id}
              addendum={addendum}
              onClick={() => onAddendumClick(addendum)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
