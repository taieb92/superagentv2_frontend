"use client";

/**
 * Field components for FormView.
 *
 * Contains:
 * - FormField: Generic field renderer (text, checkbox, date, etc.)
 * - GroupedRadioField: Radio group with multiple options (grouped single-option fields)
 * - CheckboxWithDescriptionField: Checkbox paired with description input
 */

import { cn } from "@/lib/utils";
import {
  formatFieldLabel,
  formatRadioOptionLabel,
  toHtmlDateValue,
} from "./form-view-utils";
import type {
  FormFieldProps,
  GroupedRadioFieldProps,
  CheckboxWithDescriptionFieldProps,
} from "./form-view-types";

// ============================================================================
// CheckboxWithDescriptionField
// ============================================================================

/**
 * Renders a checkbox with its associated description field.
 * Description input is always visible below the checkbox.
 */
export function CheckboxWithDescriptionField({
  checkboxField,
  descriptionValue,
  checkboxValue,
  onCheckboxChange,
  onDescriptionChange,
}: CheckboxWithDescriptionFieldProps) {
  const checkboxLabel = formatFieldLabel(checkboxField.name);
  const isChecked = checkboxValue === "true" || checkboxValue === true;

  return (
    <div data-field-name={checkboxField.name} className="space-y-2 col-span-1">
      <label className="flex items-center gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onCheckboxChange(e.target.checked)}
          className="h-5 w-5 text-[#0F766E] rounded border-[#D1D5DB] focus:ring-2 focus:ring-[#0F766E]/20 transition-all"
        />
        <span className="text-sm font-medium text-[#374151] group-hover:text-[#111827] transition-colors">
          {checkboxLabel}
        </span>
      </label>
      <div className="ml-8">
        <input
          type="text"
          value={descriptionValue || ""}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={`Describe ${checkboxLabel.toLowerCase()}...`}
          className={cn(
            "w-full px-3 py-2 text-sm",
            "border border-[#D1D5DB] rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]",
            "transition-all duration-200",
            "placeholder:text-[#9CA3AF]",
            !descriptionValue && "bg-[#F9FAFB]"
          )}
        />
      </div>
    </div>
  );
}

// ============================================================================
// GroupedRadioField
// ============================================================================

/**
 * Renders a group of radio buttons for grouped single-option radio fields.
 *
 * Each field in the group represents one option. When one is selected,
 * others in the group are automatically cleared.
 *
 * Selection detection priority:
 * 1. Check contractData[groupName] - the backend stores selected option name here
 * 2. Fallback: check which individual field has a truthy value
 *
 * Note: Update logic is handled by the parent via onFieldChange,
 * which uses the unified useContractUpdater hook.
 */
export function GroupedRadioField({
  groupName,
  groupFields,
  contractData,
  onFieldChange,
}: GroupedRadioFieldProps) {
  // Determine the currently selected option
  // Backend convention: contractData[groupName] = "selected.option.field.name"
  const selectedFromGroup = contractData?.[groupName];

  let selectedValue = "";
  if (selectedFromGroup) {
    // Verify the selected value is actually one of the options
    const matchingField = groupFields.find((f) => f.name === selectedFromGroup);
    if (matchingField) {
      selectedValue = matchingField.name;
    }
  }

  // Fallback: check individual field values (for legacy data or form edits)
  if (!selectedValue) {
    const fieldWithValue = groupFields.find((f) => {
      const val = contractData?.[f.name];
      return val && val !== "" && val !== "false";
    });
    if (fieldWithValue) {
      selectedValue = fieldWithValue.name;
    }
  }

  // Simple handler - parent's onFieldChange uses unified updateField logic
  // which handles: setting the selected option, clearing others, updating group key
  const handleGroupChange = (selectedFieldName: string) => {
    onFieldChange(selectedFieldName, "true");
  };

  // Use description from the first field or the group name for the label
  const groupLabel =
    groupFields[0]?.groupDescription || formatFieldLabel(groupName);

  return (
    <div data-field-name={groupName} className="space-y-3 col-span-1 md:col-span-2">
      <label className="block text-sm font-medium text-[#374151]">
        {groupLabel}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {groupFields.map((f) => {
          const isSelected = selectedValue === f.name;
          // For radio options, extract the meaningful part after the common prefix
          const optionLabel = formatRadioOptionLabel(f.name, groupName);
          // Show description as tooltip/hint if it exists and is short enough
          const hint =
            f.description && f.description.length < 100 ? f.description : null;

          return (
            <label
              key={f.name}
              className={cn(
                "flex items-start gap-3 cursor-pointer p-3 rounded-lg border transition-all",
                isSelected
                  ? "border-[#0F766E] bg-[#ECFDF5]"
                  : "border-[#E5E7EB] hover:border-[#D1D5DB] bg-white"
              )}
              title={f.description}
            >
              <div className="relative flex items-center justify-center w-5 h-5 rounded-full border border-[#D1D5DB] mt-0.5 shrink-0">
                <input
                  type="radio"
                  name={groupName}
                  checked={isSelected}
                  onChange={() => handleGroupChange(f.name)}
                  className="sr-only"
                />
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0F766E]" />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-[#0F766E]" : "text-[#374151]"
                  )}
                >
                  {optionLabel}
                </span>
                {hint && (
                  <span className="text-xs text-[#6B7280] mt-0.5">{hint}</span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// FormField
// ============================================================================

/**
 * Generic form field renderer.
 * Handles: text, date, checkbox.
 *
 * Note: radioGroup fields with a `group` property are handled by GroupedRadioField.
 */
export function FormField({ field, value, onChange }: FormFieldProps) {
  const label = formatFieldLabel(field.name);
  const typeNorm = (field.type ?? "").toString().toLowerCase();

  // Checkbox
  if (typeNorm === "checkbox") {
    return (
      <div data-field-name={field.name} className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={value === "true" || value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="h-5 w-5 text-[#0F766E] rounded border-[#D1D5DB] focus:ring-2 focus:ring-[#0F766E]/20 transition-all"
          />
          <span className="text-sm font-medium text-[#374151] group-hover:text-[#111827] transition-colors">
            {label}
          </span>
        </label>
      </div>
    );
  }

  // Date - convert to HTML format (yyyy-mm-dd) since AI may return various formats
  const isDate = typeNorm === "date";
  const displayValue = isDate ? toHtmlDateValue(value) : value || "";

  return (
    <div data-field-name={field.name} className="space-y-2">
      <label className="block text-sm font-medium text-[#374151]">
        {label}
      </label>
      <input
        type={isDate ? "date" : "text"}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-3 py-2.5 text-sm",
          "border border-[#D1D5DB] rounded-lg",
          "focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E]",
          "transition-all duration-200",
          "placeholder:text-[#9CA3AF]",
          !displayValue && "bg-[#F9FAFB]"
        )}
        placeholder={isDate ? undefined : `Enter ${label.toLowerCase()}`}
      />
    </div>
  );
}
