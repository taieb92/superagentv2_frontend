import { describe, it, expect } from "vitest";
import {
  isRadioGroupField,
  getFieldFamily,
  formatFieldLabel,
  formatRadioOptionLabel,
  formatFamilyLabel,
  isOtherDescriptionField,
  isOtherSelected,
  buildDescriptionMap,
  toHtmlDateValue,
} from "../form-view-utils";

describe("isRadioGroupField", () => {
  it("returns true for valid radio group field", () => {
    expect(isRadioGroupField({ type: "radioGroup", group: "some_group" })).toBe(
      true
    );
  });

  it("returns true for case-insensitive radioGroup type", () => {
    expect(isRadioGroupField({ type: "RADIOGROUP", group: "some_group" })).toBe(
      true
    );
    expect(isRadioGroupField({ type: "RadioGroup", group: "some_group" })).toBe(
      true
    );
  });

  it("returns false when type is not radioGroup", () => {
    expect(isRadioGroupField({ type: "text", group: "some_group" })).toBe(
      false
    );
    expect(isRadioGroupField({ type: "checkbox", group: "some_group" })).toBe(
      false
    );
  });

  it("returns false when group property is missing", () => {
    expect(isRadioGroupField({ type: "radioGroup" })).toBe(false);
    expect(isRadioGroupField({ type: "radioGroup", group: null })).toBe(false);
    expect(isRadioGroupField({ type: "radioGroup", group: "" })).toBe(false);
  });

  it("returns false for null/undefined field", () => {
    expect(isRadioGroupField(null)).toBe(false);
    expect(isRadioGroupField(undefined)).toBe(false);
    expect(isRadioGroupField({})).toBe(false);
  });
});

describe("getFieldFamily", () => {
  describe("basic hierarchy extraction", () => {
    it("extracts family from dotted path", () => {
      expect(getFieldFamily("purchase.parties.buyer_names")).toBe(
        "purchase.parties"
      );
    });

    it("handles deeply nested paths", () => {
      expect(
        getFieldFamily("purchase.property.included_appliances.refrigerator")
      ).toBe("purchase.property.included_appliances");
    });

    it("returns empty string for single segment", () => {
      expect(getFieldFamily("refrigerator")).toBe("");
      expect(getFieldFamily("simple_field_name")).toBe("");
    });

    it("handles two segments", () => {
      expect(getFieldFamily("purchase.price")).toBe("purchase");
    });
  });

  describe("description suffix handling", () => {
    it("strips _description suffix before computing family", () => {
      expect(
        getFieldFamily(
          "purchase.property.included_appliances.refrigerator_description"
        )
      ).toBe("purchase.property.included_appliances");
    });

    it("groups description with parent field", () => {
      const parentFamily = getFieldFamily(
        "purchase.property.included_appliances.refrigerator"
      );
      const descFamily = getFieldFamily(
        "purchase.property.included_appliances.refrigerator_description"
      );
      expect(parentFamily).toBe(descFamily);
    });

    it("handles _description at root level", () => {
      expect(getFieldFamily("refrigerator_description")).toBe("");
    });
  });

  describe("underscore preservation", () => {
    it("preserves underscores in field names (does not split on underscore)", () => {
      expect(
        getFieldFamily("purchase.property.lead_based_paint_disclosure")
      ).toBe("purchase.property");
    });

    it("keeps compound names together", () => {
      expect(getFieldFamily("purchase.earnest_money_holder.option")).toBe(
        "purchase.earnest_money_holder"
      );
    });
  });

  describe("edge cases", () => {
    it("handles empty string", () => {
      expect(getFieldFamily("")).toBe("");
    });

    it("handles leading/trailing dots", () => {
      expect(getFieldFamily(".purchase.parties.")).toBe("purchase");
    });
  });
});

describe("formatFieldLabel", () => {
  describe("basic formatting", () => {
    it("formats simple field name", () => {
      expect(formatFieldLabel("refrigerator")).toBe("Refrigerator");
    });

    it("formats underscore-separated name", () => {
      expect(formatFieldLabel("buyer_names")).toBe("Buyer Names");
    });

    it("extracts and formats last segment of dotted path", () => {
      expect(formatFieldLabel("purchase.parties.buyer_names")).toBe(
        "Buyer Names"
      );
    });
  });

  describe("full segment preservation", () => {
    it("preserves full compound name (lead_based_paint_disclosure)", () => {
      expect(
        formatFieldLabel("purchase.property.lead_based_paint_disclosure")
      ).toBe("Lead Based Paint Disclosure");
    });

    it("preserves full name for included_addenda_flags", () => {
      expect(formatFieldLabel("purchase.included_addenda_flags")).toBe(
        "Included Addenda Flags"
      );
    });

    it("preserves full name for buyer_sale_contingency_addendum_included", () => {
      expect(
        formatFieldLabel("purchase.buyer_sale_contingency_addendum_included")
      ).toBe("Buyer Sale Contingency Addendum Included");
    });

    it("preserves full name for loan_assumption", () => {
      expect(formatFieldLabel("purchase.property.loan_assumption")).toBe(
        "Loan Assumption"
      );
    });
  });

  describe("camelCase handling", () => {
    it("splits camelCase words", () => {
      expect(formatFieldLabel("buyerNames")).toBe("Buyer Names");
    });

    it("handles mixed camelCase and underscore", () => {
      expect(formatFieldLabel("purchase.buyerNames_test")).toBe(
        "Buyer Names Test"
      );
    });
  });

  describe("edge cases", () => {
    it("handles empty string", () => {
      expect(formatFieldLabel("")).toBe("");
    });

    it("handles single character", () => {
      expect(formatFieldLabel("a")).toBe("A");
    });

    it("handles numbers in name", () => {
      expect(formatFieldLabel("property1_description")).toBe(
        "Property1 Description"
      );
    });
  });

  describe("regression tests - labels should not be too short", () => {
    it("does NOT truncate to just last word", () => {
      // These were the buggy behaviors we fixed
      expect(
        formatFieldLabel("purchase.property.lead_based_paint_disclosure")
      ).not.toBe("Disclosure");
      expect(formatFieldLabel("purchase.included_addenda_flags")).not.toBe(
        "Flags"
      );
      expect(
        formatFieldLabel("purchase.buyer_sale_contingency_addendum_included")
      ).not.toBe("Included");
    });
  });
});

describe("formatRadioOptionLabel", () => {
  describe("extracting meaningful suffix from group name", () => {
    it("extracts personal_check from earnest_money_payment_method", () => {
      expect(
        formatRadioOptionLabel(
          "purchase.property.earnest_money_payment_method.personal_check",
          "purchase.property.earnest_money_payment_method_group"
        )
      ).toBe("Personal Check");
    });

    it("extracts wire_transfer", () => {
      expect(
        formatRadioOptionLabel(
          "purchase.property.earnest_money_payment_method.wire_transfer",
          "purchase.property.earnest_money_payment_method_group"
        )
      ).toBe("Wire Transfer");
    });

    it("extracts other_method", () => {
      expect(
        formatRadioOptionLabel(
          "purchase.property.earnest_money_payment_method.other_method",
          "purchase.property.earnest_money_payment_method_group"
        )
      ).toBe("Other Method");
    });
  });

  describe("earnest money holder options", () => {
    it("extracts held_by_broker_trust_account", () => {
      expect(
        formatRadioOptionLabel(
          "earnest_money_holder.held_by_broker_trust_account",
          "earnest_money_holder_group"
        )
      ).toBe("Held By Broker Trust Account");
    });

    it("extracts held_by_title_or_escrow", () => {
      // Note: "Held" is included because field name has slightly different structure
      expect(
        formatRadioOptionLabel(
          "earnest_money_holder_held.by_title_or_escrow",
          "earnest_money_holder_group"
        )
      ).toBe("Held By Title Or Escrow");
    });
  });

  describe("financing type options", () => {
    it("extracts type_cash", () => {
      expect(
        formatRadioOptionLabel(
          "purchase.financing.type_cash",
          "purchase.financing.type_group"
        )
      ).toBe("Cash");
    });

    it("extracts type_conventional", () => {
      expect(
        formatRadioOptionLabel(
          "purchase.financing.type_conventional",
          "purchase.financing.type_group"
        )
      ).toBe("Conventional");
    });
  });

  describe("fallback behavior", () => {
    it("falls back to last segments when no meaningful parts found", () => {
      // When field name exactly matches group base, use last segments
      const result = formatRadioOptionLabel("exact_match", "exact_match_group");
      expect(result.length).toBeGreaterThan(0);
    });
  });
});

describe("formatFamilyLabel", () => {
  it("formats single segment", () => {
    expect(formatFamilyLabel("purchase")).toBe("Purchase");
  });

  it("formats dotted path", () => {
    expect(formatFamilyLabel("purchase.parties")).toBe("Purchase Parties");
  });

  it("formats path with underscores", () => {
    expect(formatFamilyLabel("purchase.property.included_appliances")).toBe(
      "Purchase Property Included Appliances"
    );
  });

  it("handles camelCase in segments", () => {
    expect(formatFamilyLabel("purchase.buyerInfo")).toBe("Purchase Buyer Info");
  });

  it("returns empty string for empty input", () => {
    expect(formatFamilyLabel("")).toBe("");
  });

  it("handles mixed separators", () => {
    expect(formatFamilyLabel("purchase_info.parties")).toBe(
      "Purchase Info Parties"
    );
  });
});

describe("isOtherDescriptionField", () => {
  const mockRadioGroups = {
    "purchase.property.earnest_money_payment_method_group": [
      { name: "option1" },
    ],
    something_group: [{ name: "option2" }],
  };

  describe("detection of other description fields", () => {
    it("identifies other_method_description as other field", () => {
      const result = isOtherDescriptionField(
        "purchase.property.earnest_money_payment_method.other_method_description",
        mockRadioGroups
      );
      expect(result.isOther).toBe(true);
      expect(result.groupKey).toBe(
        "purchase.property.earnest_money_payment_method_group"
      );
    });

    it("returns correct group key when found with underscore pattern", () => {
      const result = isOtherDescriptionField(
        "something_other_description",
        mockRadioGroups
      );
      expect(result.isOther).toBe(true);
      expect(result.groupKey).toBe("something_group");
    });
  });

  describe("non-other fields", () => {
    it("returns false for regular description field", () => {
      const result = isOtherDescriptionField(
        "purchase.property.refrigerator_description",
        mockRadioGroups
      );
      expect(result.isOther).toBe(false);
      expect(result.groupKey).toBe(null);
    });

    it("returns false for field without description suffix", () => {
      const result = isOtherDescriptionField(
        "purchase.property.other_method",
        mockRadioGroups
      );
      expect(result.isOther).toBe(false);
    });

    it("returns false for regular field", () => {
      const result = isOtherDescriptionField(
        "purchase.property.city",
        mockRadioGroups
      );
      expect(result.isOther).toBe(false);
    });
  });

  describe("group key not found", () => {
    it("returns isOther true but groupKey null when group not in map", () => {
      const result = isOtherDescriptionField(
        "unknown.other_method_description",
        mockRadioGroups
      );
      expect(result.isOther).toBe(true);
      expect(result.groupKey).toBe(null);
    });
  });
});

describe("isOtherSelected", () => {
  it("returns true when selected value contains 'other'", () => {
    expect(
      isOtherSelected("group_key", { group_key: "some.other_option" })
    ).toBe(true);
  });

  it("returns true for case-insensitive 'other'", () => {
    expect(isOtherSelected("group_key", { group_key: "OTHER_OPTION" })).toBe(
      true
    );
    expect(isOtherSelected("group_key", { group_key: "Other_Method" })).toBe(
      true
    );
  });

  it("returns false when value does not contain 'other'", () => {
    expect(isOtherSelected("group_key", { group_key: "personal_check" })).toBe(
      false
    );
  });

  it("returns false when key not in data", () => {
    expect(isOtherSelected("missing_key", { group_key: "value" })).toBe(false);
  });

  it("handles null/undefined contract data", () => {
    expect(isOtherSelected("key", null)).toBe(false);
    expect(isOtherSelected("key", undefined)).toBe(false);
  });
});

describe("buildDescriptionMap", () => {
  it("maps description fields to parent names", () => {
    const fields = [
      { name: "refrigerator", type: "checkbox" },
      { name: "refrigerator_description", type: "text" },
      { name: "washer", type: "checkbox" },
      { name: "washer_description", type: "text" },
    ];

    const map = buildDescriptionMap(fields);

    expect(map.get("refrigerator")).toEqual({
      name: "refrigerator_description",
      type: "text",
    });
    expect(map.get("washer")).toEqual({
      name: "washer_description",
      type: "text",
    });
  });

  it("does not include non-description fields", () => {
    const fields = [
      { name: "refrigerator", type: "checkbox" },
      { name: "city", type: "text" },
    ];

    const map = buildDescriptionMap(fields);

    expect(map.size).toBe(0);
  });

  it("handles nested paths", () => {
    const fields = [
      {
        name: "purchase.property.included_appliances.dryer_description",
        type: "text",
      },
    ];

    const map = buildDescriptionMap(fields);

    expect(
      map.get("purchase.property.included_appliances.dryer")
    ).toBeDefined();
  });

  it("handles empty array", () => {
    const map = buildDescriptionMap([]);
    expect(map.size).toBe(0);
  });

  it("handles fields without name property", () => {
    const fields = [
      { type: "text" },
      { name: "valid_description", type: "text" },
    ];

    const map = buildDescriptionMap(fields);

    expect(map.get("valid")).toEqual({
      name: "valid_description",
      type: "text",
    });
  });
});

describe("integration: field grouping scenarios", () => {
  describe("appliance fields grouping", () => {
    const applianceFields = [
      "purchase.property.included_appliances.refrigerator",
      "purchase.property.included_appliances.refrigerator_description",
      "purchase.property.included_appliances.washer",
      "purchase.property.included_appliances.washer_description",
      "purchase.property.included_appliances.dryer",
      "purchase.property.included_appliances.dryer_description",
    ];

    it("all appliance fields belong to same family", () => {
      const families = applianceFields.map(getFieldFamily);
      const uniqueFamilies = [...new Set(families)];
      expect(uniqueFamilies).toHaveLength(1);
      expect(uniqueFamilies[0]).toBe("purchase.property.included_appliances");
    });

    it("appliance labels are clear", () => {
      expect(
        formatFieldLabel("purchase.property.included_appliances.refrigerator")
      ).toBe("Refrigerator");
      expect(
        formatFieldLabel(
          "purchase.property.included_appliances.refrigerator_description"
        )
      ).toBe("Refrigerator Description");
    });
  });

  describe("earnest money payment method grouping", () => {
    const fields = [
      "purchase.property.earnest_money_payment_method.personal_check",
      "purchase.property.earnest_money_payment_method.wire_transfer",
      "purchase.property.earnest_money_payment_method.other_method",
      "purchase.property.earnest_money_payment_method.other_method_description",
    ];

    it("all payment method fields belong to same family", () => {
      const families = fields.map(getFieldFamily);
      const uniqueFamilies = [...new Set(families)];
      expect(uniqueFamilies).toHaveLength(1);
      expect(uniqueFamilies[0]).toBe(
        "purchase.property.earnest_money_payment_method"
      );
    });
  });

  describe("mixed field types at purchase level", () => {
    const purchaseFields = [
      "purchase.included_addenda_flags",
      "purchase.buyer_sale_contingency_addendum_included",
      "purchase.domestic_well_addendum_included",
    ];

    it("all belong to purchase family", () => {
      const families = purchaseFields.map(getFieldFamily);
      expect(families.every((f) => f === "purchase")).toBe(true);
    });

    it("labels are descriptive, not truncated", () => {
      expect(formatFieldLabel("purchase.included_addenda_flags")).toBe(
        "Included Addenda Flags"
      );
      expect(
        formatFieldLabel("purchase.buyer_sale_contingency_addendum_included")
      ).toBe("Buyer Sale Contingency Addendum Included");
      expect(formatFieldLabel("purchase.domestic_well_addendum_included")).toBe(
        "Domestic Well Addendum Included"
      );
    });
  });
});

// ============================================================================
// Date Conversion Tests
// ============================================================================

describe("toHtmlDateValue", () => {
  it("returns yyyy-mm-dd as-is", () => {
    expect(toHtmlDateValue("2026-02-15")).toBe("2026-02-15");
    expect(toHtmlDateValue("2026-12-31")).toBe("2026-12-31");
  });

  it("converts yyyy/mm/dd to yyyy-mm-dd", () => {
    expect(toHtmlDateValue("2026/02/15")).toBe("2026-02-15");
    expect(toHtmlDateValue("2026/12/31")).toBe("2026-12-31");
  });

  it("converts US format mm/dd/yyyy", () => {
    expect(toHtmlDateValue("02/15/2026")).toBe("2026-02-15");
    expect(toHtmlDateValue("12/31/2026")).toBe("2026-12-31");
  });

  it("detects EU format when day > 12", () => {
    expect(toHtmlDateValue("15/02/2026")).toBe("2026-02-15");
    expect(toHtmlDateValue("31/12/2026")).toBe("2026-12-31");
  });

  it("converts written month formats", () => {
    expect(toHtmlDateValue("January 15, 2026")).toBe("2026-01-15");
    expect(toHtmlDateValue("March 15, 2026")).toBe("2026-03-15");
  });

  it("returns empty for invalid input", () => {
    expect(toHtmlDateValue(null)).toBe("");
    expect(toHtmlDateValue(undefined)).toBe("");
    expect(toHtmlDateValue("")).toBe("");
    expect(toHtmlDateValue("not a date")).toBe("");
  });
});
