"use client";

import { useEffect, useState } from "react";
import { PdfmeEditor } from "../contracts/PdfmeEditor";
import { useTemplate } from "@/lib/hooks/use-templates";
import { Template } from "@pdfme/common";
import { removeTitleFromTemplate, validateTemplateFields } from "@/lib/helper";
import { createTemplateFromLayout } from "../contracts/contract-api";
import { convertContractDataToInputs } from "../contracts/pdf-input-utils";
import { Loader2, AlertCircle } from "lucide-react";
import type { TemplateType } from "@/lib/hooks/use-templates";

interface RealTimePdfPreviewProps {
  documentType: string | undefined;
  jurisdictionCode: string | undefined;
  contractData: Record<string, any>;
  isActive: boolean;
  activeFieldName?: string | null;
  onTemplateLoaded?: (template: any) => void;
}

export function RealTimePdfPreview({
  documentType,
  jurisdictionCode,
  contractData,
  isActive,
  activeFieldName,
  onTemplateLoaded,
}: RealTimePdfPreviewProps) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templateType = documentType as TemplateType | null;

  const queryEnabled = !!jurisdictionCode && !!templateType;

  const {
    data: templateData,
    isLoading: isTemplateLoading,
    error: templateQueryError,
  } = useTemplate(jurisdictionCode || null, templateType);

  useEffect(() => {
    if (!isActive || !templateData?.pdfmeLayout) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const layout = templateData.pdfmeLayout;
      const rawTemplate = createTemplateFromLayout(layout);

      const validation = validateTemplateFields(rawTemplate);
      if (!validation.isValid) {
        throw new Error(
          `Invalid template structure: ${validation.errors.join(", ")}`
        );
      }

      const cleanedTemplate = removeTitleFromTemplate(rawTemplate);
      setTemplate(cleanedTemplate);

      // Notify parent when template is loaded
      if (onTemplateLoaded) {
        onTemplateLoaded(cleanedTemplate);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load template";
      setError(message);
      console.error("RealTimePdfPreview: Template load error", err);
    } finally {
      setIsLoading(false);
    }
  }, [isActive, templateData, onTemplateLoaded]);

  if (!isActive) {
    return null;
  }

  if (error || templateQueryError) {
    const errorMessage =
      error ||
      (templateQueryError instanceof Error
        ? templateQueryError.message
        : "Failed to load template");
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Template Error
        </h3>
        <p className="text-sm text-gray-600 max-w-md">{errorMessage}</p>
        {documentType && (
          <p className="text-xs text-gray-500 mt-4">
            Document Type: {documentType}
            {jurisdictionCode && ` (${jurisdictionCode})`}
          </p>
        )}
      </div>
    );
  }

  // Query is disabled because required params are missing — don't show spinner
  if (!queryEnabled) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Template Unavailable
        </h3>
        <p className="text-sm text-gray-600 max-w-md">
          {!jurisdictionCode && !documentType
            ? "Waiting for jurisdiction and document type to be detected..."
            : !jurisdictionCode
              ? "Jurisdiction code is required to load the template."
              : "Document type is required to load the template."}
        </p>
      </div>
    );
  }

  // Template data loaded but pdfmeLayout is missing
  if (templateData && !templateData.pdfmeLayout && !isTemplateLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Template Layout
        </h3>
        <p className="text-sm text-gray-600 max-w-md">
          The template was found but has no PDF layout configured.
        </p>
        {documentType && (
          <p className="text-xs text-gray-500 mt-4">
            Document Type: {documentType}
            {jurisdictionCode && ` (${jurisdictionCode})`}
          </p>
        )}
      </div>
    );
  }

  if (isLoading || isTemplateLoading || !template) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Loader2 className="w-12 h-12 text-[#0F766E] animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-700">
          {documentType
            ? `Loading ${documentType} template...`
            : "Loading template..."}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <PdfmeEditor
        template={template}
        contractData={contractData}
        viewMode="pdf"
        onDataChange={() => {}}
        activeFieldName={activeFieldName}
      />
    </div>
  );
}
