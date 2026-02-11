/**
 * Integration tests for FormView using real contract data.
 *
 * These tests verify the complete flow from template schema to render-ready data,
 * using actual Arizona Purchase Contract field structures.
 */

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFormFields } from "../useFormFields";
import {
  isRadioGroupField,
  getFieldFamily,
  formatFieldLabel,
  formatRadioOptionLabel,
  buildDescriptionMap,
  isOtherDescriptionField,
  isOtherSelected,
} from "../form-view-utils";
import {
  isGroupedRadioItem,
  isCheckboxWithDescriptionItem,
} from "../form-view-types";
import {
  realContractData,
  realTemplate,
  realTemplateSchemaPage2,
  realTemplateSchemaPage3,
  expectedRadioGroups,
} from "./__fixtures__/test-data";

// ============================================================================
// useFormFields Hook Integration Tests
// ============================================================================

describe("useFormFields hook integration", () => {
  describe("field extraction", () => {
    it("extracts all fields from multi-page template", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: realTemplate as any,
          contractData: realContractData,
          currentPage: 2,
        })
      );

      // Should have fields from page 2 and page 3
      const totalExpectedFields =
        realTemplateSchemaPage2.length + realTemplateSchemaPage3.length;
      expect(result.current.allFields.length).toBe(totalExpectedFields);
    });

    it("correctly assigns page indices to fields", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: realTemplate as any,
          contractData: realContractData,
          currentPage: 2,
        })
      );

      const page2Fields = result.current.allFields.filter(
        (f) => f.pageIndex === 2
      );
      const page3Fields = result.current.allFields.filter(
        (f) => f.pageIndex === 3
      );

      expect(page2Fields.length).toBe(realTemplateSchemaPage2.length);
      expect(page3Fields.length).toBe(realTemplateSchemaPage3.length);
    });
  });

  describe("radio group detection", () => {
    it("builds correct global radio groups", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: realTemplate as any,
          contractData: realContractData,
          currentPage: 2,
        })
      );

      const { globalRadioGroups } = result.current;

      // Should have earnest_money_holder_group
      expect(globalRadioGroups["earnest_money_holder_group"]).toBeDefined();
      expect(globalRadioGroups["earnest_money_holder_group"].length).toBe(2);

      // Should have payment method group
      expect(
        globalRadioGroups[
          "purchase.property.earnest_money_payment_method_group"
        ]
      ).toBeDefined();
      expect(
        globalRadioGroups[
          "purchase.property.earnest_money_payment_method_group"
        ].length
      ).toBe(3);
    });

    it("includes correct option names in radio groups", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: realTemplate as any,
          contractData: realContractData,
          currentPage: 2,
        })
      );

      const holderGroup =
        result.current.globalRadioGroups["earnest_money_holder_group"];
      const holderNames = holderGroup.map((f) => f.name);

      expect(holderNames).toContain(
        "earnest_money_holder.held_by_broker_trust_account"
      );
      expect(holderNames).toContain(
        "earnest_money_holder_held.by_title_or_escrow"
      );
    });
  });

  describe("page filtering", () => {
    it("returns only current page fields in currentPageFields", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: realTemplate as any,
          contractData: realContractData,
          currentPage: 3,
        })
      );

      expect(result.current.currentPageFields.length).toBe(
        realTemplateSchemaPage3.length
      );
      expect(
        result.current.currentPageFields.every((f) => f.pageIndex === 3)
      ).toBe(true);
    });
  });

  describe("family grouping", () => {
    it("groups fields by family correctly", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: realTemplate as any,
          contractData: realContractData,
          currentPage: 3,
        })
      );

      const { fieldsByFamily } = result.current;

      // All appliance fields should be in same family
      expect(
        fieldsByFamily["purchase.property.included_appliances"]
      ).toBeDefined();
      expect(
        fieldsByFamily["purchase.property.included_appliances"].length
      ).toBe(realTemplateSchemaPage3.length);
    });

    it("groups description fields with their parents in same family", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: realTemplate as any,
          contractData: realContractData,
          currentPage: 3,
        })
      );

      const applianceFamily =
        result.current.fieldsByFamily["purchase.property.included_appliances"];
      const fieldNames = applianceFamily.map((f) => f.name);

      // Both refrigerator and refrigerator_description should be in same family
      expect(fieldNames).toContain(
        "purchase.property.included_appliances.refrigerator"
      );
      expect(fieldNames).toContain(
        "purchase.property.included_appliances.refrigerator_description"
      );
    });
  });

  describe("render data processing", () => {
    it("creates CheckboxWithDescription items for checkbox+description pairs", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: realTemplate as any,
          contractData: realContractData,
          currentPage: 3,
        })
      );

      const { familyRenderData } = result.current;
      const applianceSection = familyRenderData.find(
        (f) => f.familyKey === "purchase.property.included_appliances"
      );

      expect(applianceSection).toBeDefined();

      // Should have paired items
      const pairedItems = applianceSection!.items.filter(
        isCheckboxWithDescriptionItem
      );
      expect(pairedItems.length).toBeGreaterThan(0);

      // Verify structure of paired item
      const refrigeratorPair = pairedItems.find(
        (p) =>
          p.checkboxField.name ===
          "purchase.property.included_appliances.refrigerator"
      );
      expect(refrigeratorPair).toBeDefined();
      expect(refrigeratorPair!.descriptionField.name).toBe(
        "purchase.property.included_appliances.refrigerator_description"
      );
    });

    it("creates GroupedRadio items for radio groups", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: realTemplate as any,
          contractData: realContractData,
          currentPage: 2,
        })
      );

      const { familyRenderData } = result.current;

      // Find all grouped radio items
      const allGroupedRadios = familyRenderData.flatMap((f) =>
        f.items.filter(isGroupedRadioItem)
      );

      // Should have radio groups for earnest money holder and payment method
      const groupNames = allGroupedRadios.map((r) => r.groupName);
      expect(groupNames).toContain("earnest_money_holder_group");
      expect(groupNames).toContain(
        "purchase.property.earnest_money_payment_method_group"
      );
    });

    it("deduplicates radio groups across family sections", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: realTemplate as any,
          contractData: realContractData,
          currentPage: 2,
        })
      );

      const { familyRenderData } = result.current;

      // Count occurrences of each radio group
      const groupCounts: Record<string, number> = {};
      familyRenderData.forEach((family) => {
        family.items.forEach((item) => {
          if (isGroupedRadioItem(item)) {
            groupCounts[item.groupName] =
              (groupCounts[item.groupName] || 0) + 1;
          }
        });
      });

      // Each radio group should appear exactly once
      Object.values(groupCounts).forEach((count) => {
        expect(count).toBe(1);
      });
    });
  });
});

// ============================================================================
// Real Data Label Formatting Tests
// ============================================================================

describe("label formatting with real data", () => {
  describe("formatFieldLabel with real field names", () => {
    const realFieldLabelTests = [
      // Text fields
      ["purchase.parties.buyer_names", "Buyer Names"],
      ["purchase.parties.seller_name", "Seller Name"],
      ["purchase.property.city", "City"],
      ["purchase.property.county", "County"],
      ["purchase.property.full_purchase_price", "Full Purchase Price"],
      ["purchase.property.earnest_money", "Earnest Money"],
      ["purchase.property.assessors_parcel_number", "Assessors Parcel Number"],
      ["purchase.property.premises_address", "Premises Address"],
      ["purchase.closing_and_possession.closing_date", "Closing Date"],

      // Checkbox fields
      ["purchase.property.hoa", "Hoa"],
      [
        "purchase.property.lead_based_paint_disclosure",
        "Lead Based Paint Disclosure",
      ],
      ["purchase.property.loan_assumption", "Loan Assumption"],
      ["purchase.property.seller_financing", "Seller Financing"],
      ["purchase.property.seller_compensation", "Seller Compensation"],
      ["purchase.property.short_sale", "Short Sale"],
      ["purchase.property.solar_addendum", "Solar Addendum"],
      [
        "purchase.buyer_sale_contingency_addendum_included",
        "Buyer Sale Contingency Addendum Included",
      ],
      [
        "purchase.domestic_well_addendum_included",
        "Domestic Well Addendum Included",
      ],
      ["purchase.included_addenda_flags", "Included Addenda Flags"],

      // Appliance fields
      ["purchase.property.included_appliances.refrigerator", "Refrigerator"],
      ["purchase.property.included_appliances.washer", "Washer"],
      ["purchase.property.included_appliances.dryer", "Dryer"],
      [
        "purchase.property.included_appliances.refrigerator_description",
        "Refrigerator Description",
      ],
    ];

    it.each(realFieldLabelTests)(
      "formats '%s' as '%s'",
      (fieldName, expected) => {
        expect(formatFieldLabel(fieldName)).toBe(expected);
      }
    );
  });

  describe("formatRadioOptionLabel with real radio options", () => {
    it("formats earnest money holder options correctly", () => {
      expect(
        formatRadioOptionLabel(
          "earnest_money_holder.held_by_broker_trust_account",
          "earnest_money_holder_group"
        )
      ).toBe("Held By Broker Trust Account");
    });

    it("formats payment method options correctly", () => {
      expect(
        formatRadioOptionLabel(
          "purchase.property.earnest_money_payment_method.personal_check",
          "purchase.property.earnest_money_payment_method_group"
        )
      ).toBe("Personal Check");

      expect(
        formatRadioOptionLabel(
          "purchase.property.earnest_money_payment_method.wire_transfer",
          "purchase.property.earnest_money_payment_method_group"
        )
      ).toBe("Wire Transfer");

      expect(
        formatRadioOptionLabel(
          "purchase.property.earnest_money_payment_method.other_method",
          "purchase.property.earnest_money_payment_method_group"
        )
      ).toBe("Other Method");
    });
  });
});

// ============================================================================
// Real Data Family Grouping Tests
// ============================================================================

describe("family grouping with real data", () => {
  const familyGroupingTests = [
    // Page 2 fields
    [
      "earnest_money_holder.held_by_broker_trust_account",
      "earnest_money_holder",
    ],
    ["property.zip_code", "property"],
    ["purchase.parties.buyer_names", "purchase.parties"],
    ["purchase.parties.seller_name", "purchase.parties"],
    ["purchase.property.city", "purchase.property"],
    ["purchase.property.earnest_money", "purchase.property"],
    [
      "purchase.closing_and_possession.closing_date",
      "purchase.closing_and_possession",
    ],
    [
      "purchase.property.earnest_money_payment_method.personal_check",
      "purchase.property.earnest_money_payment_method",
    ],

    // Page 3 fields - appliances
    [
      "purchase.property.included_appliances.refrigerator",
      "purchase.property.included_appliances",
    ],
    [
      "purchase.property.included_appliances.refrigerator_description",
      "purchase.property.included_appliances",
    ],
    [
      "purchase.property.included_appliances.washer",
      "purchase.property.included_appliances",
    ],
    [
      "purchase.property.included_appliances.washer_description",
      "purchase.property.included_appliances",
    ],
  ];

  it.each(familyGroupingTests)(
    "groups '%s' into family '%s'",
    (fieldName, expectedFamily) => {
      expect(getFieldFamily(fieldName)).toBe(expectedFamily);
    }
  );

  it("ensures all appliance fields (including descriptions) share same family", () => {
    const applianceFields = [
      "purchase.property.included_appliances.refrigerator",
      "purchase.property.included_appliances.refrigerator_description",
      "purchase.property.included_appliances.washer",
      "purchase.property.included_appliances.washer_description",
      "purchase.property.included_appliances.dryer",
      "purchase.property.included_appliances.dryer_description",
    ];

    const families = applianceFields.map(getFieldFamily);
    const uniqueFamilies = [...new Set(families)];

    expect(uniqueFamilies).toHaveLength(1);
    expect(uniqueFamilies[0]).toBe("purchase.property.included_appliances");
  });
});

// ============================================================================
// Real Data Radio Group Selection Tests
// ============================================================================

describe("radio group selection with real data", () => {
  it("detects earnest money holder selection correctly", () => {
    const selected = realContractData["earnest_money_holder_group"];
    expect(selected).toBe("earnest_money_holder.held_by_broker_trust_account");
  });

  it("detects payment method selection correctly", () => {
    const selected =
      realContractData["purchase.property.earnest_money_payment_method_group"];
    expect(selected).toBe(
      "purchase.property.earnest_money_payment_method.wire_transfer"
    );
  });

  it("detects financing type selection correctly", () => {
    const selected = realContractData["purchase.financing.type_group"];
    expect(selected).toBe("purchase.financing.type_cash");
  });
});

// ============================================================================
// Real Data Checkbox With Description Pairing Tests
// ============================================================================

describe("checkbox description pairing with real data", () => {
  it("builds description map correctly for appliance fields", () => {
    const descMap = buildDescriptionMap(realTemplateSchemaPage3);

    expect(
      descMap.get("purchase.property.included_appliances.refrigerator")
    ).toBeDefined();
    expect(
      descMap.get("purchase.property.included_appliances.washer")
    ).toBeDefined();
    expect(
      descMap.get("purchase.property.included_appliances.dryer")
    ).toBeDefined();

    // Verify the description field is correct
    expect(
      descMap.get("purchase.property.included_appliances.refrigerator")?.name
    ).toBe("purchase.property.included_appliances.refrigerator_description");
  });

  it("correctly identifies checked appliances from contract data", () => {
    const washerChecked =
      realContractData["purchase.property.included_appliances.washer"] ===
      "true";
    const refrigeratorChecked =
      realContractData["purchase.property.included_appliances.refrigerator"] ===
        "true" ||
      realContractData["purchase.property.included_appliances.refrigerator"] ===
        true;

    expect(washerChecked).toBe(true);
    expect(refrigeratorChecked).toBe(false);
  });
});

// ============================================================================
// Real Data Other Description Field Tests
// ============================================================================

describe("other description field handling with real data", () => {
  it("identifies other_method_description as other field", () => {
    const mockGroups = {
      "purchase.property.earnest_money_payment_method_group": [
        { name: "option1" },
      ],
    };

    const result = isOtherDescriptionField(
      "purchase.property.earnest_money_payment_method.other_method_description",
      mockGroups
    );

    expect(result.isOther).toBe(true);
    expect(result.groupKey).toBe(
      "purchase.property.earnest_money_payment_method_group"
    );
  });

  it("correctly determines if other is selected", () => {
    // When wire_transfer is selected, other is NOT selected
    expect(
      isOtherSelected(
        "purchase.property.earnest_money_payment_method_group",
        realContractData
      )
    ).toBe(false);

    // With mock data where other IS selected
    const dataWithOtherSelected = {
      ...realContractData,
      "purchase.property.earnest_money_payment_method_group":
        "purchase.property.earnest_money_payment_method.other_method",
    };
    expect(
      isOtherSelected(
        "purchase.property.earnest_money_payment_method_group",
        dataWithOtherSelected
      )
    ).toBe(true);
  });
});

// ============================================================================
// Radio Group Field Detection Tests
// ============================================================================

describe("radio group field detection with real data", () => {
  it("correctly identifies radio group fields from template", () => {
    const radioFields = realTemplateSchemaPage2.filter(isRadioGroupField);

    expect(radioFields.length).toBe(5); // 2 holder + 3 payment method

    const radioFieldNames = radioFields.map((f) => f.name);
    expect(radioFieldNames).toContain(
      "earnest_money_holder.held_by_broker_trust_account"
    );
    expect(radioFieldNames).toContain(
      "purchase.property.earnest_money_payment_method.personal_check"
    );
  });

  it("does not identify non-radio fields as radio groups", () => {
    const textFields = realTemplateSchemaPage2.filter(
      (f) => f.type === "text" || f.type === "checkbox"
    );

    textFields.forEach((field) => {
      expect(isRadioGroupField(field)).toBe(false);
    });
  });
});
