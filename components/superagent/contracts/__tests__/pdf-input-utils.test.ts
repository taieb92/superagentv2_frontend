/**
 * Tests for pdf-input-utils.ts
 *
 * These tests ensure proper conversion of contract data to pdfme inputs,
 * especially for radio group fields.
 */

import { describe, it, expect } from "vitest";
import {
  convertContractDataToInputs,
  getRadioInputValue,
} from "../pdf-input-utils";
import {
  realTemplate,
  realContractData,
  realTemplateSchemaPage2,
} from "./__fixtures__/test-data";

// ============================================================================
// Test Fixtures
// ============================================================================

// Helper to create a minimal valid schema field
const createField = (overrides: Record<string, any>) => ({
  position: { x: 0, y: 0 },
  width: 20,
  height: 20,
  ...overrides,
});

const radioGroupTemplate = {
  basePdf: "mock",
  schemas: [
    [
      createField({
        name: "payment.cash",
        type: "radioGroup",
        group: "payment_method_group",
      }),
      createField({
        name: "payment.check",
        type: "radioGroup",
        group: "payment_method_group",
      }),
      createField({
        name: "payment.wire",
        type: "radioGroup",
        group: "payment_method_group",
        content: "WIRE_TRANSFER",
      }),
    ],
  ],
} as any;

const radioGroupWithOptionsTemplate = {
  basePdf: "mock",
  schemas: [
    [
      createField({
        name: "financing.conventional",
        type: "radioGroup",
        group: "financing_type_group",
        options: ["CONVENTIONAL"],
      }),
      createField({
        name: "financing.fha",
        type: "radioGroup",
        group: "financing_type_group",
        options: "FHA_LOAN",
      }),
      createField({
        name: "financing.cash",
        type: "radioGroup",
        group: "financing_type_group",
      }),
    ],
  ],
} as any;

const mixedFieldsTemplate = {
  basePdf: "mock",
  schemas: [
    [
      createField({ name: "buyer_name", type: "text" }),
      createField({ name: "closing_date", type: "date" }),
      createField({ name: "include_hoa", type: "checkbox" }),
      createField({
        name: "payment.cash",
        type: "radioGroup",
        group: "payment_method_group",
      }),
      createField({
        name: "payment.check",
        type: "radioGroup",
        group: "payment_method_group",
      }),
    ],
  ],
} as any;

// ============================================================================
// Tests: convertContractDataToInputs - Radio Groups with Group Key
// ============================================================================

describe("convertContractDataToInputs - Radio Groups with Group Key", () => {
  it("selects radio option when group key is set", () => {
    const contractData = {
      payment_method_group: "payment.cash",
    };

    const inputs = convertContractDataToInputs(
      radioGroupTemplate,
      contractData
    );

    expect(inputs.length).toBe(1); // One page
    expect(inputs[0]["payment.cash"]).toBe("true");
    expect(inputs[0]["payment.check"]).toBe("");
    expect(inputs[0]["payment.wire"]).toBe("");
  });

  it("uses 'true' for selected field regardless of content/options", () => {
    const contractData = {
      payment_method_group: "payment.wire",
    };

    const inputs = convertContractDataToInputs(
      radioGroupTemplate,
      contractData
    );

    // Always use "true" for selected, not field content/options
    expect(inputs[0]["payment.wire"]).toBe("true");
    expect(inputs[0]["payment.cash"]).toBe("");
    expect(inputs[0]["payment.check"]).toBe("");
  });

  it("uses 'true' for selected field with options array", () => {
    const contractData = {
      financing_type_group: "financing.conventional",
    };

    const inputs = convertContractDataToInputs(
      radioGroupWithOptionsTemplate,
      contractData
    );

    // Always use "true" for selected
    expect(inputs[0]["financing.conventional"]).toBe("true");
    expect(inputs[0]["financing.fha"]).toBe("");
    expect(inputs[0]["financing.cash"]).toBe("");
  });

  it("uses 'true' for selected field with string options", () => {
    const contractData = {
      financing_type_group: "financing.fha",
    };

    const inputs = convertContractDataToInputs(
      radioGroupWithOptionsTemplate,
      contractData
    );

    expect(inputs[0]["financing.fha"]).toBe("true");
  });

  it("clears all options when group key has no value", () => {
    const contractData = {
      payment_method_group: "",
    };

    const inputs = convertContractDataToInputs(
      radioGroupTemplate,
      contractData
    );

    expect(inputs[0]["payment.cash"]).toBe("");
    expect(inputs[0]["payment.check"]).toBe("");
    expect(inputs[0]["payment.wire"]).toBe("");
  });
});

// ============================================================================
// Tests: convertContractDataToInputs - Radio Groups Fallback
// ============================================================================

describe("convertContractDataToInputs - Radio Groups Fallback", () => {
  it("uses fallback when group key is not set but individual field has truthy value", () => {
    const contractData = {
      // No group key set, but individual field has value
      "payment.cash": "true",
    };

    const inputs = convertContractDataToInputs(
      radioGroupTemplate,
      contractData
    );

    // Should detect payment.cash as selected via fallback
    expect(inputs[0]["payment.cash"]).toBe("true");
    expect(inputs[0]["payment.check"]).toBe("");
    expect(inputs[0]["payment.wire"]).toBe("");
  });

  it("uses fallback and sets 'true' for selected field", () => {
    const contractData = {
      // No group key set, but individual field has value
      "payment.wire": "true",
    };

    const inputs = convertContractDataToInputs(
      radioGroupTemplate,
      contractData
    );

    // Should use "true" for selected field
    expect(inputs[0]["payment.wire"]).toBe("true");
    expect(inputs[0]["payment.cash"]).toBe("");
    expect(inputs[0]["payment.check"]).toBe("");
  });

  it("ignores 'false' string value in fallback detection", () => {
    const contractData = {
      "payment.cash": "false",
      "payment.check": "",
      "payment.wire": "",
    };

    const inputs = convertContractDataToInputs(
      radioGroupTemplate,
      contractData
    );

    // All should be empty since "false" is not truthy
    expect(inputs[0]["payment.cash"]).toBe("");
    expect(inputs[0]["payment.check"]).toBe("");
    expect(inputs[0]["payment.wire"]).toBe("");
  });

  it("prefers group key over individual field values", () => {
    const contractData = {
      payment_method_group: "payment.check", // Group key says check
      "payment.cash": "true", // But cash also has a truthy value
    };

    const inputs = convertContractDataToInputs(
      radioGroupTemplate,
      contractData
    );

    // Group key takes precedence
    expect(inputs[0]["payment.cash"]).toBe("");
    expect(inputs[0]["payment.check"]).toBe("true");
    expect(inputs[0]["payment.wire"]).toBe("");
  });
});

// ============================================================================
// Tests: convertContractDataToInputs - Mixed Fields
// ============================================================================

describe("convertContractDataToInputs - Mixed Fields", () => {
  it("handles text fields", () => {
    const contractData = {
      buyer_name: "John Smith",
      closing_date: "2026-03-15",
    };

    const inputs = convertContractDataToInputs(
      mixedFieldsTemplate,
      contractData
    );

    expect(inputs[0]["buyer_name"]).toBe("John Smith");
    expect(inputs[0]["closing_date"]).toBe("2026-03-15");
  });

  it("handles checkbox fields with boolean values", () => {
    const contractData = {
      include_hoa: true,
    };

    const inputs = convertContractDataToInputs(
      mixedFieldsTemplate,
      contractData
    );

    expect(inputs[0]["include_hoa"]).toBe("true");
  });

  it("handles checkbox fields with string values", () => {
    const contractData = {
      include_hoa: "true",
    };

    const inputs = convertContractDataToInputs(
      mixedFieldsTemplate,
      contractData
    );

    expect(inputs[0]["include_hoa"]).toBe("true");
  });

  it("handles false checkbox as string 'false'", () => {
    const contractData = {
      include_hoa: false,
    };

    const inputs = convertContractDataToInputs(
      mixedFieldsTemplate,
      contractData
    );

    expect(inputs[0]["include_hoa"]).toBe("false");
  });

  it("handles mixed field types together", () => {
    const contractData = {
      buyer_name: "Jane Doe",
      include_hoa: true,
      payment_method_group: "payment.cash",
    };

    const inputs = convertContractDataToInputs(
      mixedFieldsTemplate,
      contractData
    );

    expect(inputs[0]["buyer_name"]).toBe("Jane Doe");
    expect(inputs[0]["include_hoa"]).toBe("true");
    expect(inputs[0]["payment.cash"]).toBe("true");
    expect(inputs[0]["payment.check"]).toBe("");
  });
});

// ============================================================================
// Tests: convertContractDataToInputs - Real Template
// ============================================================================

describe("convertContractDataToInputs - Real Template", () => {
  it("handles real contract data with earnest money holder group", () => {
    const contractData = {
      earnest_money_holder_group:
        "earnest_money_holder.held_by_broker_trust_account",
    };

    const inputs = convertContractDataToInputs(realTemplate, contractData);

    // Should select the correct option
    expect(inputs[1]["earnest_money_holder.held_by_broker_trust_account"]).toBe(
      "true"
    );
    expect(inputs[1]["earnest_money_holder_held.by_title_or_escrow"]).toBe("");
  });

  it("handles real contract data with payment method group", () => {
    const contractData = {
      "purchase.property.earnest_money_payment_method_group":
        "purchase.property.earnest_money_payment_method.wire_transfer",
    };

    const inputs = convertContractDataToInputs(realTemplate, contractData);

    expect(
      inputs[1]["purchase.property.earnest_money_payment_method.wire_transfer"]
    ).toBe("true");
    expect(
      inputs[1]["purchase.property.earnest_money_payment_method.personal_check"]
    ).toBe("");
    expect(
      inputs[1]["purchase.property.earnest_money_payment_method.other_method"]
    ).toBe("");
  });

  it("returns same object for each page", () => {
    const contractData = {
      earnest_money_holder_group:
        "earnest_money_holder.held_by_broker_trust_account",
    };

    const inputs = convertContractDataToInputs(realTemplate, contractData);

    // All pages should have the same values
    expect(inputs[0]).toEqual(inputs[1]);
    expect(inputs[1]).toEqual(inputs[2]);
  });
});

// ============================================================================
// Tests: convertContractDataToInputs - Edge Cases
// ============================================================================

describe("convertContractDataToInputs - Edge Cases", () => {
  it("returns empty array for null contractData", () => {
    const inputs = convertContractDataToInputs(radioGroupTemplate, null as any);
    expect(inputs).toEqual([]);
  });

  it("returns empty array for undefined contractData", () => {
    const inputs = convertContractDataToInputs(
      radioGroupTemplate,
      undefined as any
    );
    expect(inputs).toEqual([]);
  });

  it("handles empty template schemas", () => {
    const emptyTemplate = { basePdf: "mock", schemas: [] } as any;
    const inputs = convertContractDataToInputs(emptyTemplate, { foo: "bar" });
    expect(inputs).toEqual([]);
  });

  it("handles fields without names", () => {
    const templateWithBadFields = {
      basePdf: "mock",
      schemas: [
        [
          createField({ type: "text" }),
          createField({ name: "valid", type: "text" }),
        ],
      ],
    } as any;
    const inputs = convertContractDataToInputs(templateWithBadFields, {
      valid: "value",
    });
    expect(inputs[0]["valid"]).toBe("value");
    expect(Object.keys(inputs[0]).length).toBe(1);
  });

  it("handles object values by JSON stringifying", () => {
    const template = {
      basePdf: "mock",
      schemas: [[createField({ name: "metadata", type: "text" })]],
    } as any;
    const inputs = convertContractDataToInputs(template, {
      metadata: { key: "value" },
    });
    expect(inputs[0]["metadata"]).toBe('{"key":"value"}');
  });

  it("skips undefined values", () => {
    const template = {
      basePdf: "mock",
      schemas: [[createField({ name: "field1", type: "text" })]],
    } as any;
    const inputs = convertContractDataToInputs(template, {
      field1: undefined,
    });
    expect(inputs[0]["field1"]).toBeUndefined();
  });

  it("skips null values", () => {
    const template = {
      basePdf: "mock",
      schemas: [[createField({ name: "field1", type: "text" })]],
    } as any;
    const inputs = convertContractDataToInputs(template, {
      field1: null,
    });
    expect(inputs[0]["field1"]).toBeUndefined();
  });
});

// ============================================================================
// Tests: getRadioInputValue
// ============================================================================

describe("getRadioInputValue", () => {
  // For grouped radio fields, always returns "true"
  // This ensures consistent behavior with the plugin's isSelected check

  it("always returns 'true' for selected radio fields", () => {
    expect(getRadioInputValue()).toBe("true");
  });
});
