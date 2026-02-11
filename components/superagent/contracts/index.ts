/**
 * Contract form components and utilities.
 *
 * Usage:
 * ```tsx
 * import { FormView } from "@/components/superagent/contracts";
 * ```
 */

// Main component
export { FormView } from "./FormView";

// Field components (for custom usage)
export {
  FormField,
  GroupedRadioField,
  CheckboxWithDescriptionField,
} from "./FormViewFields";

// Hooks (for custom implementations)
export { useFormFields } from "./useFormFields";
export { useContractUpdater } from "./useContractUpdater";

// Pure utility functions for field updates (for testing)
export {
  buildFieldMetadataMap,
  buildRadioGroupsMap,
  computeFieldUpdate,
} from "./useContractUpdater";

// Types from contract updater
export type {
  FieldMetadata,
  ContractUpdaterResult,
} from "./useContractUpdater";

// Types
export type {
  FormViewProps,
  FormFieldProps,
  GroupedRadioFieldProps,
  CheckboxWithDescriptionFieldProps,
  TemplateField,
  RenderItem,
  FamilyRenderData,
} from "./form-view-types";

// Type guards
export {
  isGroupedRadioItem,
  isCheckboxWithDescriptionItem,
} from "./form-view-types";

// Utilities
export {
  isRadioGroupField,
  getFieldFamily,
  formatFieldLabel,
  formatRadioOptionLabel,
  formatFamilyLabel,
  isOtherDescriptionField,
  isOtherSelected,
  buildDescriptionMap,
  toHtmlDateValue,
} from "./form-view-utils";
