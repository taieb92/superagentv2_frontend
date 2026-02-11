import { useMemo } from "react";
import type {
  DealDetailDto,
  DocumentListDto,
} from "@/lib/api/generated/fetch-client";
import { format } from "date-fns";

export function useDealData(
  deal: DealDetailDto | undefined,
  fallbackJurisdictionCode?: string
) {
  return useMemo(() => {
    return {
      addressLine: deal?.addressLine || deal?.fullAddress || "Loading...",
      status: deal?.status || "DRAFT",
      buyerName: deal?.buyerName || "—",
      lastSaved: deal?.updatedAtISO
        ? format(new Date(deal.updatedAtISO), "MMM d, yyyy 'at' h:mm a")
        : "Just now",
      jurisdictionCode:
        deal?.jurisdiction || fallbackJurisdictionCode || "",
    };
  }, [deal, fallbackJurisdictionCode]);
}

export function useFilteredDocuments(documents: DocumentListDto[] = []) {
  const addenda = useMemo(
    () =>
      documents.filter((doc) => {
        const type =
          doc.type?.toUpperCase() || doc.docType?.toUpperCase() || "";
        const title =
          doc.title?.toLowerCase() || doc.templateName?.toLowerCase() || "";
        return (
          type === "ADDENDUM" ||
          type === "ADDENDA" ||
          title.includes("addendum") ||
          title.includes("addenda")
        );
      }),
    [documents]
  );

  const counters = useMemo(
    () =>
      documents.filter((doc) => {
        const type =
          doc.type?.toUpperCase() || doc.docType?.toUpperCase() || "";
        const title =
          doc.title?.toLowerCase() || doc.templateName?.toLowerCase() || "";
        return (
          type === "COUNTER_EXHIBIT" ||
          title.includes("counter") ||
          title.includes("counteroffer")
        );
      }),
    [documents]
  );

  return { addenda, counters };
}
