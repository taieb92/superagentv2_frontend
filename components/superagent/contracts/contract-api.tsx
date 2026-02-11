import { Template } from "@pdfme/common";
import { getBaseUrl, getFetch } from "@/lib/api/generated/fetch-client/helpers";
import { normalizePdfmeLayoutForContract } from "@/lib/helper";

/**
 * API utilities for contract editor
 * Handles all backend communication for templates, data, and addenda
 */

export interface PdfmeLayoutResponse {
  basePdf: string;
  schemas: unknown[];
}

export interface AddendumItem {
  id?: string;
  title?: string;
  type?: string;
  url?: string;
}

/**
 * Fetch the pdfme template layout for a deal
 */
export async function fetchPdfmeLayout(
  dealId: string
): Promise<PdfmeLayoutResponse> {
  const url = `${getBaseUrl()}/v1/deals/${encodeURIComponent(dealId)}/pdfme-layout`;
  const res = await getFetch().fetch(url, { method: "GET" });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to load pdfme layout: ${res.status}`);
  }

  const data = await res.json();

  if (!data || typeof data !== "object") {
    throw new Error("Invalid pdfme layout response");
  }

  return data as PdfmeLayoutResponse;
}

/**
 * Fetch contract data for a deal
 */
export async function fetchContractData(
  dealId: string
): Promise<Record<string, any>> {
  const url = `${getBaseUrl()}/v1/deals/${encodeURIComponent(dealId)}/contract-data`;
  const res = await getFetch().fetch(url, { method: "GET" });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to load contract data: ${res.status}`);
  }

  return await res.json();
}

/**
 * Save contract data for a deal
 */
export async function saveContractData(
  dealId: string,
  data: Record<string, any>
): Promise<void> {
  const url = `${getBaseUrl()}/v1/deals/${encodeURIComponent(dealId)}/contract-data`;
  const res = await getFetch().fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to save contract data: ${res.status}`);
  }
}

/**
 * Fetch pdfme layout for an addendum by slug.
 * Endpoint: GET /v1/templates/addendum/{slug}/pdfme-layout
 * Returns same structure as deal pdfme-layout (basePdf + schemas).
 */
export async function fetchAddendumPdfmeLayout(
  slug: string,
  jurisdictionCode?: string
): Promise<PdfmeLayoutResponse> {
  const params = new URLSearchParams();
  if (jurisdictionCode) params.set("jurisdictionCode", jurisdictionCode);
  const query = params.toString() ? `?${params.toString()}` : "";
  const url = `${getBaseUrl()}/v1/templates/addendum/${encodeURIComponent(slug)}/pdfme-layout${query}`;
  const res = await getFetch().fetch(url, { method: "GET" });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to load addendum pdfme layout: ${res.status}`);
  }

  const data = await res.json();
  if (!data || typeof data !== "object") {
    throw new Error("Invalid pdfme layout response");
  }
  // The API returns { id, pdfmeLayout: { basePdf, schemas, ... } }
  // Unwrap pdfmeLayout if present so we return { basePdf, schemas }
  const layout = data.pdfmeLayout ?? data;
  if (!layout || typeof layout !== "object") {
    throw new Error("Invalid pdfme layout response: missing pdfmeLayout");
  }
  return layout as PdfmeLayoutResponse;
}

/**
 * Fetch addenda for a deal
 */
export async function fetchAddenda(dealId: string): Promise<AddendumItem[]> {
  const url = `${getBaseUrl()}/v1/deals/${encodeURIComponent(dealId)}/addenda`;
  const res = await getFetch().fetch(url, { method: "GET" });

  if (!res.ok) {
    return [];
  }

  return await res.json();
}

/**
 * Convert pdfme layout to Template format.
 * Normalizes the layout so schemas is always an array and basePdf is valid,
 * avoiding @pdfme/common errors when the API returns incomplete layout data.
 */
export function createTemplateFromLayout(
  layout: PdfmeLayoutResponse | Record<string, unknown>
): Template {
  const { basePdf, schemas } = normalizePdfmeLayoutForContract(layout);
  return {
    basePdf,
    schemas,
  };
}
