"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface MockSetupProps {
  extractResponses: Record<string, unknown>[];
  onExtractResponsesChange: (responses: Record<string, unknown>[]) => void;
  contracts: Record<string, unknown>[];
  onContractsChange: (contracts: Record<string, unknown>[]) => void;
  errorConfig: Record<string, boolean>;
  onErrorConfigChange: (config: Record<string, boolean>) => void;
}

export function MockSetup({
  extractResponses,
  onExtractResponsesChange,
  contracts,
  onContractsChange,
  errorConfig,
  onErrorConfigChange,
}: MockSetupProps) {
  // --- Extract responses ---
  function addExtractResponse() {
    onExtractResponsesChange([
      ...extractResponses,
      { missingFieldsCount: 0, fieldsJson: {} },
    ]);
  }

  function updateExtractResponse(index: number, field: string, value: unknown) {
    const updated = [...extractResponses];
    updated[index] = { ...updated[index], [field]: value };
    onExtractResponsesChange(updated);
  }

  function removeExtractResponse(index: number) {
    onExtractResponsesChange(extractResponses.filter((_, i) => i !== index));
  }

  // --- Contracts ---
  function addContract() {
    onContractsChange([
      ...contracts,
      { contractId: "", address: "", buyerName: "", sellerName: "", documentType: "CONTRACT" },
    ]);
  }

  function updateContract(index: number, field: string, value: string) {
    const updated = [...contracts];
    updated[index] = { ...updated[index], [field]: value };
    onContractsChange(updated);
  }

  function removeContract(index: number) {
    onContractsChange(contracts.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      {/* Extract responses */}
      <div className="space-y-3">
        <Label className="text-[13px] font-medium text-[#111827]">
          Mock Extraction Responses
        </Label>
        <p className="text-[12px] text-[#9CA3AF]">
          Sequential responses from deliver_extraction. Each call uses the next one.
        </p>

        {extractResponses.map((resp, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-3 border border-[#E5E7EB] bg-zinc-50"
          >
            <span className="text-[11px] font-medium text-[#6B7280] shrink-0 w-6">
              #{index + 1}
            </span>
            <Input
              type="number"
              placeholder="Missing fields"
              value={(resp.missingFieldsCount as number) ?? 0}
              onChange={(e) =>
                updateExtractResponse(index, "missingFieldsCount", parseInt(e.target.value) || 0)
              }
              className="w-32 h-8 text-sm border-[#E5E7EB] rounded-none"
            />
            <span className="text-[12px] text-[#9CA3AF]">missing fields</span>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => removeExtractResponse(index)}
            >
              <X className="h-3.5 w-3.5 text-[#9CA3AF]" />
            </Button>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addExtractResponse} className="text-[13px]">
          <Plus className="h-3.5 w-3.5" />
          Add Response
        </Button>
      </div>

      {/* Contracts for edit/counter */}
      <div className="space-y-3">
        <Label className="text-[13px] font-medium text-[#111827]">
          Mock Contracts (for Edit / Counter)
        </Label>
        <p className="text-[12px] text-[#9CA3AF]">
          Contracts returned by get_all_contracts. Used for edit and counter offer flows.
        </p>

        {contracts.map((contract, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-3 border border-[#E5E7EB] bg-zinc-50"
          >
            <Input
              placeholder="Address"
              value={(contract.address as string) ?? ""}
              onChange={(e) => updateContract(index, "address", e.target.value)}
              className="flex-1 h-8 text-sm border-[#E5E7EB] rounded-none"
            />
            <Input
              placeholder="Buyer"
              value={(contract.buyerName as string) ?? ""}
              onChange={(e) => updateContract(index, "buyerName", e.target.value)}
              className="w-32 h-8 text-sm border-[#E5E7EB] rounded-none"
            />
            <Input
              placeholder="ID"
              value={(contract.contractId as string) ?? ""}
              onChange={(e) => updateContract(index, "contractId", e.target.value)}
              className="w-24 h-8 text-sm border-[#E5E7EB] rounded-none"
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => removeContract(index)}
            >
              <X className="h-3.5 w-3.5 text-[#9CA3AF]" />
            </Button>
          </div>
        ))}

        <Button variant="outline" size="sm" onClick={addContract} className="text-[13px]">
          <Plus className="h-3.5 w-3.5" />
          Add Contract
        </Button>
      </div>

      {/* Error toggles */}
      <div className="space-y-3">
        <Label className="text-[13px] font-medium text-[#111827]">
          Error Simulation
        </Label>

        <div className="flex items-center justify-between p-3 border border-[#E5E7EB] bg-zinc-50">
          <div>
            <p className="text-sm font-medium text-[#111827]">Prompt initialization fails</p>
            <p className="text-[12px] text-[#9CA3AF]">init-extraction returns 500</p>
          </div>
          <Switch
            checked={errorConfig.prompt_fails ?? false}
            onChange={(checked: boolean) =>
              onErrorConfigChange({ ...errorConfig, prompt_fails: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between p-3 border border-[#E5E7EB] bg-zinc-50">
          <div>
            <p className="text-sm font-medium text-[#111827]">Extraction fails</p>
            <p className="text-[12px] text-[#9CA3AF]">extract endpoint returns 500</p>
          </div>
          <Switch
            checked={errorConfig.extraction_fails ?? false}
            onChange={(checked: boolean) =>
              onErrorConfigChange({ ...errorConfig, extraction_fails: checked })
            }
          />
        </div>
      </div>
    </div>
  );
}
