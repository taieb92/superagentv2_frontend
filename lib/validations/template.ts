/**
 * Zod validation schemas for template-related inputs
 */

import { z } from "zod";

/**
 * Validates template type enum values
 */
export const templateTypeSchema = z.enum([
  "BBA",
  "CONTRACT",
  "ADDENDA",
  "COUNTEROFFERS",
]);

/**
 * Validates jurisdiction code (2-letter uppercase code)
 */
export const jurisdictionCodeSchema = z
  .string()
  .length(2, "Jurisdiction code must be exactly 2 characters")
  .transform((val) => val.toUpperCase())
  .refine((val) => /^[A-Z]{2}$/.test(val), {
    message: "Jurisdiction code must be 2 uppercase letters",
  });

/**
 * Validates template slug (for ADDENDA templates)
 */
export const templateSlugSchema = z
  .string()
  .min(1, "Slug is required")
  .max(100, "Slug must be less than 100 characters")
  .regex(
    /^[a-z0-9-]+$/,
    "Slug can only contain lowercase letters, numbers, and hyphens"
  );

/**
 * Validates document prompt
 */
export const documentPromptSchema = z
  .string()
  .min(1, "Document prompt is required")
  .max(10000, "Document prompt must be less than 10000 characters");

/**
 * Validates template title
 */
export const templateTitleSchema = z
  .string()
  .max(200, "Title must be less than 200 characters")
  .optional()
  .nullable();

/**
 * Validates file input for PDF uploads
 */
export const pdfFileSchema = z
  .instanceof(File)
  .refine((file) => file.type === "application/pdf", {
    message: "File must be a PDF",
  })
  .refine((file) => file.size <= 10 * 1024 * 1024, {
    message: "File size must be less than 10MB",
  });

/**
 * Validates URL parameter for template type (lowercase to uppercase conversion)
 */
export const urlTemplateTypeSchema = z
  .string()
  .transform((val): "BBA" | "CONTRACT" | "ADDENDA" | "COUNTEROFFERS" | null => {
    const normalized = val.toLowerCase();
    if (normalized === "bba") return "BBA";
    if (normalized === "purchase" || normalized === "contract")
      return "CONTRACT";
    if (normalized === "addendum" || normalized === "addenda") return "ADDENDA";
    if (normalized === "counteroffers" || normalized === "counteroffer")
      return "COUNTEROFFERS";
    return null;
  })
  .refine(
    (val): val is "BBA" | "CONTRACT" | "ADDENDA" | "COUNTEROFFERS" =>
      val !== null,
    {
      message: "Invalid template type",
    }
  );

/**
 * Schema for creating a template
 */
export const createTemplateSchema = z.object({
  jurisdictionCode: jurisdictionCodeSchema,
  templateType: templateTypeSchema,
  documentPrompt: documentPromptSchema,
  slug: templateSlugSchema.optional(),
  title: templateTitleSchema,
});

/**
 * Schema for updating template layout
 */
export const updateLayoutSchema = z.object({
  templateId: z.string().uuid("Template ID must be a valid UUID"),
  pdfmeLayout: z.any(), // PDFME Template type - validated separately by PDFME library
});

/**
 * Type exports
 */
export type TemplateType = z.infer<typeof templateTypeSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateLayoutInput = z.infer<typeof updateLayoutSchema>;
