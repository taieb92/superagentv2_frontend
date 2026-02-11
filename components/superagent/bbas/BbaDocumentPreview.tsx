"use client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
interface BbaDocumentPreviewProps {
  data: any; // Using any for flexibility with backend response
}
export function BbaDocumentPreview({ data }: BbaDocumentPreviewProps) {
  const [formData, setFormData] = useState({
    buyerName: data?.buyerName || "",
    brokerageName: data?.brokerageName || "",
    startDate: data?.startDate || "",
    endDate: data?.endDate || "",
    commission: data?.commission || "",
    retainerFee: data?.retainerFee || "",
  });
  const handleBlur = (field: string) => {
    toast.success("Field saved", {
      description: `${field}
 updated successfully`,
      duration: 1500,
      className: "bg-white border-zinc-200 text-zinc-900",
    });
  };
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  return (
    <div className="bg-white border border-zinc-200 shadow-sm min-h-[800px] p-8 md:p-12 relative print:shadow-none print:border-none">
      {/* Page Number */}
      <div className="absolute top-8 right-8 text-xs font-mono text-zinc-300">
        Page 1 of 4
      </div>
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-2 border-b-2 border-zinc-900 pb-6">
          <h2 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">
            BUYER BROKER EXCLUSIVE EMPLOYMENT AGREEMENT
          </h2>
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            CONFIDENTIAL • EXCLUSIVE REPRESENTATION
          </p>
        </div>
        {/* Section 1: Parties */}
        <div className="space-y-6">
          <SectionTitle number="1" title="Parties" />
          <p className="text-sm text-zinc-600 leading-relaxed">
            This Agreement is entered into by and between
            <InlineField
              value={formData.buyerName}
              placeholder="Buyer Name"
              onChange={(v: string) => handleChange("buyerName", v)}
              onBlur={() => handleBlur("Buyer Name")}
              width="w-48"
            />
            ("Buyer") and
            <InlineField
              value={formData.brokerageName}
              placeholder="Brokerage Firm"
              onChange={(v: string) => handleChange("brokerageName", v)}
              onBlur={() => handleBlur("Brokerage Name")}
              width="w-64"
            />
            ("Broker").
          </p>
        </div>
        {/* Section 2: Term */}
        <div className="space-y-6">
          <SectionTitle number="2" title="Term" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4">
            <LabeledInput
              label="StartDate"
              value={formData.startDate}
              placeholder="Select Date"
              type="date"
              onChange={(v: string) => handleChange("startDate", v)}
              onBlur={() => handleBlur("Start Date")}
            />
            <LabeledInput
              label="End Date"
              value={formData.endDate}
              placeholder="Select Date"
              type="date"
              onChange={(v: string) => handleChange("endDate", v)}
              onBlur={() => handleBlur("End Date")}
              required
            />
          </div>
        </div>
        {/* Section 3: Compensation */}
        <div className="space-y-6">
          <SectionTitle number="3" title="Compensation" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4">
            <LabeledInput
              label="Retainer Fee"
              value={formData.retainerFee}
              placeholder="$0.00"
              onChange={(v: string) => handleChange("retainerFee", v)}
              onBlur={() => handleBlur("Retainer Fee")}
            />
            <LabeledInput
              label="Commission %"
              value={formData.commission}
              placeholder="e.g. 2.5%"
              onChange={(v: string) => handleChange("commission", v)}
              onBlur={() => handleBlur("Commission")}
              required
            />
          </div>
          <p className="text-xs text-zinc-500 italic pl-4">
            * Broker compensation shall be payable upon successful closing of a
            property purchase.
          </p>
        </div>
      </div>
    </div>
  );
}
//  Sub-components for internal use;
function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-2 border-b border-zinc-100 pb-2">
      <span className="text-sm font-bold text-zinc-900">{number}.</span>
      <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
        {title}
      </span>
    </div>
  );
}
function InlineField({
  value,
  onChange,
  onBlur,
  placeholder,
  width = "w-32",
}: any) {
  return (
    <span className="inline-block mx-1 relative group">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(
          "border-b border-zinc-300 text-zinc-900 font-medium px-1 py-0.5 focus:outline-none focus:border-[#0F766E] focus:bg-emerald-50/30 transition-all text-center",
          width,
          !value && "bg-red-50 border-red-300 placeholder:text-red-300"
        )}
      />
      {!value && (
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 bg-red-500"></span>
        </span>
      )}
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
  required,
}: any) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          {label}
        </label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="w-3 h-3 text-zinc-300" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Extracted from Voice Session</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(
          "w-full h-10 px-3 border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20",
          !value && required
            ? "border-red-200 bg-red-50/50"
            : "border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white"
        )}
      />
      {!value && required && (
        <p className="text-[10px] text-red-500 font-medium">Required</p>
      )}
    </div>
  );
}
