/**
 * Type definitions for PDFME-related data structures
 */

import { Template } from "@pdfme/common";

/**
 * PDFME layout type - represents a valid PDFME template structure
 */
export type PdfmeLayout = Template;

/**
 * Schema type for PDFME form fields
 */
export interface PdfmeSchema {
  type: string;
  name: string;
  description?: string;
  position: {
    x: number;
    y: number;
  };
  width?: number;
  height?: number;
  required?: boolean;
  readOnly?: boolean;
  mls_alternative?: string;
  [key: string]: unknown;
}

/**
 * Type guard to check if a value is a valid PDFME schema
 */
export function isPdfmeSchema(value: unknown): value is PdfmeSchema {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;

  if (typeof obj.type !== "string") return false;
  if (typeof obj.name !== "string") return false;
  if (!obj.position || typeof obj.position !== "object") return false;

  const position = obj.position as Record<string, unknown>;
  if (typeof position.x !== "number") return false;
  if (typeof position.y !== "number") return false;

  return true;
}
