/**
 * Parse addenda from contract fieldsJson.
 * Extracts addendum slugs and their field values from fieldsJson.addendum.
 */

export interface AddendumFromFields {
  slug: string;
  fieldValues: Record<string, unknown>;
}

/**
 * Parse addendum slugs and field values from fieldsJson.
 * @param fieldsJson - Contract data (fields_json from API)
 * @returns Array of { slug, fieldValues } for each addendum in fieldsJson.addendum
 */
export function parseAddendaFromFieldsJson(
  fieldsJson: Record<string, unknown> | null | undefined
): AddendumFromFields[] {
  if (!fieldsJson || typeof fieldsJson !== "object") {
    return [];
  }

  const addendumObj = fieldsJson.addendum;
  if (
    typeof addendumObj !== "object" ||
    addendumObj === null ||
    Array.isArray(addendumObj)
  ) {
    return [];
  }

  const result: AddendumFromFields[] = [];

  for (const [slug, fieldValues] of Object.entries(addendumObj)) {
    if (
      typeof fieldValues === "object" &&
      fieldValues !== null &&
      !Array.isArray(fieldValues)
    ) {
      result.push({
        slug,
        fieldValues: fieldValues as Record<string, unknown>,
      });
    }
  }

  return result;
}

/**
 * Humanize addendum slug for display (e.g. "solar-addendum" -> "Solar Addendum").
 */
export function humanizeAddendumSlug(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
