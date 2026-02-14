"use client";

import { useEffect, useState, useCallback } from "react";
import { useUnfilledFields } from "./useUnfilledFields";
import { useFieldNavigator } from "./useFieldNavigator";
import { FieldNavigator } from "./FieldNavigator";
import { useParams } from "next/navigation";
import { Template, checkTemplate } from "@pdfme/common";
import {
  Loader2,
  FileText,
  FileEdit,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { PdfmeEditor } from "./PdfmeEditor";
import { FormView } from "./FormView";
import { DocumentNavigator } from "./DocumentNavigator";
import {
  fetchPdfmeLayout,
  fetchContractData,
  saveContractData,
  createTemplateFromLayout,
} from "./contract-api";
import { getDealQueryKey } from "@/lib/api/generated/fetch-client/Query";
import { removeTitleFromTemplate } from "@/lib/helper";
import { logger } from "@/lib/utils/logger";
import { cn } from "@/lib/utils";

type ViewMode = "form" | "pdf";

interface DocumentEditorProps {
  dealId?: string;
  documentType?: string;
}

/**
 * DocumentEditor - Main orchestrator component
 *
 * Responsibilities:
 * - Fetch and manage template and data
 * - Handle view mode switching
 * - Coordinate saving
 * - Provide UI controls
 */
export function DocumentEditor({ dealId: propDealId, documentType = "CONTRACT" }: DocumentEditorProps) {
  const params = useParams();
  const dealId = propDealId || (params?.id as string);
  const queryClient = useQueryClient();

  const [template, setTemplate] = useState<Template | null>(null);
  const [contractData, setContractData] = useState<Record<string, any> | null>(
    null
  );
  const [viewMode, setViewMode] = useState<ViewMode>("pdf");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { unfilledFields, totalRequired, filledCount } = useUnfilledFields({
    template: template ?? undefined,
    contractData: contractData ?? undefined,
  });

  const navigator = useFieldNavigator({ unfilledFields });

  const handleNavigateToField = useCallback(
    (field: any) => {
      if (field.pageIndex) {
        setCurrentPage(field.pageIndex);
      }
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  useEffect(() => {
    if (navigator.currentField) {
      handleNavigateToField(navigator.currentField);
    }
  }, [navigator.currentField, handleNavigateToField]);

  /**
   * Load initial data on mount
   */
  useEffect(() => {
    if (!dealId) {
      setError("Deal ID is required");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load template and data in parallel
        const [layoutResponse, data] = await Promise.all([
          fetchPdfmeLayout(dealId, documentType),
          fetchContractData(dealId, documentType),
        ]);

        // Create and validate template
        const rawTemplate = createTemplateFromLayout(layoutResponse);
        checkTemplate(rawTemplate);

        // Clean template (remove title fields if helper exists)
        const cleanedTemplate = removeTitleFromTemplate
          ? removeTitleFromTemplate(rawTemplate)
          : rawTemplate;

        setTemplate(cleanedTemplate);
        setContractData(data);

        logger.info("DocumentEditor: Data loaded successfully");
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        setError(errorMsg);
        logger.error("DocumentEditor: Failed to load data", e);
        toast.error(`Failed to load contract: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dealId]);

  /**
   * Handle ESC key to exit fullscreen
   */
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when fullscreen
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  /**
   * Handle data changes from either view.
   * Merges updates into previous state so PDF and Form never overwrite each other with stale data.
   */
  const handleDataChange = useCallback((updatedData: Record<string, any>) => {
    setContractData((prev) => ({ ...prev, ...updatedData }));
  }, []);

  /**
   * Handle manual save
   */
  const handleSave = async () => {
    if (!dealId || !contractData) return;

    setSaving(true);
    try {
      await saveContractData(dealId, contractData, documentType);

      // Invalidate cached queries so the header and other components get fresh data
      // The backend syncs buyer name and other fields to the deal, so we need to refetch
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: getDealQueryKey(dealId) }),
        queryClient.invalidateQueries({ queryKey: ["contract-data", dealId] }),
      ]);

      toast.success("Contract saved successfully");
      logger.info("DocumentEditor: Contract saved");
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      toast.error(`Failed to save: ${errorMsg}`);
      logger.error("DocumentEditor: Save failed", e);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle view mode toggle
   */
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    logger.info(`DocumentEditor: Switched to ${mode} view`);
  };

  /**
   * Toggle fullscreen mode
   */
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#0F766E] animate-spin mx-auto" />
          <div className="text-sm font-medium text-[#6B7280]">
            Loading contract...
          </div>
        </div>
      </div>
    );
  }

  // Error state - Ensure both template AND contractData are loaded
  if (error || !template || !contractData) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center max-w-md space-y-4">
          <div className="text-red-600 font-semibold text-lg">
            Failed to Load Contract
          </div>
          <div className="text-[#6B7280] text-sm">
            {error || "Missing template or contract data"}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-[#0F766E] text-white rounded-lg hover:bg-[#115E59] transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // TypeScript now knows template and contractData are non-null
  // Only render editors when we have both fetched data
  const validTemplate = template;
  const validContractData = contractData;

  return (
    <div
      className={cn(
        "flex flex-col flex-1 min-h-0 space-y-4",
        isFullscreen &&
          "fixed inset-0 z-50 bg-white p-6 overflow-hidden flex flex-col h-screen"
      )}
    >
      {/* Header Controls */}
      <div className="flex items-center justify-between flex-shrink-0">
        {/* Editor Controls */}
        <div className="flex-1">
          <EditorControls
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            onSave={handleSave}
            saving={saving}
            totalPages={validTemplate.schemas?.length || 0}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        </div>
        {/* Navigation Controls */}
        {validTemplate.schemas.length > 1 && (
          <div className="ml-4">
            <DocumentNavigator
              currentPage={currentPage}
              totalPages={validTemplate.schemas.length}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* Editor Content - Only rendered after data is fetched */}
      <div
        className={cn(
          "relative flex-1 min-h-0 bg-white border border-[#E5E7EB] shadow-sm rounded-lg overflow-hidden",
          !isFullscreen && "min-h-[720px]"
        )}
      >
        {/* PDF View - Always rendered, keeps state alive */}
        <div
          className={cn(
            "absolute inset-0 h-full w-full z-0",
            viewMode === "form" && "pointer-events-none opacity-0"
          )}
        >
          <PdfmeEditor
            template={validTemplate}
            contractData={validContractData}
            viewMode={viewMode}
            onDataChange={handleDataChange}
            currentPage={currentPage}
            activeFieldName={navigator.currentField?.name ?? null}
          />
        </div>

        {/* Form View - Rendered on top when active */}
        {viewMode === "form" && (
          <div className="relative z-10 h-full bg-white p-6 overflow-y-auto pb-20">
            <FormView
              template={validTemplate}
              contractData={validContractData}
              onDataChange={handleDataChange}
              currentPage={currentPage}
              totalPages={validTemplate.schemas.length}
              onPageChange={handlePageChange}
              activeFieldName={navigator.currentField?.name ?? null}
            />
          </div>
        )}

        {/* Field Navigator - Always on top */}
        <FieldNavigator
          currentField={navigator.currentField}
          currentIndex={navigator.currentIndex}
          totalRemaining={navigator.totalRemaining}
          totalRequired={totalRequired}
          filledCount={filledCount}
          onNext={navigator.goNext}
          onPrev={navigator.goPrev}
        />
      </div>
    </div>
  );
}

interface EditorControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSave: () => void;
  saving: boolean;
  totalPages: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

function EditorControls({
  viewMode,
  onViewModeChange,
  onSave,
  saving,
  totalPages,
  isFullscreen,
  onToggleFullscreen,
}: EditorControlsProps) {
  return (
    <div className="flex items-center justify-between gap-4 bg-white border border-[#E5E7EB] rounded-lg px-4 py-3 shadow-sm">
      {/* Left: View Mode Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 bg-[#F3F4F6] rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("pdf")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium",
              viewMode === "pdf"
                ? "bg-white shadow-sm text-[#111827]"
                : "text-[#6B7280] hover:text-[#111827]"
            )}
          >
            <FileText className="w-4 h-4" />
            <span>PDF View</span>
          </button>
          <button
            onClick={() => onViewModeChange("form")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm font-medium",
              viewMode === "form"
                ? "bg-white shadow-sm text-[#111827]"
                : "text-[#6B7280] hover:text-[#111827]"
            )}
          >
            <FileEdit className="w-4 h-4" />
            <span>Form View</span>
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 text-[#6B7280] hover:text-[#111827] rounded-lg hover:bg-gray-100 transition-colors"
          title={isFullscreen ? "Exit Fullscreen (ESC)" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </button>

        {/* Save button */}
        <button
          onClick={onSave}
          disabled={saving}
          className={cn(
            "px-6 py-2 rounded-lg font-medium text-sm transition-all",
            "bg-[#0F766E] text-white hover:bg-[#115E59]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-sm hover:shadow"
          )}
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </span>
          ) : (
            "Save Contract"
          )}
        </button>
      </div>
    </div>
  );
}
