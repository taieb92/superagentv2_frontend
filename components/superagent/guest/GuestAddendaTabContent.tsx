"use client";

import { useState } from "react";
import { AddendumViewer } from "./AddendumViewer";
import { AddendumFromFieldsCardWithTemplate } from "@/components/superagent/deals/AddendumFromFieldsCard";
import { EmptyState } from "@/components/superagent/ui/EmptyState";
import { parseAddendaFromFieldsJson } from "@/lib/utils/addendum-from-fields";
import { FileStack } from "lucide-react";

interface GuestAddendaTabContentProps {
  contractData?: Record<string, unknown> | null;
  jurisdictionCode?: string;
}

export function GuestAddendaTabContent({
  contractData,
  jurisdictionCode,
}: GuestAddendaTabContentProps) {
  const [selectedAddendumSlug, setSelectedAddendumSlug] = useState<
    string | null
  >(null);

  const addendaFromFields = parseAddendaFromFieldsJson(
    contractData ?? undefined
  );
  const hasAddenda = addendaFromFields.length > 0;

  const selectedAddendum = selectedAddendumSlug
    ? addendaFromFields.find((a) => a.slug === selectedAddendumSlug)
    : null;

  if (!jurisdictionCode) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-none p-8 sm:p-12">
        <EmptyState
          icon={<FileStack className="w-8 h-8 text-[#9CA3AF]" />}
          title="Jurisdiction not available"
          description="Unable to load addenda without jurisdiction information."
          primaryActionLabel=""
        />
      </div>
    );
  }

  if (!hasAddenda) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-none p-8 sm:p-12">
        <EmptyState
          icon={<FileStack className="w-8 h-8 text-[#9CA3AF]" />}
          title="No addenda documents found."
          description="This contract does not have any addenda attached."
          primaryActionLabel=""
        />
      </div>
    );
  }

  if (selectedAddendum) {
    return (
      <AddendumViewer
        slug={selectedAddendum.slug}
        fieldValues={selectedAddendum.fieldValues}
        jurisdictionCode={jurisdictionCode}
        onBack={() => setSelectedAddendumSlug(null)}
      />
    );
  }

  return (
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
  );
}
