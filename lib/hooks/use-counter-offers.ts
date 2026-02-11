"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import * as Types from "@/lib/api/generated/fetch-client";
import {
  useListCounterOffersQuery,
  useGetCounterOfferQuery,
  useCreateCounterOfferMutation,
  useUpdateCounterOfferMutation,
  useDeleteCounterOfferMutation,
} from "@/lib/api/generated/fetch-client/Query";

const COUNTER_OFFERS_KEY = "counter-offers";

export function useCounterOffers(dealId: string, enabled = true) {
  return useListCounterOffersQuery(dealId, {
    enabled: !!dealId && enabled,
  });
}

export function useCounterOffer(id: string, enabled = true) {
  return useGetCounterOfferQuery(id, {
    enabled: !!id && enabled,
  });
}

export function useCreateCounterOffer(dealId: string) {
  const queryClient = useQueryClient();

  return useCreateCounterOfferMutation(dealId, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Client", "listCounterOffers", dealId],
      });
    },
  });
}

export function useUpdateCounterOffer(id: string, dealId: string) {
  const queryClient = useQueryClient();

  return useUpdateCounterOfferMutation(id, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Client", "listCounterOffers", dealId],
      });
      queryClient.invalidateQueries({
        queryKey: ["Client", "getCounterOffer", id],
      });
    },
  });
}

export function useDeleteCounterOffer(dealId: string) {
  const queryClient = useQueryClient();

  return useDeleteCounterOfferMutation(dealId, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Client", "listCounterOffers", dealId],
      });
    },
  });
}

export function useUploadCounterOfferPdf(dealId: string) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (data: { id: string; body: { file: File } }) => {
      const formData = new FormData();
      formData.append("file", data.body.file);

      const token = await getToken();

      const baseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
      const url = `${baseUrl}/v1/counteroffers/${data.id}/upload`;

      const headers: Record<string, string> = {};

      // Important: Do NOT set Content-Type header manually for FormData,
      // let the browser set it with the boundary.

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      return response.json() as Promise<Types.CounterOfferDto>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["Client", "listCounterOffers", dealId],
      });
    },
  });
}
