/**
 * Custom hook for processing and organizing form fields.
 *
 * Handles:
 * - Extracting fields from template schemas
 * - Building radio group mappings
 * - Grouping fields by page and family
 * - Creating render-ready data with proper pairing and deduplication
 */

import { useMemo } from "react";
import { Template } from "@pdfme/common";
import {
  isRadioGroupField,
  getFieldFamily,
  buildDescriptionMap,
  isOtherDescriptionField,
  isOtherSelected,
} from "./form-view-utils";
import type {
  TemplateField,
  FamilyRenderData,
  RenderItem,
} from "./form-view-types";

interface UseFormFieldsOptions {
  template: Template;
  contractData: Record<string, any>;
  currentPage: number;
}

interface UseFormFieldsResult {
  /** All fields across all pages (excluding signatures) */
  allFields: TemplateField[];
  /** Radio groups indexed by group name */
  globalRadioGroups: Record<string, TemplateField[]>;
  /** Fields organized by page number */
  fieldsByPage: Record<number, TemplateField[]>;
  /** Fields for the current page */
  currentPageFields: TemplateField[];
  /** Fields grouped by family for the current page */
  fieldsByFamily: Record<string, TemplateField[]>;
  /** Processed render data ready for display */
  familyRenderData: FamilyRenderData[];
}

/**
 * Hook to process template fields into render-ready data structures.
 */
export function useFormFields({
  template,
  contractData,
  currentPage,
}: UseFormFieldsOptions): UseFormFieldsResult {
  // Extract all fields from all pages (exclude signature – sign in PDF view only)
  const allFields = useMemo<TemplateField[]>(() => {
    return template.schemas.flatMap((pageSchema: any, pageIdx: number) => {
      const fields = Array.isArray(pageSchema)
        ? pageSchema
        : pageSchema && typeof pageSchema === "object"
          ? Object.values(pageSchema)
          : [];

      return (fields as any[])
        .filter((field: any) => {
          const t = (field?.type ?? "").toLowerCase();
          return t !== "signature";
        })
        .map((field: any) => ({
          ...field,
          pageIndex: pageIdx + 1,
        }));
    });
  }, [template.schemas]);

  // Build a global map of radio groups (by `group` property) across ALL pages
  // This ensures radio options on different pages are still grouped together
  const globalRadioGroups = useMemo<Record<string, TemplateField[]>>(() => {
    const groups: Record<string, TemplateField[]> = {};
    allFields.forEach((field) => {
      if (isRadioGroupField(field) && field.group) {
        if (!groups[field.group]) {
          groups[field.group] = [];
        }
        groups[field.group].push(field);
      }
    });
    return groups;
  }, [allFields]);

  // Group fields by page
  const fieldsByPage = useMemo<Record<number, TemplateField[]>>(() => {
    return allFields.reduce(
      (acc, field) => {
        const page = field.pageIndex;
        if (!acc[page]) acc[page] = [];
        acc[page].push(field);
        return acc;
      },
      {} as Record<number, TemplateField[]>
    );
  }, [allFields]);

  const currentPageFields = fieldsByPage[currentPage] ?? [];

  // Group current page fields by family for section display
  const fieldsByFamily = useMemo<Record<string, TemplateField[]>>(() => {
    return currentPageFields.reduce(
      (acc: Record<string, TemplateField[]>, field: TemplateField) => {
        const family = getFieldFamily(field.name ?? "");
        if (!acc[family]) acc[family] = [];
        acc[family].push(field);
        return acc;
      },
      {} as Record<string, TemplateField[]>
    );
  }, [currentPageFields]);

  // Process all families at once to track rendered radio groups and avoid duplicates
  // Also pairs checkboxes with their _description fields
  const familyRenderData = useMemo<FamilyRenderData[]>(() => {
    const renderedRadioGroups = new Set<string>();
    const result: FamilyRenderData[] = [];

    // Sort families alphabetically, with empty family last
    const sortedFamilyKeys = Object.keys(fieldsByFamily).sort((a, b) => {
      if (a === "") return 1;
      if (b === "") return -1;
      return a.localeCompare(b);
    });

    for (const familyKey of sortedFamilyKeys) {
      const fields = fieldsByFamily[familyKey];
      const items: RenderItem[] = [];

      // Build a map of description fields by their parent name
      const descriptionMap = buildDescriptionMap(fields);

      for (const field of fields) {
        const fieldName = field.name || "";
        const typeNorm = (field.type ?? "").toString().toLowerCase();

        // Handle _description fields specially
        if (fieldName.endsWith("_description")) {
          // Check if this is an "other description" field for radio groups
          const otherCheck = isOtherDescriptionField(
            fieldName,
            globalRadioGroups
          );
          if (otherCheck.isOther) {
            // Only show if "other" option is selected
            if (
              otherCheck.groupKey &&
              isOtherSelected(otherCheck.groupKey, contractData)
            ) {
              items.push(field); // Show the other description field
            }
            // Skip if other is not selected or no group found
            continue;
          }

          // Regular description field - skip if it will be paired with a checkbox
          const parentName = fieldName.replace(/_description$/, "");
          const parentField = fields.find((f) => f.name === parentName);
          if (
            parentField &&
            (parentField.type ?? "").toString().toLowerCase() === "checkbox"
          ) {
            // Will be paired with checkbox, skip here
            continue;
          }

          // Not paired with checkbox, render as regular field
          items.push(field);
          continue;
        }

        // If this field is part of a radio group
        if (isRadioGroupField(field) && field.group) {
          // Skip if this radio group was already rendered in another family section
          if (renderedRadioGroups.has(field.group)) continue;
          renderedRadioGroups.add(field.group);

          // Use the global radio group (includes options from all pages)
          items.push({
            type: "GroupedRadio",
            groupName: field.group,
            fields: globalRadioGroups[field.group] || [field],
          });
        } else {
          // Check if this field has a paired description field
          const descriptionField = descriptionMap.get(fieldName);

          if (descriptionField && typeNorm === "checkbox") {
            // Create a paired checkbox+description item
            items.push({
              type: "CheckboxWithDescription",
              checkboxField: field,
              descriptionField: descriptionField,
            });
          } else {
            // Regular field - render as-is
            items.push(field);
          }
        }
      }

      // Only include families that have items to render
      if (items.length > 0) {
        result.push({ familyKey, items });
      }
    }

    return result;
  }, [fieldsByFamily, globalRadioGroups, contractData]);

  return {
    allFields,
    globalRadioGroups,
    fieldsByPage,
    currentPageFields,
    fieldsByFamily,
    familyRenderData,
  };
}
