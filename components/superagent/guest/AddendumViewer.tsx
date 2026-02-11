"use client";

import { useMemo } from "react";
import { Template, checkTemplate } from "@pdfme/common";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PdfmeEditor } from "../contracts/PdfmeEditor";
import { createTemplateFromLayout } from "../contracts/contract-api";
import { removeTitleFromTemplate } from "@/lib/helper";
import { humanizeAddendumSlug } from "@/lib/utils/addendum-from-fields";
import { useTemplate } from "@/lib/hooks/use-templates";

interface AddendumViewerProps {
  slug: string;
  fieldValues: Record<string, unknown>;
  jurisdictionCode: string;
  title?: string;
  onBack: () => void;
}

/**
 * Read-only addendum viewer for guests.
 * Similar to AddendumEditor but without edit/save functionality.
 */
export function AddendumViewer({
  slug,
  fieldValues,
  jurisdictionCode,
  title,
  onBack,
}: AddendumViewerProps) {
  const {
    data: templateData,
    isLoading: loading,
    error: queryError,
  } = useTemplate(jurisdictionCode, "ADDENDA", slug);

  const displayName =
    title || templateData?.title || humanizeAddendumSlug(slug);

  const template = useMemo<Template | null>(() => {
    if (!templateData?.pdfmeLayout) return null;
    try {
      const layout = templateData.pdfmeLayout as {
        basePdf?: unknown;
        schemas?: unknown[];
      };
      const rawTemplate = createTemplateFromLayout(layout);
      checkTemplate(rawTemplate);
      return removeTitleFromTemplate
        ? removeTitleFromTemplate(rawTemplate)
        : rawTemplate;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Failed to load addendum: ${msg}`);
      return null;
    }
  }, [templateData]);

  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : String(queryError)
    : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin" />
        <p className="mt-4 text-sm text-[#6B7280]">Loading addendum...</p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-[#6B7280]">{error || "Failed to load addendum"}</p>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-[#0F766E] hover:bg-[#ECFDF5] rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to addenda
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header: Back + Title */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-[#E5E7EB]">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#0F766E]" />
          <h2 className="text-lg font-semibold text-[#111827]">
            {displayName}
          </h2>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-[#6B7280] bg-gray-100 px-2 py-1 rounded">
            Read-only
          </span>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-white overflow-hidden">
        <PdfmeEditor
          template={template}
          contractData={fieldValues as Record<string, any>}
          viewMode="pdf"
          onDataChange={() => {}}
          readOnly={true}
          zoomLevel={1.0}
        />
      </div>
    </div>
  );
}
