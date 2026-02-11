import type { Plugin, Schema } from "@pdfme/common";
import { checkbox, date, dateTime, text } from "@pdfme/schemas";
import { customRadioGroup } from "./customRadioGroup";
import { customSignature } from "./customSignature";
// MLS fields are loaded dynamically from API, not needed in static plugin definitions

/**
 * Enhanced schema with description field
 */
interface SchemaWithDescription extends Schema {
  description?: string;
}

/**
 * Wraps a PDF plugin with additional metadata fields.
 * Adds a `description` field to all plugins for better organization.
 * Note: Title field was removed per requirements.
 *
 * @param plugin - The base plugin to enhance
 * @param options - Options to customize which fields to include
 * @returns Enhanced plugin with metadata fields added to schema
 */
const withMetadata = <T extends Schema = Schema>(
  plugin: Plugin<T>,
  options: {
    hidePurchaseContractMap?: boolean;
    hideBbaMap?: boolean;
    hideMlsProperty?: boolean;
  } = {}
): Plugin<T & SchemaWithDescription> => {
  // Ensure propPanel exists
  const existingPropPanel = plugin.propPanel || {};
  const existingSchema = existingPropPanel.schema || {};
  const existingDefaultSchema = existingPropPanel.defaultSchema || {};

  // Build metadata fields based on options
  const metadataFields: Record<string, unknown> = {
    description: {
      title: "Description",
      type: "string",
      required: true,
    },
    agent_mapping: {
      title: "Agent Map",
      type: "string",
    },
  };

  // Only add mls_alternative if not hidden
  if (!options.hideMlsProperty) {
    metadataFields.mls_alternative = {
      title: "MLS Property",
      type: "string",
    };
  }

  // Only add bba_mapping if not hidden
  if (!options.hideBbaMap) {
    metadataFields.bba_mapping = {
      title: "BBA Map",
      type: "string",
    };
  }

  // Only add purchase_contract_mapping if not hidden
  if (!options.hidePurchaseContractMap) {
    metadataFields.purchase_contract_mapping = {
      title: "Purchase Contract Map",
      type: "string",
    };
  }

  // Handle schema - it can be either an object or a function
  const newSchema =
    typeof existingSchema === "function"
      ? (props: Parameters<typeof existingSchema>[0]) =>
          ({
            ...existingSchema(props),
            ...metadataFields,
          }) as Record<string, Partial<Schema>>
      : ({
          ...existingSchema,
          ...metadataFields,
        } as Record<string, Partial<Schema>>);

  const defaultSchemaFields: Record<string, string> = {
    description: "",
    agent_mapping: "",
  };

  if (!options.hideMlsProperty) {
    defaultSchemaFields.mls_alternative = "";
  }

  if (!options.hideBbaMap) {
    defaultSchemaFields.bba_mapping = "";
  }

  if (!options.hidePurchaseContractMap) {
    defaultSchemaFields.purchase_contract_mapping = "";
  }

  return {
    ...plugin,
    propPanel: {
      ...existingPropPanel,
      schema: newSchema as typeof existingPropPanel.schema,
      defaultSchema: {
        ...existingDefaultSchema,
        ...defaultSchemaFields,
      },
    },
  };
};

export type TemplateTypeForPlugins =
  | "BBA"
  | "CONTRACT"
  | "ADDENDA"
  | "COUNTEROFFERS"
  | null;

/**
 * Returns all available PDF form plugins with metadata.
 * Includes: text, checkbox, radioGroup, date, dateTime, and signature.
 * All plugins are enhanced with description field support.
 *
 * @param templateType - Optional template type to customize fields (e.g., hide Purchase Contract Map for BBA)
 * @returns Object mapping plugin names (camelCase) to plugin instances
 *
 * @example
 * ```ts
 * const plugins = getPlugins('BBA');
 * // { text: {...}, checkbox: {...}, radioGroup: {...}, ... }
 * ```
 */
export const getPlugins = (templateType?: TemplateTypeForPlugins) => {
  const options = {
    hidePurchaseContractMap: templateType === "BBA",
    hideBbaMap: templateType === "BBA" || templateType === "COUNTEROFFERS",
    hideMlsProperty: templateType === "BBA" || templateType === "COUNTEROFFERS",
  };

  // Apply withMetadata to all plugins
  const textPlugin = withMetadata(text, options);
  const checkboxPlugin = withMetadata(checkbox, options);
  const datePlugin = withMetadata(date, options);
  const dateTimePlugin = withMetadata(dateTime, options);

  // Signature plugin with metadata
  const signatureSchema: Record<string, unknown> = {
    ...(customSignature.propPanel.schema as Record<string, unknown>),
    description: { title: "Description", type: "string", required: true },
    agent_mapping: { title: "Agent Map", type: "string" },
  };
  const signatureDefaults: Record<string, unknown> = {
    ...customSignature.propPanel.defaultSchema,
    description: "",
    agent_mapping: "",
  };

  if (!options.hideMlsProperty) {
    signatureSchema.mls_alternative = { title: "MLS Property", type: "string" };
    signatureDefaults.mls_alternative = "";
  }

  if (!options.hideBbaMap) {
    signatureSchema.bba_mapping = { title: "BBA Map", type: "string" };
    signatureDefaults.bba_mapping = "";
  }

  if (!options.hidePurchaseContractMap) {
    signatureSchema.purchase_contract_mapping = {
      title: "Purchase Contract Map",
      type: "string",
    };
    signatureDefaults.purchase_contract_mapping = "";
  }

  const signaturePlugin = {
    ...customSignature,
    propPanel: {
      ...customSignature.propPanel,
      schema: signatureSchema as typeof customSignature.propPanel.schema,
      defaultSchema:
        signatureDefaults as typeof customSignature.propPanel.defaultSchema,
    },
  };

  // RadioGroup plugin with metadata
  const radioGroupSchema: Record<string, unknown> = {
    ...(customRadioGroup.propPanel.schema as Record<string, unknown>),
    description: { title: "Description", type: "string", required: true },
    agent_mapping: { title: "Agent Map", type: "string" },
  };
  const radioGroupDefaults: Record<string, unknown> = {
    ...customRadioGroup.propPanel.defaultSchema,
    description: "",
    agent_mapping: "",
  };

  if (!options.hideMlsProperty) {
    radioGroupSchema.mls_alternative = {
      title: "MLS Property",
      type: "string",
    };
    radioGroupDefaults.mls_alternative = "";
  }

  if (!options.hideBbaMap) {
    radioGroupSchema.bba_mapping = { title: "BBA Map", type: "string" };
    radioGroupDefaults.bba_mapping = "";
  }

  if (!options.hidePurchaseContractMap) {
    radioGroupSchema.purchase_contract_mapping = {
      title: "Purchase Contract Map",
      type: "string",
    };
    radioGroupDefaults.purchase_contract_mapping = "";
  }

  const radioGroupPlugin = {
    ...customRadioGroup,
    propPanel: {
      ...customRadioGroup.propPanel,
      schema: radioGroupSchema as typeof customRadioGroup.propPanel.schema,
      defaultSchema:
        radioGroupDefaults as typeof customRadioGroup.propPanel.defaultSchema,
    },
  };

  return {
    Text: textPlugin,
    Checkbox: checkboxPlugin,
    RadioGroup: radioGroupPlugin,
    Date: datePlugin,
    DateTime: dateTimePlugin,
    Signature: signaturePlugin,
  };
};
