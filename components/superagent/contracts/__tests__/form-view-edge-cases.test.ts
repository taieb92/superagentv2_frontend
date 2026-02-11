/**
 * Edge case tests for the weird/complex field conventions.
 *
 * Focuses on:
 * - Radio group `_group` convention and selection logic
 * - "Other" field conditional visibility
 * - Checkbox + description pairing edge cases
 */

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFormFields } from "../useFormFields";
import {
  isRadioGroupField,
  isOtherDescriptionField,
  isOtherSelected,
  buildDescriptionMap,
  getFieldFamily,
} from "../form-view-utils";
import {
  isGroupedRadioItem,
  isCheckboxWithDescriptionItem,
} from "../form-view-types";

// ============================================================================
// RADIO GROUP EDGE CASES
// ============================================================================

describe("radio group _group convention edge cases", () => {
  describe("isRadioGroupField detection", () => {
    it("requires BOTH type=radioGroup AND group property", () => {
      // Has type but no group
      expect(isRadioGroupField({ type: "radioGroup" })).toBe(false);
      expect(isRadioGroupField({ type: "radioGroup", group: null })).toBe(
        false
      );
      expect(isRadioGroupField({ type: "radioGroup", group: "" })).toBe(false);

      // Has group but wrong type
      expect(isRadioGroupField({ type: "text", group: "some_group" })).toBe(
        false
      );
      expect(isRadioGroupField({ type: "checkbox", group: "some_group" })).toBe(
        false
      );

      // Has both - valid
      expect(
        isRadioGroupField({ type: "radioGroup", group: "some_group" })
      ).toBe(true);
    });

    it("handles case-insensitive type matching", () => {
      expect(isRadioGroupField({ type: "RADIOGROUP", group: "g" })).toBe(true);
      expect(isRadioGroupField({ type: "RadioGroup", group: "g" })).toBe(true);
      expect(isRadioGroupField({ type: "radiogroup", group: "g" })).toBe(true);
      expect(isRadioGroupField({ type: "RADIOGROUP", group: "g" })).toBe(true);
    });

    it("handles malformed field objects", () => {
      expect(isRadioGroupField(null)).toBe(false);
      expect(isRadioGroupField(undefined)).toBe(false);
      expect(isRadioGroupField({})).toBe(false);
      expect(isRadioGroupField({ type: null, group: "g" })).toBe(false);
      expect(isRadioGroupField("not an object")).toBe(false);
      expect(isRadioGroupField(123)).toBe(false);
    });
  });

  describe("radio group selection from contractData", () => {
    const template = {
      basePdf: "",
      schemas: [
        [
          { name: "opt1", type: "radioGroup", group: "my_group" },
          { name: "opt2", type: "radioGroup", group: "my_group" },
          { name: "opt3", type: "radioGroup", group: "my_group" },
        ],
      ],
    };

    it("uses contractData[groupName] as primary selection source", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: template as any,
          contractData: { my_group: "opt2" },
          currentPage: 1,
        })
      );

      const radioItem = result.current.familyRenderData
        .flatMap((f) => f.items)
        .find(isGroupedRadioItem);

      expect(radioItem).toBeDefined();
      expect(radioItem!.groupName).toBe("my_group");
      expect(radioItem!.fields.length).toBe(3);
    });

    it("handles when contractData[groupName] does not match any option", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: template as any,
          contractData: { my_group: "nonexistent_option" },
          currentPage: 1,
        })
      );

      // Should still render the group, just with no selection
      const radioItem = result.current.familyRenderData
        .flatMap((f) => f.items)
        .find(isGroupedRadioItem);

      expect(radioItem).toBeDefined();
    });

    it("handles empty/null contractData", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: template as any,
          contractData: {},
          currentPage: 1,
        })
      );

      expect(result.current.familyRenderData.length).toBeGreaterThan(0);
    });
  });

  describe("radio group deduplication across families", () => {
    it("renders radio group only once even if options span multiple families", () => {
      // Weird case: radio options with different prefixes but same group
      const template = {
        basePdf: "",
        schemas: [
          [
            {
              name: "purchase.payment.cash",
              type: "radioGroup",
              group: "payment_group",
            },
            {
              name: "other.payment.check",
              type: "radioGroup",
              group: "payment_group",
            },
          ],
        ],
      };

      const { result } = renderHook(() =>
        useFormFields({
          template: template as any,
          contractData: {},
          currentPage: 1,
        })
      );

      const allRadioItems = result.current.familyRenderData
        .flatMap((f) => f.items)
        .filter(isGroupedRadioItem);

      // Should only have ONE radio group item, not two
      expect(allRadioItems.length).toBe(1);
      expect(allRadioItems[0].fields.length).toBe(2); // Both options included
    });
  });

  describe("group naming conventions", () => {
    it("handles _group suffix convention", () => {
      const field = {
        name: "option1",
        type: "radioGroup",
        group: "payment_method_group",
      };
      expect(isRadioGroupField(field)).toBe(true);
    });

    it("handles .group suffix convention", () => {
      const field = {
        name: "option1",
        type: "radioGroup",
        group: "payment.method.group",
      };
      expect(isRadioGroupField(field)).toBe(true);
    });

    it("handles group names without _group suffix", () => {
      // Some might just use a plain name
      const field = {
        name: "option1",
        type: "radioGroup",
        group: "financing_type",
      };
      expect(isRadioGroupField(field)).toBe(true);
    });
  });
});

// ============================================================================
// "OTHER" FIELD VISIBILITY EDGE CASES
// ============================================================================

describe("other field visibility edge cases", () => {
  describe("isOtherDescriptionField detection patterns", () => {
    const groups = {
      payment_method_group: [{ name: "opt1" }],
      something_group: [{ name: "opt2" }],
      "purchase.property.earnest_money_payment_method_group": [
        { name: "opt3" },
      ],
    };

    it("detects other_description pattern", () => {
      const result = isOtherDescriptionField(
        "something_other_description",
        groups
      );
      expect(result.isOther).toBe(true);
      expect(result.groupKey).toBe("something_group");
    });

    it("detects .other_description pattern", () => {
      const result = isOtherDescriptionField(
        "purchase.property.earnest_money_payment_method.other_method_description",
        groups
      );
      expect(result.isOther).toBe(true);
      expect(result.groupKey).toBe(
        "purchase.property.earnest_money_payment_method_group"
      );
    });

    it("returns isOther=true but groupKey=null when group not found", () => {
      const result = isOtherDescriptionField(
        "unknown_other_description",
        groups
      );
      expect(result.isOther).toBe(true);
      expect(result.groupKey).toBe(null);
    });

    it("returns isOther=false for non-other description fields", () => {
      expect(
        isOtherDescriptionField("refrigerator_description", groups).isOther
      ).toBe(false);
      expect(
        isOtherDescriptionField("washer_description", groups).isOther
      ).toBe(false);
      expect(
        isOtherDescriptionField("some.field.description", groups).isOther
      ).toBe(false);
    });

    it("returns isOther=false when no description suffix", () => {
      expect(isOtherDescriptionField("other_method", groups).isOther).toBe(
        false
      );
      expect(isOtherDescriptionField("something_other", groups).isOther).toBe(
        false
      );
    });

    it("handles case variations in 'other'", () => {
      // The function uses toLowerCase, so these should work
      expect(
        isOtherDescriptionField("something_OTHER_description", groups).isOther
      ).toBe(true);
      expect(
        isOtherDescriptionField("something_Other_description", groups).isOther
      ).toBe(true);
    });
  });

  describe("isOtherSelected detection", () => {
    it("detects 'other' anywhere in the selected value", () => {
      expect(isOtherSelected("group", { group: "other_method" })).toBe(true);
      expect(isOtherSelected("group", { group: "payment.other.option" })).toBe(
        true
      );
      expect(isOtherSelected("group", { group: "something_other_value" })).toBe(
        true
      );
    });

    it("is case-insensitive", () => {
      expect(isOtherSelected("group", { group: "OTHER_METHOD" })).toBe(true);
      expect(isOtherSelected("group", { group: "Other_Method" })).toBe(true);
    });

    it("returns false when other is not in value", () => {
      expect(isOtherSelected("group", { group: "cash" })).toBe(false);
      expect(isOtherSelected("group", { group: "wire_transfer" })).toBe(false);
    });

    it("handles missing/empty values", () => {
      expect(isOtherSelected("group", {})).toBe(false);
      expect(isOtherSelected("group", { group: "" })).toBe(false);
      expect(isOtherSelected("group", { group: null })).toBe(false);
      expect(isOtherSelected("group", null)).toBe(false);
      expect(isOtherSelected("group", undefined)).toBe(false);
    });
  });

  describe("other_description visibility in render data", () => {
    const template = {
      basePdf: "",
      schemas: [
        [
          { name: "payment.cash", type: "radioGroup", group: "payment_group" },
          { name: "payment.other", type: "radioGroup", group: "payment_group" },
          { name: "payment.other_description", type: "text" },
          { name: "unrelated_field", type: "text" },
        ],
      ],
    };

    it("HIDES other_description when other option is NOT selected", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: template as any,
          contractData: { payment_group: "payment.cash" },
          currentPage: 1,
        })
      );

      const allFieldNames = result.current.familyRenderData
        .flatMap((f) => f.items)
        .filter(
          (item) =>
            !isGroupedRadioItem(item) && !isCheckboxWithDescriptionItem(item)
        )
        .map((item: any) => item.name);

      expect(allFieldNames).not.toContain("payment.other_description");
      expect(allFieldNames).toContain("unrelated_field");
    });

    it("SHOWS other_description when other option IS selected", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: template as any,
          contractData: { payment_group: "payment.other" },
          currentPage: 1,
        })
      );

      const allFieldNames = result.current.familyRenderData
        .flatMap((f) => f.items)
        .filter(
          (item) =>
            !isGroupedRadioItem(item) && !isCheckboxWithDescriptionItem(item)
        )
        .map((item: any) => item.name);

      expect(allFieldNames).toContain("payment.other_description");
    });
  });
});

// ============================================================================
// CHECKBOX + DESCRIPTION PAIRING EDGE CASES
// ============================================================================

describe("checkbox + description pairing edge cases", () => {
  describe("buildDescriptionMap", () => {
    it("maps _description suffix to parent field name", () => {
      const fields = [
        { name: "refrigerator", type: "checkbox" },
        { name: "refrigerator_description", type: "text" },
      ];

      const map = buildDescriptionMap(fields);
      expect(map.get("refrigerator")).toBeDefined();
      expect(map.get("refrigerator")?.name).toBe("refrigerator_description");
    });

    it("handles nested field names", () => {
      const fields = [
        { name: "purchase.appliances.fridge_description", type: "text" },
      ];

      const map = buildDescriptionMap(fields);
      expect(map.get("purchase.appliances.fridge")).toBeDefined();
    });

    it("does not include non-description fields", () => {
      const fields = [
        { name: "refrigerator", type: "checkbox" },
        { name: "washer", type: "checkbox" },
      ];

      const map = buildDescriptionMap(fields);
      expect(map.size).toBe(0);
    });

    it("handles multiple description fields", () => {
      const fields = [
        { name: "a_description", type: "text" },
        { name: "b_description", type: "text" },
        { name: "c_description", type: "text" },
      ];

      const map = buildDescriptionMap(fields);
      expect(map.size).toBe(3);
      expect(map.get("a")).toBeDefined();
      expect(map.get("b")).toBeDefined();
      expect(map.get("c")).toBeDefined();
    });
  });

  describe("pairing in render data", () => {
    const template = {
      basePdf: "",
      schemas: [
        [
          { name: "appliances.fridge", type: "checkbox" },
          { name: "appliances.fridge_description", type: "text" },
          { name: "appliances.washer", type: "checkbox" },
          { name: "appliances.washer_description", type: "text" },
          { name: "standalone_checkbox", type: "checkbox" },
          { name: "standalone_text", type: "text" },
        ],
      ],
    };

    it("creates CheckboxWithDescription items for paired fields", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: template as any,
          contractData: {},
          currentPage: 1,
        })
      );

      const pairedItems = result.current.familyRenderData
        .flatMap((f) => f.items)
        .filter(isCheckboxWithDescriptionItem);

      expect(pairedItems.length).toBe(2); // fridge + washer

      const fridgePair = pairedItems.find(
        (p) => p.checkboxField.name === "appliances.fridge"
      );
      expect(fridgePair).toBeDefined();
      expect(fridgePair!.descriptionField.name).toBe(
        "appliances.fridge_description"
      );
    });

    it("does NOT render description fields separately when paired", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: template as any,
          contractData: {},
          currentPage: 1,
        })
      );

      const regularFields = result.current.familyRenderData
        .flatMap((f) => f.items)
        .filter(
          (item) =>
            !isGroupedRadioItem(item) && !isCheckboxWithDescriptionItem(item)
        )
        .map((item: any) => item.name);

      // Description fields should NOT appear as separate items
      expect(regularFields).not.toContain("appliances.fridge_description");
      expect(regularFields).not.toContain("appliances.washer_description");

      // Standalone fields should appear
      expect(regularFields).toContain("standalone_checkbox");
      expect(regularFields).toContain("standalone_text");
    });

    it("renders checkbox without description as regular FormField", () => {
      const { result } = renderHook(() =>
        useFormFields({
          template: template as any,
          contractData: {},
          currentPage: 1,
        })
      );

      const regularFields = result.current.familyRenderData
        .flatMap((f) => f.items)
        .filter(
          (item) =>
            !isGroupedRadioItem(item) && !isCheckboxWithDescriptionItem(item)
        );

      const standaloneCheckbox = regularFields.find(
        (f: any) => f.name === "standalone_checkbox"
      );
      expect(standaloneCheckbox).toBeDefined();
    });
  });

  describe("pairing only applies to checkbox type", () => {
    it("does NOT pair text field with its description", () => {
      const template = {
        basePdf: "",
        schemas: [
          [
            { name: "notes", type: "text" },
            { name: "notes_description", type: "text" },
          ],
        ],
      };

      const { result } = renderHook(() =>
        useFormFields({
          template: template as any,
          contractData: {},
          currentPage: 1,
        })
      );

      const pairedItems = result.current.familyRenderData
        .flatMap((f) => f.items)
        .filter(isCheckboxWithDescriptionItem);

      // Should NOT create a pair for text fields
      expect(pairedItems.length).toBe(0);
    });
  });
});

// ============================================================================
// FAMILY GROUPING WITH DESCRIPTIONS
// ============================================================================

describe("family grouping keeps descriptions with parents", () => {
  it("groups field and its _description in same family", () => {
    expect(getFieldFamily("appliances.fridge")).toBe("appliances");
    expect(getFieldFamily("appliances.fridge_description")).toBe("appliances");
  });

  it("strips _description before computing family", () => {
    // Without stripping: "appliances.fridge_description" would have family "appliances"
    // But "appliances.fridge" would also have family "appliances"
    // The key is they match
    const parentFamily = getFieldFamily(
      "purchase.property.included_appliances.refrigerator"
    );
    const descFamily = getFieldFamily(
      "purchase.property.included_appliances.refrigerator_description"
    );

    expect(parentFamily).toBe(descFamily);
    expect(parentFamily).toBe("purchase.property.included_appliances");
  });

  it("handles deeply nested description fields", () => {
    const fieldFamily = getFieldFamily("a.b.c.d.field");
    const descFamily = getFieldFamily("a.b.c.d.field_description");

    expect(fieldFamily).toBe(descFamily);
    expect(fieldFamily).toBe("a.b.c.d");
  });
});

// ============================================================================
// COMBINED EDGE CASES
// ============================================================================

describe("combined edge cases", () => {
  it("handles template with no radio groups", () => {
    const template = {
      basePdf: "",
      schemas: [
        [
          { name: "field1", type: "text" },
          { name: "field2", type: "checkbox" },
        ],
      ],
    };

    const { result } = renderHook(() =>
      useFormFields({
        template: template as any,
        contractData: {},
        currentPage: 1,
      })
    );

    expect(result.current.globalRadioGroups).toEqual({});
    expect(result.current.familyRenderData.length).toBeGreaterThan(0);
  });

  it("handles template with only radio groups", () => {
    const template = {
      basePdf: "",
      schemas: [
        [
          { name: "opt1", type: "radioGroup", group: "group1" },
          { name: "opt2", type: "radioGroup", group: "group1" },
        ],
      ],
    };

    const { result } = renderHook(() =>
      useFormFields({
        template: template as any,
        contractData: {},
        currentPage: 1,
      })
    );

    expect(Object.keys(result.current.globalRadioGroups)).toContain("group1");
  });

  it("handles empty template schemas", () => {
    const template = {
      basePdf: "",
      schemas: [[]],
    };

    const { result } = renderHook(() =>
      useFormFields({
        template: template as any,
        contractData: {},
        currentPage: 1,
      })
    );

    expect(result.current.allFields).toEqual([]);
    expect(result.current.familyRenderData).toEqual([]);
  });

  it("handles page out of range gracefully", () => {
    const template = {
      basePdf: "",
      schemas: [[{ name: "field1", type: "text" }]],
    };

    const { result } = renderHook(() =>
      useFormFields({
        template: template as any,
        contractData: {},
        currentPage: 999, // Way out of range
      })
    );

    // Should return empty for non-existent page
    expect(result.current.currentPageFields).toEqual([]);
  });
});
