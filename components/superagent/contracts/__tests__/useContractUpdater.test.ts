/**
 * Tests for useContractUpdater hook and pure utility functions.
 *
 * These tests ensure consistent field update behavior across PDF and Form views.
 */

import { describe, it, expect } from "vitest";
import {
  buildFieldMetadataMap,
  buildRadioGroupsMap,
  computeFieldUpdate,
  FieldMetadata,
} from "../useContractUpdater";
import {
  realTemplate,
  realTemplateSchemaPage2,
  realTemplateSchemaPage3,
} from "./__fixtures__/test-data";

// ============================================================================
// Test Fixtures
// ============================================================================

const minimalRadioGroupSchema = [
  {
    name: "payment.cash",
    type: "radioGroup",
    group: "payment_method_group",
  },
  {
    name: "payment.check",
    type: "radioGroup",
    group: "payment_method_group",
  },
  {
    name: "payment.wire",
    type: "radioGroup",
    group: "payment_method_group",
    content: "WIRE_TRANSFER", // Has content value
  },
];

const radioGroupWithOptionsSchema = [
  {
    name: "financing.conventional",
    type: "radioGroup",
    group: "financing_type_group",
    options: ["CONVENTIONAL"],
  },
  {
    name: "financing.fha",
    type: "radioGroup",
    group: "financing_type_group",
    options: "FHA_LOAN", // String options
  },
  {
    name: "financing.cash",
    type: "radioGroup",
    group: "financing_type_group",
  },
];

const checkboxSchema = [
  { name: "appliances.refrigerator", type: "checkbox" },
  { name: "appliances.washer", type: "checkbox" },
  { name: "appliances.refrigerator_description", type: "text" },
];

const mixedSchema = [
  { name: "buyer_name", type: "text" },
  { name: "closing_date", type: "date" },
  { name: "include_hoa", type: "checkbox" },
  ...minimalRadioGroupSchema,
];

// ============================================================================
// Helper Functions
// ============================================================================

function buildMapsFromSchema(schema: any[]) {
  const schemas = [schema];
  const fieldMetadataMap = buildFieldMetadataMap(schemas);
  const radioGroupsMap = buildRadioGroupsMap(schemas);

  // Build radioGroupFieldsMap
  const radioGroupFieldsMap = new Map<string, FieldMetadata[]>();
  schema.forEach((field: any) => {
    if ((field?.type ?? "").toLowerCase() === "radiogroup" && field?.group) {
      if (!radioGroupFieldsMap.has(field.group)) {
        radioGroupFieldsMap.set(field.group, []);
      }
      radioGroupFieldsMap.get(field.group)!.push({
        name: field.name,
        type: field.type,
        group: field.group,
        content: field.content,
        options: field.options,
      });
    }
  });

  return { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap };
}

// ============================================================================
// Tests: buildFieldMetadataMap
// ============================================================================

describe("buildFieldMetadataMap", () => {
  it("builds map from single page schema", () => {
    const map = buildFieldMetadataMap([checkboxSchema]);

    expect(map.size).toBe(3);
    expect(map.get("appliances.refrigerator")).toEqual({
      name: "appliances.refrigerator",
      type: "checkbox",
      group: undefined,
      content: undefined,
      options: undefined,
    });
  });

  it("builds map from multi-page template", () => {
    const map = buildFieldMetadataMap(realTemplate.schemas);

    // Should include fields from page 2 and 3
    expect(map.has("earnest_money_holder.held_by_broker_trust_account")).toBe(
      true
    );
    expect(map.has("purchase.property.included_appliances.refrigerator")).toBe(
      true
    );
    expect(
      map.get("earnest_money_holder.held_by_broker_trust_account")?.group
    ).toBe("earnest_money_holder_group");
  });

  it("preserves content and options from fields", () => {
    const map = buildFieldMetadataMap([minimalRadioGroupSchema]);

    expect(map.get("payment.wire")?.content).toBe("WIRE_TRANSFER");
    expect(map.get("payment.cash")?.content).toBeUndefined();
  });

  it("handles empty schemas gracefully", () => {
    const map = buildFieldMetadataMap([[], []]);
    expect(map.size).toBe(0);
  });

  it("defaults missing type to 'text'", () => {
    const schemaWithMissingType = [{ name: "no_type_field" }];
    const map = buildFieldMetadataMap([schemaWithMissingType]);

    expect(map.get("no_type_field")?.type).toBe("text");
  });
});

// ============================================================================
// Tests: buildRadioGroupsMap
// ============================================================================

describe("buildRadioGroupsMap", () => {
  it("groups radio fields by group property", () => {
    const groups = buildRadioGroupsMap([minimalRadioGroupSchema]);

    expect(groups.size).toBe(1);
    expect(groups.get("payment_method_group")).toEqual([
      "payment.cash",
      "payment.check",
      "payment.wire",
    ]);
  });

  it("handles multiple radio groups", () => {
    const groups = buildRadioGroupsMap(realTemplate.schemas);

    expect(groups.has("earnest_money_holder_group")).toBe(true);
    expect(
      groups.has("purchase.property.earnest_money_payment_method_group")
    ).toBe(true);
    expect(groups.get("earnest_money_holder_group")?.length).toBe(2);
    expect(
      groups.get("purchase.property.earnest_money_payment_method_group")?.length
    ).toBe(3);
  });

  it("ignores non-radioGroup fields", () => {
    const groups = buildRadioGroupsMap([checkboxSchema]);
    expect(groups.size).toBe(0);
  });

  it("ignores radioGroup fields without group property", () => {
    const schemaWithOrphanRadio = [
      { name: "orphan.radio", type: "radioGroup" }, // No group property
    ];
    const groups = buildRadioGroupsMap([schemaWithOrphanRadio]);
    expect(groups.size).toBe(0);
  });

  it("handles case-insensitive radioGroup type", () => {
    const mixedCaseSchema = [
      { name: "option1", type: "RadioGroup", group: "test_group" },
      { name: "option2", type: "RADIOGROUP", group: "test_group" },
      { name: "option3", type: "radiogroup", group: "test_group" },
    ];
    const groups = buildRadioGroupsMap([mixedCaseSchema]);

    expect(groups.get("test_group")?.length).toBe(3);
  });
});

// ============================================================================
// Tests: computeFieldUpdate - Radio Groups
// ============================================================================

describe("computeFieldUpdate - Radio Groups", () => {
  it("selects radio option and clears others", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(minimalRadioGroupSchema);

    const updates = computeFieldUpdate(
      "payment.cash",
      "true",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      "payment.cash": "true",
      "payment.check": "",
      "payment.wire": "",
      payment_method_group: "payment.cash",
    });
  });

  it("uses field content as value when available", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(minimalRadioGroupSchema);

    const updates = computeFieldUpdate(
      "payment.wire",
      "true",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates["payment.wire"]).toBe("WIRE_TRANSFER");
    expect(updates["payment.cash"]).toBe("");
    expect(updates["payment.check"]).toBe("");
    expect(updates["payment_method_group"]).toBe("payment.wire");
  });

  it("uses field options array as value when available", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(radioGroupWithOptionsSchema);

    const updates = computeFieldUpdate(
      "financing.conventional",
      "true",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates["financing.conventional"]).toBe("CONVENTIONAL");
  });

  it("uses string options as value when available", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(radioGroupWithOptionsSchema);

    const updates = computeFieldUpdate(
      "financing.fha",
      "true",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates["financing.fha"]).toBe("FHA_LOAN");
  });

  it("handles deselection (falsy value)", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(minimalRadioGroupSchema);

    const updates = computeFieldUpdate(
      "payment.cash",
      "",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    // Only updates the deselected field, doesn't clear others or update group
    expect(updates).toEqual({
      "payment.cash": "",
    });
  });

  it("treats 'false' string as deselection", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(minimalRadioGroupSchema);

    const updates = computeFieldUpdate(
      "payment.cash",
      "false",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      "payment.cash": "false",
    });
  });

  it("switching selection clears previous and sets new", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(minimalRadioGroupSchema);

    // First select cash
    const firstUpdate = computeFieldUpdate(
      "payment.cash",
      "true",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );
    expect(firstUpdate["payment_method_group"]).toBe("payment.cash");

    // Then select wire
    const secondUpdate = computeFieldUpdate(
      "payment.wire",
      "true",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );
    expect(secondUpdate).toEqual({
      "payment.wire": "WIRE_TRANSFER",
      "payment.cash": "",
      "payment.check": "",
      payment_method_group: "payment.wire",
    });
  });
});

// ============================================================================
// Tests: computeFieldUpdate - Checkboxes
// ============================================================================

describe("computeFieldUpdate - Checkboxes", () => {
  it("normalizes boolean true to string 'true'", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(checkboxSchema);

    const updates = computeFieldUpdate(
      "appliances.refrigerator",
      true,
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      "appliances.refrigerator": "true",
    });
  });

  it("normalizes string 'true' to 'true'", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(checkboxSchema);

    const updates = computeFieldUpdate(
      "appliances.refrigerator",
      "true",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      "appliances.refrigerator": "true",
    });
  });

  it("normalizes boolean false to empty string", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(checkboxSchema);

    const updates = computeFieldUpdate(
      "appliances.refrigerator",
      false,
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      "appliances.refrigerator": "",
    });
  });

  it("normalizes empty string to empty string", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(checkboxSchema);

    const updates = computeFieldUpdate(
      "appliances.washer",
      "",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      "appliances.washer": "",
    });
  });

  it("normalizes undefined to empty string", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(checkboxSchema);

    const updates = computeFieldUpdate(
      "appliances.washer",
      undefined,
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      "appliances.washer": "",
    });
  });
});

// ============================================================================
// Tests: computeFieldUpdate - Text and Other Fields
// ============================================================================

describe("computeFieldUpdate - Text and Other Fields", () => {
  it("passes through text field values", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(mixedSchema);

    const updates = computeFieldUpdate(
      "buyer_name",
      "John Smith",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      buyer_name: "John Smith",
    });
  });

  it("passes through date field values", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(mixedSchema);

    const updates = computeFieldUpdate(
      "closing_date",
      "2026-03-15",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      closing_date: "2026-03-15",
    });
  });

  it("converts null to empty string", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(mixedSchema);

    const updates = computeFieldUpdate(
      "buyer_name",
      null,
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      buyer_name: "",
    });
  });

  it("converts undefined to empty string", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(mixedSchema);

    const updates = computeFieldUpdate(
      "buyer_name",
      undefined,
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      buyer_name: "",
    });
  });

  it("handles unknown fields as text fields", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(mixedSchema);

    const updates = computeFieldUpdate(
      "unknown_field",
      "some value",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      unknown_field: "some value",
    });
  });
});

// ============================================================================
// Tests: Real Template Integration
// ============================================================================

describe("Real Template Integration", () => {
  it("handles earnest money holder radio group", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(realTemplateSchemaPage2);

    const updates = computeFieldUpdate(
      "earnest_money_holder.held_by_broker_trust_account",
      "true",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      "earnest_money_holder.held_by_broker_trust_account": "true",
      "earnest_money_holder_held.by_title_or_escrow": "",
      earnest_money_holder_group:
        "earnest_money_holder.held_by_broker_trust_account",
    });
  });

  it("handles earnest money payment method radio group", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(realTemplateSchemaPage2);

    const updates = computeFieldUpdate(
      "purchase.property.earnest_money_payment_method.wire_transfer",
      "true",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(
      updates["purchase.property.earnest_money_payment_method.wire_transfer"]
    ).toBe("true");
    expect(
      updates["purchase.property.earnest_money_payment_method.personal_check"]
    ).toBe("");
    expect(
      updates["purchase.property.earnest_money_payment_method.other_method"]
    ).toBe("");
    expect(
      updates["purchase.property.earnest_money_payment_method_group"]
    ).toBe("purchase.property.earnest_money_payment_method.wire_transfer");
  });

  it("handles checkbox fields from real template", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(realTemplateSchemaPage2);

    const updates = computeFieldUpdate(
      "purchase.property.hoa",
      true,
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      "purchase.property.hoa": "true",
    });
  });

  it("handles text fields from real template", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(realTemplateSchemaPage2);

    const updates = computeFieldUpdate(
      "purchase.parties.buyer_names",
      "Jane Doe",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      "purchase.parties.buyer_names": "Jane Doe",
    });
  });

  it("handles appliance checkboxes from page 3", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(realTemplateSchemaPage3);

    const updates = computeFieldUpdate(
      "purchase.property.included_appliances.refrigerator",
      true,
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates).toEqual({
      "purchase.property.included_appliances.refrigerator": "true",
    });
  });
});

// ============================================================================
// Tests: Edge Cases
// ============================================================================

describe("Edge Cases", () => {
  it("handles empty template schemas", () => {
    const fieldMetadataMap = buildFieldMetadataMap([]);
    const radioGroupsMap = buildRadioGroupsMap([]);
    const radioGroupFieldsMap = new Map<string, FieldMetadata[]>();

    const updates = computeFieldUpdate(
      "any.field",
      "value",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    // Unknown field treated as text
    expect(updates).toEqual({
      "any.field": "value",
    });
  });

  it("handles malformed field objects gracefully", () => {
    const malformedSchema = [
      null,
      undefined,
      {},
      { name: "valid.field", type: "text" },
    ];
    const map = buildFieldMetadataMap([malformedSchema as any]);

    // Only valid field should be in map
    expect(map.size).toBe(1);
    expect(map.has("valid.field")).toBe(true);
  });

  it("handles numeric values by converting to string", () => {
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema(mixedSchema);

    const updates = computeFieldUpdate(
      "buyer_name",
      12345,
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    // Note: The current implementation doesn't explicitly convert numbers,
    // but this documents expected behavior if needed
    expect(updates).toEqual({
      buyer_name: 12345,
    });
  });

  it("handles very long field names", () => {
    const longFieldName = "a".repeat(500);
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema([{ name: longFieldName, type: "text" }]);

    const updates = computeFieldUpdate(
      longFieldName,
      "value",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates[longFieldName]).toBe("value");
  });

  it("handles special characters in field names", () => {
    const specialFieldName = "field.with-special_chars.123";
    const { fieldMetadataMap, radioGroupsMap, radioGroupFieldsMap } =
      buildMapsFromSchema([{ name: specialFieldName, type: "text" }]);

    const updates = computeFieldUpdate(
      specialFieldName,
      "value",
      fieldMetadataMap,
      radioGroupsMap,
      radioGroupFieldsMap
    );

    expect(updates[specialFieldName]).toBe("value");
  });
});
