"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Types from "@/lib/api/generated/fetch-client";
import {
  useListGuestLinksQuery,
  useCreateGuestLinkMutation,
  useValidateGuestTokenMutation,
  useCreateGuestCounterOfferMutationWithParameters,
  useRevokeGuestLinkMutationWithParameters,
  useListGuestCounterOffersQuery,
  useGetGuestCounterOfferQuery,
  useGetGuestContractViewQuery,
} from "@/lib/api/generated/fetch-client/Query";

export function useGuestLinks(dealId: string, enabled = true) {
  return useListGuestLinksQuery(dealId, {
    enabled: !!dealId && enabled,
  });
}

export function useCreateGuestLink(dealId: string) {
  const queryClient = useQueryClient();

  return useCreateGuestLinkMutation(dealId, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Client", "listGuestLinks", dealId],
      });
    },
  });
}

export function useRevokeGuestLink(dealId: string) {
  const queryClient = useQueryClient();

  return useRevokeGuestLinkMutationWithParameters({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Client", "listGuestLinks", dealId],
      });
    },
  });
}

export function useValidateGuestToken() {
  return useValidateGuestTokenMutation();
}

export function useListGuestCounterOffers(token: string, enabled = true) {
  return useListGuestCounterOffersQuery(token, {
    enabled: !!token && enabled,
  });
}

export function useGetGuestCounterOffer(
  token: string,
  id: string,
  enabled = true
) {
  return useGetGuestCounterOfferQuery(token, id, {
    enabled: !!token && !!id && enabled,
  });
}

export function useGetGuestContractView(token: string, enabled = true) {
  return useGetGuestContractViewQuery(token, {
    enabled: !!token && enabled,
  });
}

/**
 * Hook for guests to create a counter offer.
 * Uses the generated WithParameters mutation to allow passing token and body in mutate().
 */
export function useCreateGuestCounterOffer() {
  const queryClient = useQueryClient();

  return useCreateGuestCounterOfferMutationWithParameters({
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["Client", "listCounterOffers", result.contractInstanceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["Client", "listGuestCounterOffers"],
      });
    },
  });
}

interface UploadGuestParams {
  x_Guest_Token: string;
  id: string;
  body: { file: File };
}

/**
 * Hook for guests to upload a PDF for a counter offer.
 * Custom implementation to handle Multipart/FormData which the generated client misses.
 */
export function useUploadGuestCounterOfferPdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadGuestParams) => {
      const formData = new FormData();
      formData.append("file", data.body.file);

      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
      const url = `${baseUrl}/v1/guest/counteroffers/${data.id}/upload`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "X-Guest-Token": data.x_Guest_Token,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      return response.json() as Promise<Types.CounterOfferDto>;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["Client", "listCounterOffers", result.contractInstanceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["Client", "listGuestCounterOffers"],
      });
    },
  });
}
