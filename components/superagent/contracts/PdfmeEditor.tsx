"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { Form, Viewer } from "@pdfme/ui";
import { Template, cloneDeep, getInputFromTemplate } from "@pdfme/common";
import { getPlugins } from "@/lib/plugins";
import { getFontsData } from "@/lib/helper";
import { logger } from "@/lib/utils/logger";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { convertContractDataToInputs } from "./pdf-input-utils";

interface PdfmeEditorProps {
  template: Template;
  contractData: Record<string, any>;
  viewMode: "form" | "pdf";
  onDataChange: (data: Record<string, any>) => void;
  currentPage?: number;
  activeFieldName?: string | null;
  readOnly?: boolean;
  zoomLevel?: number;
}

export function PdfmeEditor({
  template,
  contractData,
  viewMode,
  onDataChange,
  currentPage = 1,
  activeFieldName,
  readOnly = false,
  zoomLevel = 1.0,
}: PdfmeEditorProps) {
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<Form | Viewer | null>(null);
  const isUpdatingFromFormRef = useRef(false);
  const isApplyingExternalUpdateRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  // Normalize template once - this ensures field names match what pdfme Form uses internally
  const normalizedTemplate = useMemo(() => {
    const cloned = cloneDeep(template);
    getInputFromTemplate(cloned);
    return cloned;
  }, [template]);

  // Initialize Form once - defer to next tick so loading state renders first
  useEffect(() => {
    const container = pdfContainerRef.current;
    if (!container) return;

    let cancelled = false;
    const initTimeout = setTimeout(() => {
      if (cancelled) return;

      container.innerHTML = "";
      setIsLoading(true);

      try {
        const initialInputs = convertContractDataToInputs(
          normalizedTemplate,
          contractData
        );

        let instance: Form | Viewer;

        if (readOnly) {
          instance = new Viewer({
            domContainer: container,
            template: normalizedTemplate,
            inputs: initialInputs,
            options: {
              font: getFontsData(),
              lang: "en",
              zoomLevel: zoomLevel,
              // Viewer options might differ slightly but usually share base options
              theme: { token: { colorPrimary: "#0F766E" } },
            },
            plugins: getPlugins(),
          });
        } else {
          instance = new Form({
            domContainer: container,
            template: normalizedTemplate,
            inputs: initialInputs,
            options: {
              font: getFontsData(),
              lang: "en",
              zoomLevel: zoomLevel,
              maxZoom: 400, // Allow zooming up to 400% for better readability
              labels: { "signature.clear": "🗑️" },
              theme: { token: { colorPrimary: "#0F766E" } },
            },
            plugins: getPlugins(),
          });
        }

        if (cancelled) {
          instance.destroy();
          return;
        }

        formRef.current = instance;

        // Handle input changes from the PDF form - pass only the changed field (delta)
        // so parent can merge into prev state and we avoid stale closure overwriting other fields
        if (!readOnly && instance instanceof Form) {
          instance.onChangeInput(({ name, value }) => {
            if (isApplyingExternalUpdateRef.current) return;
            isUpdatingFromFormRef.current = true;
            onDataChange({ [name]: value });
            setTimeout(() => {
              isUpdatingFromFormRef.current = false;
            }, 0);
          });
        }

        setIsLoading(false);
      } catch (error) {
        logger.error("PdfmeEditor: Failed to initialize form", error);
        toast.error(
          `Failed to load PDF editor: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        setIsLoading(false);
      }
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(initTimeout);
      if (formRef.current) {
        try {
          formRef.current.destroy();
        } catch (e) {
          logger.warn("PdfmeEditor: Error destroying form", e);
        }
        formRef.current = null;
      }
    };
  }, [normalizedTemplate, readOnly]); // Only re-init if template or readOnly changes

  // Update form inputs when contract data changes externally (e.g. from Form view)
  useEffect(() => {
    if (!formRef.current || isUpdatingFromFormRef.current) return;

    isApplyingExternalUpdateRef.current = true;
    const inputs = convertContractDataToInputs(
      normalizedTemplate,
      contractData
    );
    formRef.current.setInputs(inputs);
    const t = setTimeout(() => {
      isApplyingExternalUpdateRef.current = false;
    }, 0);
    return () => clearTimeout(t);
  }, [normalizedTemplate, contractData]);

  // Scroll to page when currentPage changes
  useEffect(() => {
    if (!currentPage || !pdfContainerRef.current) return;

    const pageIndex = currentPage - 1;
    const pageElement = pdfContainerRef.current.children[pageIndex];

    if (pageElement) {
      pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [currentPage]);

  // Scroll to active field when activeFieldName changes
  useEffect(() => {
    if (!activeFieldName || !pdfContainerRef.current) return;

    const fieldElement = pdfContainerRef.current.querySelector(
      `[title="${activeFieldName}"]`
    ) as HTMLElement;

    if (fieldElement) {
      fieldElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // Add temporary highlight outline
      const originalOutline = fieldElement.style.outline;
      const originalOutlineOffset = fieldElement.style.outlineOffset;

      fieldElement.style.transition = "outline 0.2s ease-in-out";
      fieldElement.style.outline = "2px solid #0F766E";
      fieldElement.style.outlineOffset = "2px";

      const timeout = setTimeout(() => {
        fieldElement.style.outline = originalOutline;
        fieldElement.style.outlineOffset = originalOutlineOffset;
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [activeFieldName]);

  return (
    <div className="min-h-full w-full relative flex flex-col">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-50 border border-gray-200 rounded">
          <div className="text-center space-y-3">
            <Loader2 className="w-10 h-10 text-[#0F766E] animate-spin mx-auto" />
            <p className="text-sm font-medium text-gray-600">Loading PDF…</p>
            <p className="text-xs text-gray-500">
              Rendering may take a moment for large documents.
            </p>
          </div>
        </div>
      )}
      <div
        ref={pdfContainerRef}
        className={`flex-1 w-full transition-opacity duration-200 ${
          viewMode === "pdf"
            ? "opacity-100"
            : "opacity-0 absolute pointer-events-none"
        }`}
        style={{ overflowY: "auto" }}
      />
    </div>
  );
}
