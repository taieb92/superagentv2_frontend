/**
 * API client for document field prefill mappings
 * Admin-only endpoints for configuring MLS, AGENT, and BBA field mappings
 *
 * Prefill types are not in the current generated client; local types kept for backward compatibility.
 */

// Local types for backward compatibility (not in current OpenAPI spec)
export interface PrefillMapping {
  id?: string;
  jurisdictionCode?: string;
  templateId?: string;
  templateVersionId?: string;
  sourceType?: string;
  documentType?: string;
  [key: string]: unknown;
}

export interface PrefillMappingCreateRequest {
  jurisdictionCode?: string;
  templateId?: string;
  templateVersionId?: string;
  sourceType?: string;
  documentType?: string;
  [key: string]: unknown;
}

export type PrefillSourceType = string;
export type TemplateType = string;

// Filter interface for backward compatibility
export interface PrefillMappingFilters {
  jurisdictionCode?: string;
  templateId?: string;
  templateVersionId?: string;
  sourceType?: string;
}
