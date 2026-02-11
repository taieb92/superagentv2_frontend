"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Template, checkTemplate } from "@pdfme/common";
import { ArrowLeft, FileText, FileEdit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PdfmeEditor } from "./PdfmeEditor";
import { FormView } from "./FormView";
import { saveContractData, createTemplateFromLayout } from "./contract-api";
import { removeTitleFromTemplate } from "@/lib/helper";
import { humanizeAddendumSlug } from "@/lib/utils/addendum-from-fields";
import { useTemplate } from "@/lib/hooks/use-templates";
import { cn } from "@/lib/utils";

type ViewMode = "form" | "pdf";

interface AddendumEditorProps {
  dealId: string;
  slug: string;
  fieldValues: Record<string, unknown>;
  contractData: Record<string, unknown>;
  jurisdictionCode: string;
  title?: string;
  onBack: () => void;
  onSaved: (updatedContractData: Record<string, unknown>) => void;
}

/**
 * Addendum editor with Form + PDF view, like Purchase Contract.
 * Fetches pdfme layout by slug, edits addendum fields, saves back to contract data.
 */
export function AddendumEditor({
  dealId,
  slug,
  fieldValues,
  contractData,
  jurisdictionCode,
  title,
  onBack,
  onSaved,
}: AddendumEditorProps) {
  const [addendumData, setAddendumData] = useState<Record<string, unknown>>(
    () => ({ ...fieldValues })
  );
  const [viewMode, setViewMode] = useState<ViewMode>("pdf");
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  useEffect(() => {
    setAddendumData({ ...fieldValues });
  }, [slug, fieldValues]);

  const handleDataChange = useCallback((updated: Record<string, unknown>) => {
    setAddendumData((prev) => ({ ...prev, ...updated }));
  }, []);

  const handleSave = async () => {
    if (!dealId || !contractData) return;

    setSaving(true);
    try {
      const newContractData = {
        ...contractData,
        addendum: {
          ...((contractData.addendum as Record<string, unknown>) || {}),
          [slug]: addendumData,
        },
      };
      await saveContractData(dealId, newContractData as Record<string, any>);
      onSaved(newContractData);
      toast.success("Addendum saved");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(`Failed to save: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

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
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      {/* Header: Back + Title + View Toggle + Save */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back</span>
          </button>
          <h2 className="text-lg font-semibold text-[#111827]">
            {displayName}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2 bg-[#F3F4F6] rounded-lg p-1">
            <button
              onClick={() => setViewMode("pdf")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                viewMode === "pdf"
                  ? "bg-white shadow-sm text-[#111827]"
                  : "text-[#6B7280] hover:text-[#111827]"
              )}
            >
              <FileText className="w-4 h-4" />
              PDF View
            </button>
            <button
              onClick={() => setViewMode("form")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
                viewMode === "form"
                  ? "bg-white shadow-sm text-[#111827]"
                  : "text-[#6B7280] hover:text-[#111827]"
              )}
            >
              <FileEdit className="w-4 h-4" />
              Form View
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#0F766E] text-white rounded-lg font-medium text-sm hover:bg-[#115E59] disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </div>

      {/* Editor content */}
      <div className="relative flex-1 min-h-[600px] bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            viewMode === "form" && "pointer-events-none opacity-0"
          )}
        >
          <PdfmeEditor
            template={template}
            contractData={addendumData as Record<string, any>}
            viewMode={viewMode}
            onDataChange={handleDataChange}
            currentPage={currentPage}
          />
        </div>
        {viewMode === "form" && (
          <div className="relative z-10 h-full bg-white p-6 overflow-y-auto">
            <FormView
              template={template}
              contractData={addendumData as Record<string, any>}
              onDataChange={handleDataChange}
              currentPage={currentPage}
              totalPages={template.schemas?.length || 1}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
