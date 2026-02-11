/**
 * useContractUpdater - Unified field update logic for contract editors
 *
 * This hook provides a single source of truth for updating contract data,
 * ensuring consistent behavior between PDF view and Form view.
 *
 * Key responsibilities:
 * - Build field metadata (type, group associations) from template
 * - Handle radio group selection (update group key, clear other options)
 * - Handle checkbox toggling
 * - Handle regular field updates
 */

import { useMemo, useCallback } from "react";
import { Template } from "@pdfme/common";
import { isRadioGroupField } from "./form-view-utils";

// ============================================================================
// Types
// ============================================================================

export interface FieldMetadata {
  name: string;
  type: string;
  group?: string;
  content?: string;
  options?: string | string[];
}

export interface ContractUpdaterResult {
  /** Map of field name -> field metadata */
  fieldMetadataMap: Map<string, FieldMetadata>;
  /** Map of group name -> array of field names in that group */
  radioGroupsMap: Map<string, string[]>;
  /** Map of group name -> array of full field metadata */
  radioGroupFieldsMap: Map<string, FieldMetadata[]>;
  /**
   * Universal field update handler.
   * Handles all field types correctly:
   * - Radio groups: updates group key, clears other options
   * - Checkboxes: normalizes boolean values
   * - Text/other: direct update
   */
  updateField: (fieldName: string, value: any) => Record<string, any>;
  /**
   * Batch update multiple fields at once.
   * Returns merged updates object.
   */
  updateFields: (updates: Record<string, any>) => Record<string, any>;
  /**
   * Get the value to set for a selected radio option.
   * Uses field's content/options if available, otherwise "true".
   */
  getRadioOptionValue: (field: FieldMetadata) => string;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useContractUpdater(template: Template): ContractUpdaterResult {
  // Build field metadata map from template schemas
  const fieldMetadataMap = useMemo(() => {
    const map = new Map<string, FieldMetadata>();
    template.schemas.forEach((pageSchema) => {
      const fields = Array.isArray(pageSchema)
        ? pageSchema
        : Object.values(pageSchema);
      fields.forEach((field: any) => {
        if (field?.name) {
          map.set(field.name, {
            name: field.name,
            type: field.type ?? "text",
            group: field.group,
            content: field.content,
            options: field.options,
          });
        }
      });
    });
    return map;
  }, [template.schemas]);

  // Build radio groups map: group name -> field names
  const radioGroupsMap = useMemo(() => {
    const groups = new Map<string, string[]>();
    template.schemas.forEach((pageSchema) => {
      const fields = Array.isArray(pageSchema)
        ? pageSchema
        : Object.values(pageSchema);
      fields.forEach((field: any) => {
        if (isRadioGroupField(field) && field.group) {
          if (!groups.has(field.group)) {
            groups.set(field.group, []);
          }
          groups.get(field.group)!.push(field.name);
        }
      });
    });
    return groups;
  }, [template.schemas]);

  // Build radio groups map with full field metadata
  const radioGroupFieldsMap = useMemo(() => {
    const groups = new Map<string, FieldMetadata[]>();
    template.schemas.forEach((pageSchema) => {
      const fields = Array.isArray(pageSchema)
        ? pageSchema
        : Object.values(pageSchema);
      fields.forEach((field: any) => {
        if (isRadioGroupField(field) && field.group) {
          if (!groups.has(field.group)) {
            groups.set(field.group, []);
          }
          groups.get(field.group)!.push({
            name: field.name,
            type: field.type ?? "radioGroup",
            group: field.group,
            content: field.content,
            options: field.options,
          });
        }
      });
    });
    return groups;
  }, [template.schemas]);

  // Get the value to set for a selected radio option
  const getRadioOptionValue = useCallback((field: FieldMetadata): string => {
    // Use field's content if available
    if (
      field.content &&
      typeof field.content === "string" &&
      field.content !== ""
    ) {
      return field.content;
    }
    // Use first option if available
    if (
      field.options &&
      Array.isArray(field.options) &&
      field.options.length > 0
    ) {
      return String(field.options[0]);
    }
    // Use options string if available
    if (typeof field.options === "string" && field.options !== "") {
      return field.options;
    }
    // Default to "true"
    return "true";
  }, []);

  // Universal field update handler
  const updateField = useCallback(
    (fieldName: string, value: any): Record<string, any> => {
      const fieldMeta = fieldMetadataMap.get(fieldName);
      const fieldType = (fieldMeta?.type ?? "text").toLowerCase();
      const groupName = fieldMeta?.group;

      // Handle radio group fields
      if (fieldType === "radiogroup" && groupName) {
        const updates: Record<string, any> = {};
        const groupFieldNames = radioGroupsMap.get(groupName) || [];
        const groupFields = radioGroupFieldsMap.get(groupName) || [];

        // If the value is truthy (field was selected)
        if (value && value !== "" && value !== "false") {
          // Find the field metadata for the selected field
          const selectedFieldMeta = groupFields.find(
            (f) => f.name === fieldName
          );

          // Set selected field to proper value
          updates[fieldName] = selectedFieldMeta
            ? getRadioOptionValue(selectedFieldMeta)
            : "true";

          // Clear other fields in the group
          groupFieldNames.forEach((name) => {
            if (name !== fieldName) {
              updates[name] = "";
            }
          });

          // Store the selected field name in the group key
          updates[groupName] = fieldName;
        } else {
          // Field was deselected - just update this field
          updates[fieldName] = value ?? "";
        }

        return updates;
      }

      // Handle checkbox fields - normalize to string "true"/"false" or empty string
      if (fieldType === "checkbox") {
        const normalizedValue =
          value === true || value === "true" ? "true" : "";
        return { [fieldName]: normalizedValue };
      }

      // Handle all other fields (text, date, etc.)
      return { [fieldName]: value ?? "" };
    },
    [fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap, getRadioOptionValue]
  );

  // Batch update multiple fields
  const updateFields = useCallback(
    (updates: Record<string, any>): Record<string, any> => {
      const result: Record<string, any> = {};
      for (const [fieldName, value] of Object.entries(updates)) {
        Object.assign(result, updateField(fieldName, value));
      }
      return result;
    },
    [updateField]
  );

  return {
    fieldMetadataMap,
    radioGroupsMap,
    radioGroupFieldsMap,
    updateField,
    updateFields,
    getRadioOptionValue,
  };
}

// ============================================================================
// Pure utility functions (for testing without hooks)
// ============================================================================

/**
 * Build field metadata map from template schemas.
 * Pure function for testing.
 */
export function buildFieldMetadataMap(
  schemas: Template["schemas"]
): Map<string, FieldMetadata> {
  const map = new Map<string, FieldMetadata>();
  schemas.forEach((pageSchema) => {
    const fields = Array.isArray(pageSchema)
      ? pageSchema
      : Object.values(pageSchema);
    fields.forEach((field: any) => {
      if (field?.name) {
        map.set(field.name, {
          name: field.name,
          type: field.type ?? "text",
          group: field.group,
          content: field.content,
          options: field.options,
        });
      }
    });
  });
  return map;
}

/**
 * Build radio groups map from template schemas.
 * Pure function for testing.
 */
export function buildRadioGroupsMap(
  schemas: Template["schemas"]
): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  schemas.forEach((pageSchema) => {
    const fields = Array.isArray(pageSchema)
      ? pageSchema
      : Object.values(pageSchema);
    fields.forEach((field: any) => {
      if (isRadioGroupField(field) && field.group) {
        if (!groups.has(field.group)) {
          groups.set(field.group, []);
        }
        groups.get(field.group)!.push(field.name);
      }
    });
  });
  return groups;
}

/**
 * Compute field update for a given field, type, and value.
 * Pure function for testing.
 */
export function computeFieldUpdate(
  fieldName: string,
  value: any,
  fieldMetadataMap: Map<string, FieldMetadata>,
  radioGroupsMap: Map<string, string[]>,
  radioGroupFieldsMap: Map<string, FieldMetadata[]>
): Record<string, any> {
  const fieldMeta = fieldMetadataMap.get(fieldName);
  const fieldType = (fieldMeta?.type ?? "text").toLowerCase();
  const groupName = fieldMeta?.group;

  // Handle radio group fields
  if (fieldType === "radiogroup" && groupName) {
    const updates: Record<string, any> = {};
    const groupFieldNames = radioGroupsMap.get(groupName) || [];
    const groupFields = radioGroupFieldsMap.get(groupName) || [];

    // If the value is truthy (field was selected)
    if (value && value !== "" && value !== "false") {
      // Find the field metadata for the selected field
      const selectedFieldMeta = groupFields.find((f) => f.name === fieldName);

      // Compute the option value
      let optionValue = "true";
      if (selectedFieldMeta) {
        if (
          selectedFieldMeta.content &&
          typeof selectedFieldMeta.content === "string" &&
          selectedFieldMeta.content !== ""
        ) {
          optionValue = selectedFieldMeta.content;
        } else if (
          selectedFieldMeta.options &&
          Array.isArray(selectedFieldMeta.options) &&
          selectedFieldMeta.options.length > 0
        ) {
          optionValue = String(selectedFieldMeta.options[0]);
        } else if (
          typeof selectedFieldMeta.options === "string" &&
          selectedFieldMeta.options !== ""
        ) {
          optionValue = selectedFieldMeta.options;
        }
      }

      // Set selected field
      updates[fieldName] = optionValue;

      // Clear other fields in the group
      groupFieldNames.forEach((name) => {
        if (name !== fieldName) {
          updates[name] = "";
        }
      });

      // Store the selected field name in the group key
      updates[groupName] = fieldName;
    } else {
      // Field was deselected
      updates[fieldName] = value ?? "";
    }

    return updates;
  }

  // Handle checkbox fields
  if (fieldType === "checkbox") {
    const normalizedValue = value === true || value === "true" ? "true" : "";
    return { [fieldName]: normalizedValue };
  }

  // Handle all other fields
  return { [fieldName]: value ?? "" };
}
