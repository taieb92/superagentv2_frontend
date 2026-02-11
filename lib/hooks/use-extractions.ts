"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getFetch, getBaseUrl } from "@/lib/api/generated/fetch-client/helpers";

export interface ExtractionResponse {
  documentId: string;
  contractInstanceId: string;
  documentType: string;
  jurisdictionCode?: string;
  fieldsJson: Record<string, any>;
  requiredFields: string[] | Record<string, null>;
  createdAt: string;
  updatedAt: string;
  // Only present in ?callId= responses (Phase 1)
  callId?: string;
  userId?: string;
  status?: string;
  callStatus?: string;
}

interface UseExtractionsOptions {
  userId?: string;
  callId?: string | null;
  pollInterval?: number;
  enabled?: boolean;
}

/**
 * Two-phase extraction polling hook.
 *
 * Phase 1: GET /v1/extractions?callId={roomName}  → array response
 *          Extracts documentId from the item matching our callId
 *
 * Phase 2: GET /v1/extractions/{documentId}        → single object (1 DB query)
 *          Used for all subsequent polls
 */
export function useExtractions({
  userId,
  callId,
  pollInterval = 1000,
  enabled = true,
}: UseExtractionsOptions) {
  const validPollInterval = pollInterval > 0 ? pollInterval : 1000;
  const queryClient = useQueryClient();

  // Store documentId together with the callId that produced it
  const [resolved, setResolved] = useState<{
    documentId: string;
    forCallId: string;
  } | null>(null);

  // Clear stale cache when callId changes
  useEffect(() => {
    queryClient.removeQueries({ queryKey: ["extractions"] });
  }, [callId, queryClient]);

  // Only use the resolved documentId if it belongs to the current call
  const resolvedDocumentId =
    resolved && resolved.forCallId === callId ? resolved.documentId : null;
  const phase = resolvedDocumentId ? 2 : 1;

  console.log("[useExtractions]", { callId, phase, resolvedDocumentId, enabled });

  const { data, isLoading, error, isFetching } =
    useQuery<ExtractionResponse | null>({
      // Always include callId so React Query never reuses a stale query across calls
      queryKey: ["extractions", callId, phase, resolvedDocumentId],
      queryFn: async () => {
        // Guard: never fetch without a callId (prevents stale interval fires)
        if (!callId) return null;

        const fetchInstance = getFetch();
        const baseUrl =
          getBaseUrl() ||
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "http://localhost:8080/api";

        let url: string;
        if (phase === 2 && resolvedDocumentId) {
          // Phase 2: poll by documentId (single object response)
          url = `${baseUrl}/v1/extractions/${encodeURIComponent(resolvedDocumentId)}`;
        } else {
          // Phase 1: poll by callId (array response)
          url = `${baseUrl}/v1/extractions?callId=${encodeURIComponent(callId)}${userId ? `&userId=${encodeURIComponent(userId)}` : ""}`;
        }

        const response = await fetchInstance.fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch extractions: ${response.statusText}`
          );
        }

        const jsonData = await response.json();

        if (phase === 2) {
          // /{documentId} returns a single object
          return (jsonData as ExtractionResponse) ?? null;
        }

        // Phase 1: ?callId= returns an array (may include docs from older sessions
        // on the same contract instance). Only use the exact match for this call.
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          const items = jsonData as ExtractionResponse[];
          const exactMatch = items.find((e) => e.callId === callId);

          if (exactMatch) {
            // Found the extraction for THIS call — promote to Phase 2
            if (exactMatch.documentId && callId) {
              setResolved({ documentId: exactMatch.documentId, forCallId: callId });
            }
            return exactMatch;
          }

          // No match yet — agent hasn't initialized extraction. Return null, keep polling Phase 1.
          return null;
        }

        return null;
      },
      enabled: enabled && (phase === 2 ? !!resolvedDocumentId : !!callId),
      refetchInterval: validPollInterval,
      refetchIntervalInBackground: true,
      staleTime: 0,
    });

  const fields = useMemo(() => {
    if (!data?.fieldsJson) {
      return [];
    }

    const formatValue = (v: unknown): string => {
      if (v === null || v === undefined) return "";
      if (typeof v === "boolean") return v ? "Yes" : "No";
      if (typeof v === "object") return JSON.stringify(v);
      return String(v);
    };

    const humanizeSlug = (slug: string): string =>
      slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const result: { key: string; value: string }[] = [];

    for (const [key, value] of Object.entries(data.fieldsJson)) {
      if (
        key === "addendum" &&
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        for (const [slug, addendumFields] of Object.entries(
          value as Record<string, unknown>
        )) {
          if (
            typeof addendumFields === "object" &&
            addendumFields !== null &&
            !Array.isArray(addendumFields)
          ) {
            const addendumName = humanizeSlug(slug);
            for (const [fieldKey, fieldVal] of Object.entries(
              addendumFields as Record<string, unknown>
            )) {
              const label = fieldKey.replace(/_/g, " ");
              result.push({
                key: `${addendumName} - ${label}`,
                value: formatValue(fieldVal),
              });
            }
          }
        }
      } else {
        result.push({
          key,
          value: formatValue(value),
        });
      }
    }

    return result;
  }, [data?.fieldsJson]);

  return {
    data,
    fields,
    requiredFields: data?.requiredFields || {},
    isLoading,
    isFetching,
    error,
    documentType: data?.documentType,
    jurisdictionCode: data?.jurisdictionCode,
    callStatus: data?.callStatus,
  };
}
