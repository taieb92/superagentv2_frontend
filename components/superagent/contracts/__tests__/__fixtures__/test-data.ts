/**
 * Test fixtures based on real contract data.
 * Source: Arizona Purchase Contract template
 */

// ============================================================================
// Real Contract Data (fields_json)
// ============================================================================

export const realContractData: Record<string, any> = {
  _fieldsOrder: [
    "purchase.property.premises_address",
    "purchase.parties.buyer_names",
    "purchase.parties.seller_name",
    "purchase.property.city",
    "purchase.property.assessors_parcel_number",
    "purchase.property.county",
    "property.zip_code",
    "purchase.property.full_purchase_price",
    "purchase.property.earnest_money",
    "purchase.property.earnest_money_payment_method_group",
    "earnest_money_holder_group",
    "purchase.closing_and_possession.closing_date",
    "purchase.financing.type_group",
    "purchase.property.hoa",
    "purchase.additional_terms.custom_terms",
    "purchase.property.included_appliances.refrigerator",
    "purchase.property.included_appliances.washer",
    "purchase.property.included_appliances.dryer",
  ],
  // Text fields
  "property.zip_code": "86032-7511",
  "purchase.firm_email": "buyer@gmail.com",
  "purchase.property.city": "Onyx",
  "purchase.property.county": "Maricopa",
  "purchase.seller_firm_email": "sellersmail@gmail.com",
  "purchase.parties.buyer_names": "Michael Maroneyyyy",
  "purchase.parties.seller_name": "Denton Reedaaa",
  "purchase.property.earnest_money": "€250,000",
  "purchase.property.premises_address": "437 E Bloomfield Road",
  "purchase.title_escrow.company_name": "Jason Pivet",
  "purchase.property.full_purchase_price": "€500,000",
  "purchase.title_escrow.company_address": "14500 N Northsight Blvd, Ste 101",
  "purchase.additional_terms.custom_terms":
    "Refrigerator, washer, dryer included",
  "purchase.property.assessors_parcel_number": "168-28-016",
  "purchase.title_escrow.company_address_zip": "85260",
  "purchase.title_escrow.company_address_city": "Scottsdale",
  "purchase.title_escrow.company_address_state": "AZ",
  "purchase.closing_and_possession.closing_date": "2026/02/15",

  // Checkbox fields
  "purchase.property.hoa": true,
  "purchase.property.seller_financing": "true",
  "purchase.property.seller_compensation": "",
  "purchase.property.included_appliances.dryer": "",
  "purchase.property.included_appliances.washer": "true",
  "purchase.property.included_appliances.refrigerator": "",

  // Radio group selections
  earnest_money_holder_group:
    "earnest_money_holder.held_by_broker_trust_account",
  "purchase.financing.type_group": "purchase.financing.type_cash",
  "purchase.property.seller_group": "purchase.property.seller_financing",
  "purchase.property.included.appliances_group":
    "purchase.property.included_appliances.washer",
  "purchase.property.earnest_money_payment_method_group":
    "purchase.property.earnest_money_payment_method.wire_transfer",

  // Radio option individual values
  "purchase.property.earnest_money_payment_method.other_method": "",
  "purchase.property.earnest_money_payment_method.wire_transfer": "false",
  "purchase.property.earnest_money_payment_method.personal_check": "",

  // Description fields
  "purchase.property.included_appliances.other_personal_property1_description":
    "cwcwxcxwc",
  "purchase.property.included_appliances.other_personal_property2_description":
    "cvcxvxvx",
};

// ============================================================================
// Real Template Schema (page 2 fields)
// ============================================================================

export const realTemplateSchemaPage2 = [
  // Radio group options - earnest money holder
  {
    name: "earnest_money_holder.held_by_broker_trust_account",
    type: "radioGroup",
    group: "earnest_money_holder_group",
    description:
      "Set true if earnest money is deposited into a broker trust account.",
  },
  {
    name: "earnest_money_holder_held.by_title_or_escrow",
    type: "radioGroup",
    group: "earnest_money_holder_group",
    description:
      "Set true if earnest money is deposited with a title company or escrow company.",
  },

  // Text fields
  { name: "property.zip_code", type: "text" },
  { name: "purchase.parties.buyer_names", type: "text" },
  { name: "purchase.parties.seller_name", type: "text" },
  { name: "purchase.property.assessors_parcel_number", type: "text" },
  { name: "purchase.property.city", type: "text" },
  { name: "purchase.property.county", type: "text" },
  { name: "purchase.property.earnest_money", type: "text" },
  { name: "purchase.property.full_purchase_price", type: "text" },
  { name: "purchase.property.legal_description", type: "text" },
  { name: "purchase.property.premises_address", type: "text" },
  { name: "purchase.property.other_addenda_description", type: "text" },
  {
    name: "purchase.closing_and_possession.possession_date_if_not_at_closing",
    type: "text",
  },

  // Date field
  { name: "purchase.closing_and_possession.closing_date", type: "date" },

  // Checkbox fields
  {
    name: "purchase.buyer_sale_contingency_addendum_included",
    type: "checkbox",
  },
  {
    name: "purchase.closing_and_possession.possession_date_if_not_at_closing_check",
    type: "checkbox",
  },
  { name: "purchase.domestic_well_addendum_included", type: "checkbox" },
  { name: "purchase.included_addenda_flags", type: "checkbox" },
  { name: "purchase.property.hoa", type: "checkbox" },
  { name: "purchase.property.lead_based_paint_disclosure", type: "checkbox" },
  { name: "purchase.property.loan_assumption", type: "checkbox" },
  {
    name: "purchase.property.on_site_wastewater_treatment_facility",
    type: "checkbox",
  },
  { name: "purchase.property.other_addenda", type: "checkbox" },
  { name: "purchase.property.seller_compensation", type: "checkbox" },
  { name: "purchase.property.seller_financing", type: "checkbox" },
  { name: "purchase.property.short_sale", type: "checkbox" },
  { name: "purchase.property.solar_addendum", type: "checkbox" },

  // Radio group options - earnest money payment method
  {
    name: "purchase.property.earnest_money_payment_method.personal_check",
    type: "radioGroup",
    group: "purchase.property.earnest_money_payment_method_group",
    description: "Payment by personal check.",
  },
  {
    name: "purchase.property.earnest_money_payment_method.wire_transfer",
    type: "radioGroup",
    group: "purchase.property.earnest_money_payment_method_group",
    description: "Payment by wire transfer.",
  },
  {
    name: "purchase.property.earnest_money_payment_method.other_method",
    type: "radioGroup",
    group: "purchase.property.earnest_money_payment_method_group",
    description: "Other payment method.",
  },
  {
    name: "purchase.property.earnest_money_payment_method.other_method_description",
    type: "text",
    description: "Description of other payment method.",
  },
];

// ============================================================================
// Real Template Schema (page 3 fields - appliances)
// ============================================================================

export const realTemplateSchemaPage3 = [
  // Appliance checkboxes with descriptions
  {
    name: "purchase.property.included_appliances.refrigerator",
    type: "checkbox",
  },
  {
    name: "purchase.property.included_appliances.refrigerator_description",
    type: "text",
  },
  { name: "purchase.property.included_appliances.washer", type: "checkbox" },
  {
    name: "purchase.property.included_appliances.washer_description",
    type: "text",
  },
  { name: "purchase.property.included_appliances.dryer", type: "checkbox" },
  {
    name: "purchase.property.included_appliances.dryer_description",
    type: "text",
  },
  {
    name: "purchase.property.included_appliances.above_ground_spa_hot_tub",
    type: "checkbox",
  },
  {
    name: "purchase.property.included_appliances.above_ground_spa_hot_tub_description",
    type: "text",
  },
  {
    name: "purchase.property.included_appliances.other_personal_property1",
    type: "checkbox",
  },
  {
    name: "purchase.property.included_appliances.other_personal_property1_description",
    type: "text",
  },
  {
    name: "purchase.property.included_appliances.other_personal_property2",
    type: "checkbox",
  },
  {
    name: "purchase.property.included_appliances.other_personal_property2_description",
    type: "text",
  },
];

// ============================================================================
// Combined Template (mimics PDFMe Template structure)
// Note: Cast as any since test schemas don't need full position/width/height props
// ============================================================================

export const realTemplate = {
  basePdf: "mock-base-pdf",
  schemas: [
    [], // Page 1 - empty for test
    realTemplateSchemaPage2, // Page 2
    realTemplateSchemaPage3, // Page 3
  ],
} as any;

// ============================================================================
// Expected Results
// ============================================================================

export const expectedFamilies = {
  page2: [
    "earnest_money_holder",
    "property",
    "purchase",
    "purchase.closing_and_possession",
    "purchase.parties",
    "purchase.property",
    "purchase.property.earnest_money_payment_method",
  ],
  page3: ["purchase.property.included_appliances"],
};

export const expectedRadioGroups = {
  earnest_money_holder_group: [
    "earnest_money_holder.held_by_broker_trust_account",
    "earnest_money_holder_held.by_title_or_escrow",
  ],
  "purchase.property.earnest_money_payment_method_group": [
    "purchase.property.earnest_money_payment_method.personal_check",
    "purchase.property.earnest_money_payment_method.wire_transfer",
    "purchase.property.earnest_money_payment_method.other_method",
  ],
};
