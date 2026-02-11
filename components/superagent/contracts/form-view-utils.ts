/**
 * Utility functions for FormView component.
 * Extracted for testability and reuse.
 */

/**
 * Check if a field is a radio group field.
 * Radio groups have type "radioGroup" (case-insensitive) and a `group` property.
 */
export function isRadioGroupField(field: any): boolean {
  const type = (field?.type ?? "").toLowerCase();
  return type === "radiogroup" && Boolean(field?.group);
}

/**
 * Get the family (path prefix) from a field name for section grouping.
 * Only splits on DOT (.), not underscore (_), to keep related fields together.
 * Also strips common suffixes like _description to group them with parent fields.
 *
 * @example
 * getFieldFamily("purchase.parties.buyer_names") // "purchase.parties"
 * getFieldFamily("purchase.property.included_appliances.refrigerator") // "purchase.property.included_appliances"
 * getFieldFamily("purchase.property.included_appliances.refrigerator_description") // "purchase.property.included_appliances"
 * getFieldFamily("simple_field") // ""
 */
export function getFieldFamily(fieldName: string): string {
  // Strip common suffixes that should be grouped with their parent
  let normalized = fieldName;
  if (normalized.endsWith("_description")) {
    normalized = normalized.replace(/_description$/, "");
  }

  // Only split on DOT (not underscore) to keep compound names together
  const segments = normalized.split(".").filter(Boolean);
  if (segments.length <= 1) return "";
  return segments.slice(0, -1).join(".");
}

/**
 * Format field names into readable labels.
 * Uses the last dot-segment for a cleaner look.
 *
 * @example
 * formatFieldLabel("purchase.parties.buyer_names") // "Buyer Names"
 * formatFieldLabel("purchase.property.lead_based_paint_disclosure") // "Lead Based Paint Disclosure"
 * formatFieldLabel("refrigerator") // "Refrigerator"
 */
export function formatFieldLabel(fieldName: string): string {
  // Split by dot to get the hierarchical segments
  const dotSegments = fieldName.split(".").filter(Boolean);

  // Take the last dot-segment
  const lastDotSegment =
    dotSegments.length > 0 ? dotSegments[dotSegments.length - 1] : fieldName;

  // Format underscores to spaces and capitalize
  return lastDotSegment
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Format radio option labels by extracting the meaningful suffix.
 * Tries to find the part of the field name that differs from the group name.
 *
 * @example
 * formatRadioOptionLabel("purchase.property.earnest_money_payment_method.personal_check", "purchase.property.earnest_money_payment_method_group")
 * // "Personal Check"
 *
 * formatRadioOptionLabel("earnest_money_holder.held_by_broker_trust_account", "earnest_money_holder_group")
 * // "Held By Broker Trust Account"
 */
export function formatRadioOptionLabel(
  fieldName: string,
  groupName: string
): string {
  // Remove common prefixes to find the unique part
  // Group names typically end with "_group" or ".group"
  const groupBase = groupName.replace(/_group$/, "").replace(/\.group$/, "");

  // Try to find where the field name diverges from the group base
  const groupBaseLower = groupBase.toLowerCase().replace(/[._]/g, "");

  // Split field name into segments
  const segments = fieldName.split(/[._]/).filter(Boolean);

  // Find the first segment that's NOT part of the group base
  const meaningfulParts: string[] = [];
  let matchedLength = 0;

  for (const segment of segments) {
    const segmentLower = segment.toLowerCase();
    const remainingBase = groupBaseLower.slice(matchedLength);

    if (remainingBase.startsWith(segmentLower)) {
      matchedLength += segmentLower.length;
    } else {
      meaningfulParts.push(segment);
    }
  }

  // If we found meaningful parts, format them
  if (meaningfulParts.length > 0) {
    return meaningfulParts
      .join(" ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  // Fallback: use last 2-3 segments for more context
  const lastSegments = segments.slice(
    -Math.min(3, Math.max(2, segments.length))
  );
  return lastSegments
    .join(" ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Format family (path prefix) into a readable section heading.
 *
 * @example
 * formatFamilyLabel("purchase.parties") // "Purchase Parties"
 * formatFamilyLabel("purchase.property.included_appliances") // "Purchase Property Included Appliances"
 * formatFamilyLabel("") // ""
 */
export function formatFamilyLabel(familyKey: string): string {
  if (!familyKey) return "";
  return familyKey
    .replace(/[._]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Check if a field is an "other description" field that depends on an "other" option being selected.
 * Returns the related group key if found.
 *
 * @example
 * // With globalRadioGroups containing "purchase.property.earnest_money_payment_method_group"
 * isOtherDescriptionField("purchase.property.earnest_money_payment_method.other_method_description", groups)
 * // { isOther: true, groupKey: "purchase.property.earnest_money_payment_method_group" }
 */
export function isOtherDescriptionField(
  fieldName: string,
  globalRadioGroups: Record<string, any[]>
): { isOther: boolean; groupKey: string | null } {
  // Pattern: field ends with _description or .description and has "other" in the name
  const name = fieldName.toLowerCase();
  if (
    !name.includes("other") ||
    (!name.endsWith("_description") && !name.endsWith(".description"))
  ) {
    return { isOther: false, groupKey: null };
  }

  // Try to find the related group key
  const baseName = fieldName
    .replace(/_description$/, "")
    .replace(/\.description$/, "");
  const possibleGroupKeys = [
    baseName.replace(/\.other.*$/, "_group"),
    baseName.replace(/\.other.*$/, ".group"),
    baseName.replace(/_other.*$/, "_group"),
  ];

  for (const groupKey of possibleGroupKeys) {
    if (globalRadioGroups[groupKey]) {
      return { isOther: true, groupKey };
    }
  }

  return { isOther: true, groupKey: null };
}

/**
 * Check if "other" option is selected for a given group.
 */
export function isOtherSelected(
  groupKey: string,
  contractData: Record<string, any> | null | undefined
): boolean {
  const selectedValue = contractData?.[groupKey] || "";
  return selectedValue.toLowerCase().includes("other");
}

/**
 * Build a map of description fields by their parent field name.
 * Used for pairing checkboxes with their description fields.
 *
 * @example
 * buildDescriptionMap([
 *   { name: "refrigerator", type: "checkbox" },
 *   { name: "refrigerator_description", type: "text" }
 * ])
 * // Map { "refrigerator" => { name: "refrigerator_description", type: "text" } }
 */
export function buildDescriptionMap(fields: any[]): Map<string, any> {
  const descriptionMap = new Map<string, any>();
  fields.forEach((field: any) => {
    const name = field.name || "";
    if (name.endsWith("_description")) {
      const parentName = name.replace(/_description$/, "");
      descriptionMap.set(parentName, field);
    }
  });
  return descriptionMap;
}

/**
 * Convert a date string to HTML date input format (yyyy-mm-dd).
 *
 * HTML <input type="date"> strictly requires yyyy-mm-dd format.
 * AI extraction returns various formats that need normalization.
 *
 * @example
 * toHtmlDateValue("2026/02/15") // "2026-02-15"
 * toHtmlDateValue("02/15/2026") // "2026-02-15"
 * toHtmlDateValue("January 15, 2026") // "2026-01-15"
 */
export function toHtmlDateValue(dateStr: string | null | undefined): string {
  if (!dateStr || typeof dateStr !== "string") return "";

  const trimmed = dateStr.trim();
  if (!trimmed) return "";

  // Already in correct format
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // Try native Date parsing first (handles "January 15, 2026", ISO strings, etc.)
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    if (year >= 1900 && year <= 2100) {
      return formatAsHtmlDate(year, parsed.getMonth() + 1, parsed.getDate());
    }
  }

  // Handle numeric formats: yyyy/mm/dd, mm/dd/yyyy, dd/mm/yyyy
  const match = trimmed.match(/^(\d{1,4})[-/](\d{1,2})[-/](\d{1,4})$/);
  if (match) {
    const [, p1, p2, p3] = match;
    const n1 = Number.parseInt(p1, 10);
    const n2 = Number.parseInt(p2, 10);
    const n3 = Number.parseInt(p3, 10);

    let year: number, month: number, day: number;

    if (p1.length === 4) {
      // yyyy/mm/dd
      [year, month, day] = [n1, n2, n3];
    } else if (p3.length === 4) {
      // mm/dd/yyyy or dd/mm/yyyy - use heuristic: if n1 > 12, it's day
      year = n3;
      [month, day] = n1 > 12 ? [n2, n1] : [n1, n2];
    } else {
      return ""; // Ambiguous format
    }

    if (isValidDate(year, month, day)) {
      return formatAsHtmlDate(year, month, day);
    }
  }

  return "";
}

/** Format year/month/day as yyyy-mm-dd */
function formatAsHtmlDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Basic date validation */
function isValidDate(year: number, month: number, day: number): boolean {
  return (
    year >= 1900 &&
    year <= 2100 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= 31
  );
}
