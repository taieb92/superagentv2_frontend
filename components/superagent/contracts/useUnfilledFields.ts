/**
 * Hook for computing the ordered list of unfilled required fields.
 *
 * Supports two modes:
 * - Mode A (DocumentEditor): derives fields from template + contractData
 * - Mode B (VoiceAgentUI): derives from requiredFieldKeys + fieldsJson
 */

import { useMemo } from "react";
import { Template } from "@pdfme/common";
import { formatFieldLabel, isRadioGroupField } from "./form-view-utils";

export interface UnfilledField {
  name: string;
  label: string;
  pageIndex: number;
  positionY?: number;
  type: string;
  group?: string;
}

interface UseUnfilledFieldsOptions {
  // Mode A: DocumentEditor - derive fields from template
  template?: Template;
  contractData?: Record<string, any>;

  // Mode B: VoiceAgentUI - derive from requiredFields + fieldsJson
  requiredFieldKeys?: string[];
  fieldsJson?: Record<string, any>;
}

interface UseUnfilledFieldsResult {
  unfilledFields: UnfilledField[];
  totalRequired: number;
  filledCount: number;
}

function isFieldEmpty(value: any): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed === "" || trimmed === "false" || trimmed === "False" || trimmed === "FALSE";
  }
  return false;
}

function isFieldRequired(field: any): boolean {
  if (!field) return false;
  const required = field.required;
  if (required === true) return true;
  if (required === "true" || required === "True" || required === "TRUE") return true;
  if (required === 1 || required === "1") return true;
  return false;
}

/**
 * Hook to compute unfilled required fields for field navigation.
 */
export function useUnfilledFields(
  options: UseUnfilledFieldsOptions
): UseUnfilledFieldsResult {
  const { template, contractData, requiredFieldKeys, fieldsJson } = options;

  return useMemo(() => {
    // Mode A: DocumentEditor - derive from template schemas
    if (template && contractData !== undefined) {
      return computeFromTemplate(template, contractData ?? {});
    }

    // Mode B: VoiceAgentUI - derive from requiredFieldKeys
    if (requiredFieldKeys && requiredFieldKeys.length > 0) {
      return computeFromRequiredKeys(requiredFieldKeys, fieldsJson ?? {});
    }

    return { unfilledFields: [], totalRequired: 0, filledCount: 0 };
  }, [template, contractData, requiredFieldKeys, fieldsJson]);
}

function computeFromTemplate(
  template: Template,
  contractData: Record<string, any>
): UseUnfilledFieldsResult {
  const allFields: UnfilledField[] = [];
  const seenRadioGroups = new Set<string>();

  console.log("Template schemas:", template.schemas);

  template.schemas.forEach((pageSchema: any, pageIdx: number) => {
    const fields = Array.isArray(pageSchema)
      ? pageSchema
      : pageSchema && typeof pageSchema === "object"
        ? Object.values(pageSchema)
        : [];

    for (const field of fields as any[]) {
      const type = (field?.type ?? "").toLowerCase();
      const name = field?.name ?? "";

      // Only include fields marked as required
      if (!isFieldRequired(field)) {
        continue;
      }

      // Skip signatures and description fields
      if (type === "signature" || name.endsWith("_description")) {
        console.log(`Skipping ${name}: type=${type}, name ends with _description`);
        continue;
      }

      // Collapse radio groups into a single entry
      if (isRadioGroupField(field) && field.group) {
        if (seenRadioGroups.has(field.group)) continue;
        seenRadioGroups.add(field.group);

        console.log(`Adding radio group: ${field.group} on page ${pageIdx + 1}`);
        allFields.push({
          name: field.group,
          label: formatFieldLabel(field.groupDescription || field.group),
          pageIndex: pageIdx + 1,
          positionY: field?.position?.y,
          type: "radioGroup",
          group: field.group,
        });
      } else {
        console.log(`Adding field: ${name} (${type}) on page ${pageIdx + 1}`);
        allFields.push({
          name,
          label: formatFieldLabel(name),
          pageIndex: pageIdx + 1,
          positionY: field?.position?.y,
          type,
        });
      }
    }
  });

  // Sort by page, then by Y-position within page
  allFields.sort((a, b) => {
    if (a.pageIndex !== b.pageIndex) return a.pageIndex - b.pageIndex;
    return (a.positionY ?? 0) - (b.positionY ?? 0);
  });

  const totalRequired = allFields.length;

  console.log("All required fields:", allFields.map(f => f.name));
  console.log("ContractData keys:", Object.keys(contractData));

  const unfilledFields = allFields.filter((field) => {
    if (field.group) {
      // Radio group is unfilled if the group key has no selection
      return isFieldEmpty(contractData[field.name]);
    }
    return isFieldEmpty(contractData[field.name]);
  });

  console.log("Unfilled fields:", unfilledFields.map(f => ({ name: f.name, value: contractData[f.name] })));
  console.log(`Filled: ${totalRequired - unfilledFields.length} / ${totalRequired}`);

  return {
    unfilledFields,
    totalRequired,
    filledCount: totalRequired - unfilledFields.length,
  };
}

function computeFromRequiredKeys(
  requiredFieldKeys: string[],
  fieldsJson: Record<string, any>
): UseUnfilledFieldsResult {
  const allFields: UnfilledField[] = requiredFieldKeys.map((key) => ({
    name: key,
    label: formatFieldLabel(key),
    pageIndex: 1,
    type: "text",
  }));

  const totalRequired = allFields.length;

  const unfilledFields = allFields.filter((field) =>
    isFieldEmpty(fieldsJson[field.name])
  );

  return {
    unfilledFields,
    totalRequired,
    filledCount: totalRequired - unfilledFields.length,
  };
}
