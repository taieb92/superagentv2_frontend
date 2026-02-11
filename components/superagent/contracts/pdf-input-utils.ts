/**
 * Utility functions for converting contract data to pdfme inputs.
 * Extracted for testability.
 */

import { Template } from "@pdfme/common";

/**
 * Converts contract data to pdfme inputs.
 * Returns the same merged object for every page to ensure all fields are available
 * regardless of which page/unit is currently visible.
 *
 * Handles:
 * - Text fields (direct value pass-through)
 * - Checkbox fields (boolean to string conversion)
 * - Radio groups (grouped single-option fields with shared `group` property)
 *
 * Radio group data flow:
 * - Backend stores: contractData[groupName] = "selected.option.field.name"
 * - PDFMe expects: per-field (fieldName -> value)
 */
export function convertContractDataToInputs(
  template: Template,
  contractData: Record<string, any>
): Array<Record<string, string>> {
  if (!contractData) return [];

  // Collect all fields from all pages
  const merged: Record<string, string> = {};

  template.schemas.forEach((pageSchema) => {
    const fields = Array.isArray(pageSchema)
      ? pageSchema
      : Object.values(pageSchema);

    fields.forEach((field: any) => {
      const key = field?.name;
      if (!key) return;

      let value = contractData[key];

      // RadioGroup with group: support extraction format (groupName -> selectedOptionName)
      // so data from backend/LLM works; pdfme expects per-field (fieldName -> value).
      const fieldType = field?.type;
      const groupName = field?.group;
      if (
        (fieldType === "RadioGroup" || fieldType === "radioGroup") &&
        groupName
      ) {
        const selectedOption = contractData[groupName];
        if (selectedOption != null && selectedOption !== "") {
          value = key === selectedOption ? String(selectedOption) : "";
        }
      }

      if (value === undefined || value === null) return;

      // Ensure string values (pdfme expects strings)
      if (typeof value === "boolean") {
        merged[key] = value ? "true" : "false";
      } else if (typeof value === "object") {
        merged[key] = JSON.stringify(value);
      } else {
        merged[key] = String(value);
      }
    });
  });

  // Return same merged object for every page
  return new Array(template.schemas.length)
    .fill(null)
    .map(() => ({ ...merged }));
}

/**
 * Get the value to use for a selected radio option in pdfme.
 * For grouped radio fields, always returns "true" for consistency.
 */
export function getRadioInputValue(): string {
  return "true";
}
