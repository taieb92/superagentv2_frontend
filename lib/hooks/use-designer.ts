/**
 * Shared hook for designer functionality
 * Extracts common logic between admin and public designer pages
 */

import type {
  Template as ApiTemplate,
  TemplateType,
} from "@/lib/hooks/use-templates";
import {
  getBlankTemplate,
  getFontsData,
  readFile,
  removeTitleFromTemplate,
  validateTemplateFields,
} from "@/lib/helper";
import {
  useTemplate,
  useUpdateTemplateLayout,
} from "@/lib/hooks/use-templates";
import { getPlugins } from "@/lib/plugins";
import { logger } from "@/lib/utils/logger";
import { urlTemplateTypeSchema } from "@/lib/validations/template";
import { checkTemplate, cloneDeep, Template } from "@pdfme/common";
import { Designer } from "@pdfme/ui";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";

export interface UseDesignerParams {
  /**
   * Whether this is the admin version (affects some behavior)
   */
  isAdmin?: boolean;
}

export interface UseDesignerReturn {
  // Refs
  designerRef: React.RefObject<HTMLDivElement | null>;
  designer: React.MutableRefObject<Designer | null>;
  currentTemplateId: React.MutableRefObject<string | null>;

  // URL params
  jurisdictionCode: string | null;
  type: TemplateType | null;
  slug: string | null;

  // Template data
  templateData: ApiTemplate | undefined;
  isLoadingTemplate: boolean;
  templateError: Error | null;

  // Mutations
  updateLayout: ReturnType<typeof useUpdateTemplateLayout>;

  // Handlers
  buildDesigner: () => Promise<void>;
  onChangeBasePDF: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveTemplate: (template?: Template) => void;
  onSaveRemote: () => Promise<void>;
  onResetTemplate: () => void;
}

/**
 * Shared hook for designer functionality
 */
export function useDesigner(params: UseDesignerParams = {}): UseDesignerReturn {
  const { isAdmin = false } = params;
  const searchParams = useSearchParams();
  const designerRef = useRef<HTMLDivElement | null>(null);
  const designer = useRef<Designer | null>(null);
  const currentTemplateId = useRef<string | null>(null);

  const jurisdictionCode = searchParams.get("jurisdictionCode");
  const typeParam = searchParams.get("type");
  const slug = searchParams.get("slug");

  // Convert URL parameter to API TemplateType enum with validation
  const type: TemplateType | null = useMemo(() => {
    if (!typeParam) return null;
    try {
      const result = urlTemplateTypeSchema.safeParse(typeParam);
      return result.success ? result.data : null;
    } catch {
      // Fallback to manual conversion if zod fails
      const normalized = typeParam.toLowerCase();
      if (normalized === "bba") return "BBA";
      if (normalized === "purchase" || normalized === "contract")
        return "CONTRACT";
      if (normalized === "addendum" || normalized === "addenda")
        return "ADDENDA";
      if (normalized === "counteroffers" || normalized === "counteroffer")
        return "COUNTEROFFERS";
      return null;
    }
  }, [typeParam]);

  const {
    data: templateDataRaw,
    isLoading: isLoadingTemplate,
    error: templateError,
  } = useTemplate(jurisdictionCode, type, slug);

  // Type assertion since useTemplate returns Template but TypeScript needs help inferring
  const templateData = templateDataRaw as ApiTemplate | undefined;

  const updateLayout = useUpdateTemplateLayout();

  /**
   * Saves the current template to the API (called automatically by PDFME on changes).
   */
  const onSaveTemplate = useCallback(
    (template?: Template) => {
      if (!designer.current || !currentTemplateId.current) return;

      // Only auto-save if we have API connection
      if (!jurisdictionCode || !type) return;

      const templateToSave = template || designer.current.getTemplate();

      // Validate required fields
      const validation = validateTemplateFields(templateToSave);
      if (!validation.isValid) {
        // Don't show error for auto-saves, just skip
        return;
      }

      const cleanedTemplate = removeTitleFromTemplate(templateToSave);
      updateLayout.mutate({
        templateId: currentTemplateId.current,
        pdfmeLayout: cleanedTemplate,
      });
    },
    [updateLayout, jurisdictionCode, type]
  );

  /**
   * Initializes the PDF Designer instance.
   * Loads template from API (auto-creates if doesn't exist).
   */
  const buildDesigner = useCallback(async () => {
    if (!designerRef.current) return;

    // If no API params, use blank template (legacy mode)
    if (!jurisdictionCode || !type) {
      try {
        const template: Template = getBlankTemplate();
        designer.current = new Designer({
          domContainer: designerRef.current,
          template,
          options: {
            font: getFontsData(),
            lang: "en",
            labels: {
              "signature.clear": "🗑️",
            },
            theme: {
              token: { colorPrimary: "#25c2a0" },
            },
            maxZoom: 250,
          },
          plugins: getPlugins(),
        });
        designer.current.onSaveTemplate(onSaveTemplate);
      } catch (error) {
        logger.error("Error initializing designer:", error);
        toast.error(
          `Failed to initialize designer: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
      return;
    }

    // Wait for template data to load
    if (isLoadingTemplate || !templateData) return;

    try {
      let template: Template = getBlankTemplate();

      // Use PDFME layout from API if available and valid, otherwise use blank template
      if (templateData.pdfmeLayout) {
        try {
          // Cast JsonNode to unknown to Template to satisfy type check
          const layout = templateData.pdfmeLayout as unknown as Template;
          // Validate PDFME layout structure
          checkTemplate(layout);
          template = removeTitleFromTemplate(layout);
        } catch (error) {
          // If PDFME layout is invalid (e.g., missing schemas/basePdf), use blank template
          logger.warn(
            "Invalid pdfmeLayout from API, using blank template:",
            error
          );
          template = getBlankTemplate();
        }
      }

      currentTemplateId.current = templateData.id ?? null;

      designer.current = new Designer({
        domContainer: designerRef.current,
        template,
        options: {
          font: getFontsData(),
          lang: "en",
          labels: {
            "signature.clear": "🗑️",
          },
          theme: {
            token: { colorPrimary: "#25c2a0" },
          },
          maxZoom: 250,
        },
        plugins: getPlugins(),
      });
      designer.current.onSaveTemplate(onSaveTemplate);
    } catch (error) {
      logger.error("Error initializing designer:", error);
      toast.error(
        `Failed to load template: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }, [templateData, isLoadingTemplate, jurisdictionCode, type, onSaveTemplate]);

  /**
   * Handles changing the base PDF for the current template.
   */
  const onChangeBasePDF = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (
        e.target.files?.[0] &&
        designer.current &&
        currentTemplateId.current
      ) {
        readFile(e.target.files[0], "dataURL").then(async (basePdf) => {
          const newTemplate = cloneDeep(designer.current!.getTemplate());
          newTemplate.basePdf = basePdf;
          designer.current!.updateTemplate(newTemplate);

          // Auto-save to API
          const cleanedTemplate = removeTitleFromTemplate(newTemplate);
          updateLayout.mutate({
            templateId: currentTemplateId.current!,
            pdfmeLayout: cleanedTemplate,
          });
        });
      }
    },
    [updateLayout]
  );

  /**
   * Saves the current template to the API.
   * Blocks save if any field has an empty description.
   */
  const onSaveRemote = useCallback(async () => {
    if (!designer.current) {
      toast.error("Designer not initialized");
      return;
    }

    // If no API params, validate but still allow save (legacy mode)
    if (!jurisdictionCode || !type) {
      const template = designer.current.getTemplate();
      const validation = validateTemplateFields(template);
      if (!validation.isValid) {
        const errorMessage =
          validation.errors.slice(0, 5).join("\n") +
          (validation.errors.length > 5
            ? `\n... and ${validation.errors.length - 5} more field(s)`
            : "");
        toast.error(
          `Cannot save: Some fields are missing required information:\n${errorMessage}`,
          {
            duration: 8000,
          }
        );
        return; // Block save even in legacy mode
      }
      const cleanedTemplate = removeTitleFromTemplate(template);
      const jsonPayload = JSON.stringify(cleanedTemplate);
      logger.log("--- PAYLOAD START ---");
      logger.log(jsonPayload);
      logger.log("--- PAYLOAD END ---");
      toast.info("Template saved (check console for payload)");
      return;
    }

    // If template doesn't exist yet, wait for it to be created
    if (!templateData || !currentTemplateId.current) {
      toast.info("Creating template...");
      // Wait a bit for the query to complete
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!templateData || !currentTemplateId.current) {
        toast.error("Template not found. Please refresh the page.");
        return;
      }
    }

    const template = designer.current.getTemplate();

    // Validate - block save if validation fails
    const validation = validateTemplateFields(template);
    if (!validation.isValid) {
      const errorMessage =
        validation.errors.slice(0, 5).join("\n") +
        (validation.errors.length > 5
          ? `\n... and ${validation.errors.length - 5} more field(s)`
          : "");
      toast.error(
        `Cannot save: Some fields are missing required information:\n${errorMessage}`,
        {
          duration: 8000,
        }
      );
      return; // Block save
    }

    // Save to server only if validation passes
    const cleanedTemplate = removeTitleFromTemplate(template);
    updateLayout.mutate({
      templateId: currentTemplateId.current!,
      pdfmeLayout: cleanedTemplate,
    });
  }, [designer, templateData, jurisdictionCode, type, updateLayout]);

  /**
   * Resets the template to a blank template.
   */
  const onResetTemplate = useCallback(() => {
    if (designer.current) {
      designer.current.updateTemplate(getBlankTemplate());
    }
  }, []);

  return {
    designerRef,
    designer,
    currentTemplateId,
    jurisdictionCode,
    type,
    slug,
    templateData,
    isLoadingTemplate,
    templateError: templateError as Error | null,
    updateLayout,
    buildDesigner,
    onChangeBasePDF,
    onSaveTemplate,
    onSaveRemote,
    onResetTemplate,
  } as UseDesignerReturn;
}
