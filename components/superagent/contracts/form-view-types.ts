/**
 * Type definitions for FormView components.
 */

import { Template } from "@pdfme/common";

// ============================================================================
// Main Component Props
// ============================================================================

export interface FormViewProps {
  template: Template;
  contractData: Record<string, any>;
  onDataChange: (data: Record<string, any>) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  activeFieldName?: string | null;
}

// ============================================================================
// Field Component Props
// ============================================================================

export interface FormFieldProps {
  field: TemplateField;
  value: any;
  onChange: (value: any) => void;
}

export interface CheckboxWithDescriptionFieldProps {
  checkboxField: TemplateField;
  checkboxValue: any;
  descriptionValue: any;
  onCheckboxChange: (value: any) => void;
  onDescriptionChange: (value: any) => void;
}

export interface GroupedRadioFieldProps {
  groupName: string;
  groupFields: TemplateField[];
  contractData: Record<string, any>;
  /** Unified field change handler - parent handles radio group logic */
  onFieldChange: (fieldName: string, value: any) => void;
}

// ============================================================================
// Internal Types
// ============================================================================

/**
 * A field from the PDFMe template schema with added metadata.
 */
export interface TemplateField {
  name: string;
  type: string;
  pageIndex: number;
  group?: string;
  groupDescription?: string;
  description?: string;
  content?: string;
  options?: string | string[];
  [key: string]: any;
}

/**
 * A processed render item - can be a regular field, grouped radio, or checkbox with description.
 */
export type RenderItem =
  | GroupedRadioItem
  | CheckboxWithDescriptionItem
  | TemplateField;

export interface GroupedRadioItem {
  type: "GroupedRadio";
  groupName: string;
  fields: TemplateField[];
}

export interface CheckboxWithDescriptionItem {
  type: "CheckboxWithDescription";
  checkboxField: TemplateField;
  descriptionField: TemplateField;
}

/**
 * Data for rendering a family/section of fields.
 */
export interface FamilyRenderData {
  familyKey: string;
  items: RenderItem[];
}

/**
 * Type guard to check if item is a GroupedRadioItem.
 */
export function isGroupedRadioItem(item: RenderItem): item is GroupedRadioItem {
  return (item as GroupedRadioItem).type === "GroupedRadio";
}

/**
 * Type guard to check if item is a CheckboxWithDescriptionItem.
 */
export function isCheckboxWithDescriptionItem(
  item: RenderItem
): item is CheckboxWithDescriptionItem {
  return (
    (item as CheckboxWithDescriptionItem).type === "CheckboxWithDescription"
  );
}
