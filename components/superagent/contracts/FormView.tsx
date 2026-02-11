"use client";

/**
 * FormView - Traditional form-based editing interface
 *
 * Provides a clean, accessible form for editing contract data
 * when users prefer not to use the PDF view.
 *
 * Architecture:
 * - Types: ./form-view-types.ts
 * - Utilities: ./form-view-utils.ts
 * - Hook: ./useFormFields.ts (field processing)
 * - Hook: ./useContractUpdater.ts (unified update logic)
 * - Field Components: ./FormViewFields.tsx
 */

import { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatFamilyLabel } from "./form-view-utils";
import { useFormFields } from "./useFormFields";
import { useContractUpdater } from "./useContractUpdater";
import {
  FormField,
  GroupedRadioField,
  CheckboxWithDescriptionField,
} from "./FormViewFields";
import {
  isGroupedRadioItem,
  isCheckboxWithDescriptionItem,
} from "./form-view-types";
import type { FormViewProps, TemplateField } from "./form-view-types";

export function FormView({
  template,
  contractData,
  onDataChange,
  currentPage = 1,
  totalPages: totalPagesProp,
  onPageChange,
  activeFieldName,
}: FormViewProps) {
  const totalPages = totalPagesProp ?? template.schemas?.length ?? 1;
  const safePage = Math.max(1, Math.min(currentPage, totalPages));

  // Process fields using custom hook
  const { familyRenderData } = useFormFields({
    template,
    contractData,
    currentPage: safePage,
  });

  // Use unified contract updater for consistent field update logic
  const { updateField } = useContractUpdater(template);

  // Unified field change handler - uses updateField for proper radio group handling
  const handleChange = useCallback(
    (fieldName: string, value: any) => {
      const updates = updateField(fieldName, value);
      onDataChange(updates);
    },
    [updateField, onDataChange]
  );

  // Scroll to active field when activeFieldName changes
  useEffect(() => {
    if (!activeFieldName) return;

    const fieldElement = document.querySelector(
      `[data-field-name="${activeFieldName}"]`
    ) as HTMLElement;

    if (fieldElement) {
      fieldElement.scrollIntoView({ behavior: "smooth", block: "center" });

      // Add temporary highlight ring
      fieldElement.style.transition = "outline 0.2s ease-in-out";
      fieldElement.style.outline = "2px solid #0F766E";
      fieldElement.style.outlineOffset = "2px";

      const timeout = setTimeout(() => {
        fieldElement.style.outline = "";
        fieldElement.style.outlineOffset = "";
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [activeFieldName]);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-[#E5E7EB] flex flex-col h-full">
      <div className="p-6 flex flex-col flex-1 min-h-0">
        {/* Header with pagination */}
        <FormHeader
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />

        {/* Field sections */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6">
            {familyRenderData.map(({ familyKey, items }) => (
              <FieldSection
                key={familyKey || "__ungrouped__"}
                familyKey={familyKey}
                items={items}
                contractData={contractData}
                onFieldChange={handleChange}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface FormHeaderProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

function FormHeader({
  currentPage,
  totalPages,
  onPageChange,
}: FormHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4 mb-6">
      <div>
        <h2 className="text-xl font-semibold text-[#111827]">Contract Form</h2>
        <p className="text-sm text-[#6B7280] mt-0.5">
          Edit contract fields — Page {currentPage} of {totalPages}
        </p>
      </div>
      {totalPages > 1 && onPageChange && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
          currentPage <= 1
            ? "text-[#9CA3AF] border-[#E5E7EB] cursor-not-allowed bg-[#F9FAFB]"
            : "text-[#374151] border-[#D1D5DB] hover:bg-[#F3F4F6] hover:border-[#9CA3AF]"
        )}
      >
        Previous
      </button>
      <span className="text-sm text-[#6B7280] px-2">
        {currentPage} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-lg border transition-colors",
          currentPage >= totalPages
            ? "text-[#9CA3AF] border-[#E5E7EB] cursor-not-allowed bg-[#F9FAFB]"
            : "text-[#0F766E] border-[#0F766E] hover:bg-[#ECFDF5]"
        )}
      >
        Next
      </button>
    </div>
  );
}

interface FieldSectionProps {
  familyKey: string;
  items: any[];
  contractData: Record<string, any>;
  /** Unified field change handler - handles all field types including radio groups */
  onFieldChange: (fieldName: string, value: any) => void;
}

function FieldSection({
  familyKey,
  items,
  contractData,
  onFieldChange,
}: FieldSectionProps) {
  const categoryLabel = familyKey
    ? formatFamilyLabel(familyKey)
    : "Other fields";

  return (
    <section
      className={cn(
        "rounded-xl border bg-white shadow-sm overflow-hidden",
        familyKey ? "border-[#E5E7EB]" : "border-[#E5E7EB]/80 bg-[#FAFAFA]"
      )}
    >
      {/* Section header */}
      <div
        className={cn(
          "px-5 py-3.5 border-b",
          familyKey
            ? "bg-[#F0FDFA] border-[#0F766E]/20"
            : "bg-[#F9FAFB] border-[#E5E7EB]"
        )}
      >
        <h3
          className={cn(
            "text-sm font-semibold tracking-tight",
            familyKey ? "text-[#0F766E]" : "text-[#6B7280]"
          )}
        >
          {familyKey ? (
            <span className="flex items-center gap-2">
              <span
                className="w-1 h-4 rounded-full bg-[#0F766E] shrink-0"
                aria-hidden
              />
              {categoryLabel}
            </span>
          ) : (
            categoryLabel
          )}
        </h3>
        {familyKey && (
          <p className="text-xs text-[#6B7280] mt-0.5">
            {items.length} field{items.length !== 1 ? "s" : ""} in this section
          </p>
        )}
      </div>

      {/* Section content */}
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <FieldItem
              key={getItemKey(item)}
              item={item}
              contractData={contractData}
              onFieldChange={onFieldChange}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FieldItemProps {
  item: any;
  contractData: Record<string, any>;
  /** Unified field change handler - handles all field types including radio groups */
  onFieldChange: (fieldName: string, value: any) => void;
}

function FieldItem({ item, contractData, onFieldChange }: FieldItemProps) {
  if (isGroupedRadioItem(item)) {
    return (
      <GroupedRadioField
        groupName={item.groupName}
        groupFields={item.fields}
        contractData={contractData}
        onFieldChange={onFieldChange}
      />
    );
  }

  if (isCheckboxWithDescriptionItem(item)) {
    return (
      <CheckboxWithDescriptionField
        checkboxField={item.checkboxField}
        checkboxValue={contractData?.[item.checkboxField.name]}
        descriptionValue={contractData?.[item.descriptionField.name]}
        onCheckboxChange={(value) =>
          onFieldChange(item.checkboxField.name, value)
        }
        onDescriptionChange={(value) =>
          onFieldChange(item.descriptionField.name, value)
        }
      />
    );
  }

  // Regular field
  const field = item as TemplateField;
  return (
    <FormField
      field={field}
      value={contractData?.[field.name]}
      onChange={(value) => onFieldChange(field.name, value)}
    />
  );
}

// ============================================================================
// Helpers
// ============================================================================

function getItemKey(item: any): string {
  if (isGroupedRadioItem(item)) {
    return item.groupName;
  }
  if (isCheckboxWithDescriptionItem(item)) {
    return item.checkboxField.name;
  }
  return item.name;
}
