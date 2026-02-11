"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { FieldPopover } from "../voice/FieldPopover";

export function DocumentPreviewEditable() {
  const [formData, setFormData] = useState({
    buyerName: "",
    sellerName: "",
    address: "",
    price: "",
    closingDate: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleBlur = (field: string) => {
    setIsSaving(true);
    // Simulate auto-save
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Changes saved", {
        description: `${field} updated.`,
        duration: 1500,
        className: "bg-white border-[#E5E7EB] text-[#111827]",
      });
    }, 800);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bg-white border border-[#E5E7EB] shadow-sm min-h-[900px]  relative overflow-hidden flex flex-col">
      {/* Document Watermark / Header Space */}
      <div className="h-2 bg-[#111827]" />

      <div className="p-12 md:p-16 space-y-16 max-w-4xl mx-auto w-full">
        {/* Page Header */}
        <div className="flex justify-between items-start border-b-2 border-[#111827] pb-8">
          <div className="space-y-1">
            <h2 className="text-[28px] font-bold text-[#111827] font-serif italic tracking-tight leading-none">
              Residential Purchase Agreement
            </h2>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#6B7280] font-semibold">
              California Association of Realtors Standard
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-[11px] font-bold text-[#111827] uppercase tracking-widest">
              Page 1 of 6
            </p>
            <div className="flex items-center gap-2 justify-end">
              {isSaving && (
                <span className="text-[10px] text-[#0F766E] font-medium animate-pulse">
                  Autosaving...
                </span>
              )}
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>

        {/* Section 1: Offer */}
        <div className="space-y-8">
          <SectionTitle number="1" title="Offer & Parties" />

          <div className="text-[15px] text-[#374151] leading-[2.4] tracking-wide">
            This is an offer from
            <InlineField
              label="Buyer Name"
              value={formData.buyerName}
              placeholder="Full Legal Name"
              onChange={(v: string) => handleChange("buyerName", v)}
              onBlur={() => handleBlur("Buyer Name")}
              width="w-64"
              source="VOICE"
              confidence={0.98}
            />
            ("Buyer") to purchase the real property situated at
            <InlineField
              label="Property Address"
              value={formData.address}
              placeholder="Complete Address"
              onChange={(v: string) => handleChange("address", v)}
              onBlur={() => handleBlur("Address")}
              width="w-full max-w-lg"
              source="MLS"
              confidence={0.99}
            />
            legal description attached hereto as Exhibit A ("Property").
          </div>
        </div>

        {/* Section 2: Terms */}
        <div className="space-y-8">
          <SectionTitle number="2" title="Finance Terms" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <LabeledInput
              label="A. Purchase Price"
              value={formData.price}
              placeholder="Amount in USD"
              onChange={(v: string) => handleChange("price", v)}
              onBlur={() => handleBlur("Purchase Price")}
              source="VOICE"
              confidence={0.85}
              prefix="$"
            />
            <LabeledInput
              label="B. Closing Date"
              value={formData.closingDate}
              placeholder="MM/DD/YYYY"
              type="date"
              onChange={(v: string) => handleChange("closingDate", v)}
              onBlur={() => handleBlur("Closing Date")}
              source="VOICE"
              confidence={0.72}
            />
          </div>
        </div>

        {/* Section 3: Agency */}
        <div className="space-y-8">
          <SectionTitle number="3" title="Agency Disclosure" />
          <p className="text-[14px] text-[#6B7280] italic leading-relaxed">
            The following agency relationship(s) are hereby confirmed for this
            transaction. Confirmation of Agency Relationship is attached to the
            Purchase Agreement.
          </p>
        </div>
      </div>

      {/* Footer / Status */}
      <div className="mt-auto border-t border-[#F3F4F6] bg-[#F9FAFB] px-12 py-6 flex items-center justify-between">
        <div className="text-[11px] text-[#9CA3AF] font-medium uppercase tracking-[0.1em]">
          SuperAgent Document ID: RPA-{Math.floor(Math.random() * 10000)}
        </div>
        <div className="flex items-center gap-4">
          <button className="text-[12px] font-semibold text-[#6B7280] hover:text-[#111827] transition-colors">
            Previous Page
          </button>
          <span className="text-[12px] font-bold text-[#111827]">1 / 6</span>
          <button className="text-[12px] font-semibold text-[#0F766E] hover:text-[#115E59] transition-colors">
            Next Page
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#F3F4F6] pb-3">
      <span className="text-[13px] font-semibold text-[#111827] w-6 h-6 rounded-none bg-[#F3F4F6] flex items-center justify-center -ml-1">
        {number}
      </span>
      <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#111827]">
        {title}
      </span>
    </div>
  );
}

function InlineField({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  width,
  source,
  confidence,
}: any) {
  return (
    <span className="inline-block px-1 align-baseline">
      <FieldPopover
        label={label}
        value={value}
        source={source}
        confidence={confidence}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          className={cn(
            "border-b border-[#D1D5DB] text-[#111827] font-semibold px-2 py-0.5 focus:outline-none focus:border-[#0F766E] focus:bg-[#ECFDF5]/30 transition-all text-center placeholder:text-[#D1D5DB] placeholder:font-normal",
            width
          )}
        />
      </FieldPopover>
    </span>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  type = "text",
  source,
  confidence,
  prefix,
}: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#6B7280]">
          {label}
        </label>
        <span className="text-[9px] font-semibold text-[#0F766E] bg-[#ECFDF5] px-1.5 py-0.5 rounded-none border border-[#0F766E]/20">
          {source}
        </span>
      </div>
      <div className="relative group">
        <FieldPopover
          label={label}
          value={value}
          source={source}
          confidence={confidence}
        >
          <div className="relative">
            {prefix && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[14px]">
                {prefix}
              </span>
            )}
            <input
              type={type}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              placeholder={placeholder}
              className={cn(
                "w-full h-11 border border-[#E5E7EB] rounded-none text-[14px] font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[#0F766E]/10 focus:border-[#0F766E]",
                prefix ? "pl-7" : "px-3",
                !value ? "bg-[#F9FAFB] italic" : "bg-white"
              )}
            />
          </div>
        </FieldPopover>
      </div>
    </div>
  );
}
