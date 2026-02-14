"use client";

import { useEffect, useState } from "react";
import { Plus, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TurnEditor } from "@/components/superagent/qa/TurnEditor";
import { MockSetup } from "@/components/superagent/qa/MockSetup";
import { PrefilledFieldsEditor } from "@/components/superagent/qa/PrefilledFieldsEditor";
import {
  listPrompts,
  getPromptContent,
  getPromptFields,
  generateScenario,
} from "@/lib/api/qa-runner";
import type { ScenarioCreateRequest, TurnSpec } from "@/lib/api/qa-runner";

const CATEGORIES = [
  "flow",
  "edit",
  "fields",
  "errors",
  "end_call",
];

interface ScenarioBuilderProps {
  initial?: ScenarioCreateRequest;
  onSave: (data: ScenarioCreateRequest) => void;
  isSaving: boolean;
}

export function ScenarioBuilder({
  initial,
  onSave,
  isSaving,
}: ScenarioBuilderProps) {
  // Form state
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [tags, setTags] = useState(initial?.tags?.join(", ") ?? "");
  const [category, setCategory] = useState(initial?.category ?? "flow");
  const [contractType, setContractType] = useState(initial?.contract_type ?? "purchase");
  const [mode, setMode] = useState(initial?.mode ?? "New");
  const [mockPromptFile, setMockPromptFile] = useState(initial?.mock_prompt_file ?? "");
  const [prefilledFields, setPrefilledFields] = useState<Record<string, string>>(
    initial?.prefilled_fields ?? {}
  );
  const [extractResponses, setExtractResponses] = useState<Record<string, unknown>[]>(
    initial?.mock_extract_responses ?? []
  );
  const [contracts, setContracts] = useState<Record<string, unknown>[]>(
    initial?.mock_contracts ?? []
  );
  const [errorConfig, setErrorConfig] = useState<Record<string, boolean>>(
    initial?.error_config ?? {}
  );
  const [isGuest, setIsGuest] = useState(initial?.is_guest ?? false);
  const [guestContractId, setGuestContractId] = useState(initial?.guest_contract_id ?? "");
  const [turns, setTurns] = useState<TurnSpec[]>(
    initial?.turns ?? [{ user_input: "" }]
  );

  // Prompt fixtures
  const [availablePrompts, setAvailablePrompts] = useState<string[]>([]);
  const [promptPreview, setPromptPreview] = useState("");
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [availableFields, setAvailableFields] = useState<string[]>([]);

  // Section collapse states
  const [isMockExpanded, setIsMockExpanded] = useState(false);
  const [isPrefilledExpanded, setIsPrefilledExpanded] = useState(false);

  // AI generation
  const [generateInput, setGenerateInput] = useState("");
  const [generatePromptFile, setGeneratePromptFile] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadPrompts();
  }, []);

  useEffect(() => {
    if (mockPromptFile) {
      loadPromptPreview(mockPromptFile);
    } else {
      setPromptPreview("");
      setAvailableFields([]);
    }
  }, [mockPromptFile]);

  async function loadPrompts() {
    try {
      const prompts = await listPrompts();
      setAvailablePrompts(prompts);
    } catch {
      // Runner API might not be running
    }
  }

  async function loadPromptPreview(promptName: string) {
    try {
      const content = await getPromptContent(promptName);
      setPromptPreview(content);
      const fields = await getPromptFields(promptName);
      setAvailableFields(fields);
    } catch {
      setPromptPreview("Failed to load prompt");
      setAvailableFields([]);
    }
  }

  async function handleGenerate() {
    if (!generateInput.trim()) return;
    try {
      setIsGenerating(true);
      const result = await generateScenario(generateInput, generatePromptFile);
      // Populate all form fields from the generated scenario
      setName(result.name ?? "");
      setDescription(result.description ?? "");
      setTags(result.tags?.join(", ") ?? "");
      setCategory(result.category ?? "flow");
      setContractType(result.contract_type ?? "purchase");
      setMode(result.mode ?? "New");
      setMockPromptFile(result.mock_prompt_file ?? "");
      setPrefilledFields(result.prefilled_fields ?? {});
      setExtractResponses(result.mock_extract_responses ?? []);
      setContracts(result.mock_contracts ?? []);
      setErrorConfig(result.error_config ?? {});
      setIsGuest(result.is_guest ?? false);
      setGuestContractId(result.guest_contract_id ?? "");
      setTurns(result.turns ?? [{ user_input: "" }]);
      toast.success("Scenario generated — review and save");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  }

  function handleSave() {
    const data: ScenarioCreateRequest = {
      name,
      description,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      category,
      contract_type: contractType,
      mode,
      mock_prompt_file: mockPromptFile,
      prefilled_fields: prefilledFields,
      mock_extract_responses: extractResponses,
      mock_contracts: contracts,
      error_config: errorConfig,
      is_guest: isGuest,
      guest_contract_id: guestContractId,
      turns,
    };
    onSave(data);
  }

  function addTurn() {
    setTurns([...turns, { user_input: "" }]);
  }

  function updateTurn(index: number, turn: TurnSpec) {
    const updated = [...turns];
    updated[index] = turn;
    setTurns(updated);
  }

  function removeTurn(index: number) {
    if (turns.length <= 1) return;
    setTurns(turns.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-8">
      {/* AI Generate */}
      {!initial && (
        <section className="space-y-3 bg-[#ECFDF5] border border-[#0F766E]/15 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#0F766E]" />
            <h2 className="text-[14px] font-semibold text-[#0F766E]">
              Generate with AI
            </h2>
          </div>
          <p className="text-[12px] text-[#115E59]">
            Describe what you want to test in plain English. AI will generate the full
            scenario — turns, assertions, and mock setup — for you to review.
          </p>
          <Textarea
            placeholder="e.g., Test that the agent asks for seller name after buyer name, skips the prefilled address, and calls deliver_extraction after the user provides the seller name"
            value={generateInput}
            onChange={(e) => setGenerateInput(e.target.value)}
            className="min-h-[80px] border-[#0F766E]/20 bg-white rounded-none resize-none text-sm"
          />
          <div className="flex items-end gap-3">
            <div className="space-y-1.5 flex-1">
              <Label className="text-[12px] text-[#115E59]">
                Prompt fixture (optional — helps AI know the fields)
              </Label>
              <Select
                value={generatePromptFile || "__none__"}
                onValueChange={(v) => setGeneratePromptFile(v === "__none__" ? "" : v)}
              >
                <SelectTrigger className="h-9 border-[#0F766E]/20 bg-white rounded-none text-sm">
                  <SelectValue placeholder="Select prompt..." />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="__none__">None</SelectItem>
                  {availablePrompts.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !generateInput.trim()}
              className="bg-[#0F766E] hover:bg-[#115E59]"
            >
              <Sparkles className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
        </section>
      )}

      {/* Section 1: Basics */}
      <section className="space-y-4">
        <h2 className="text-[14px] font-semibold text-[#111827] border-b border-[#E5E7EB] pb-2">
          Basics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px]">Scenario Name</Label>
            <Input
              placeholder="Purchase - Happy Path"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 border-[#E5E7EB] rounded-none"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px]">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10 border-[#E5E7EB] rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px]">Description</Label>
          <Textarea
            placeholder="What this scenario validates..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[60px] border-[#E5E7EB] rounded-none resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[13px]">Tags (comma-separated)</Label>
          <Input
            placeholder="smoke, purchase, field_ordering"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="h-9 border-[#E5E7EB] rounded-none"
          />
        </div>
      </section>

      {/* Section 2: Setup */}
      <section className="space-y-4">
        <h2 className="text-[14px] font-semibold text-[#111827] border-b border-[#E5E7EB] pb-2">
          Setup
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-[13px]">Contract Type</Label>
            <Select value={contractType} onValueChange={setContractType}>
              <SelectTrigger className="h-10 border-[#E5E7EB] rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="purchase">Purchase</SelectItem>
                <SelectItem value="bba">BBA</SelectItem>
                <SelectItem value="counter">Counter Offer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px]">Mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="h-10 border-[#E5E7EB] rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Edit">Edit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[13px]">Voice Prompt Fixture</Label>
            <Select
              value={mockPromptFile || "__none__"}
              onValueChange={(v) => setMockPromptFile(v === "__none__" ? "" : v)}
            >
              <SelectTrigger className="h-10 border-[#E5E7EB] rounded-none">
                <SelectValue placeholder="Select prompt file..." />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                <SelectItem value="__none__">No prompt fixture</SelectItem>
                {availablePrompts.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Prompt preview */}
        {promptPreview && (
          <div className="space-y-1.5">
            <button
              onClick={() => setIsPromptExpanded(!isPromptExpanded)}
              className="flex items-center gap-1 text-[12px] font-medium text-[#0F766E] hover:text-[#115E59]"
            >
              {isPromptExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {isPromptExpanded ? "Hide" : "Show"} prompt preview ({availableFields.length} fields)
            </button>
            {isPromptExpanded && (
              <pre className="text-[11px] text-[#6B7280] bg-zinc-50 border border-[#E5E7EB] p-3 overflow-x-auto max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                {promptPreview}
              </pre>
            )}
          </div>
        )}
      </section>

      {/* Section 3: Pre-filled Fields (collapsible) */}
      <section className="space-y-3">
        <button
          onClick={() => setIsPrefilledExpanded(!isPrefilledExpanded)}
          className="flex items-center gap-2 w-full text-left border-b border-[#E5E7EB] pb-2"
        >
          <h2 className="text-[14px] font-semibold text-[#111827]">
            Pre-filled Fields
          </h2>
          <span className="text-[12px] text-[#9CA3AF]">
            ({Object.keys(prefilledFields).length})
          </span>
          <div className="flex-1" />
          {isPrefilledExpanded ? (
            <ChevronUp className="h-4 w-4 text-[#9CA3AF]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
          )}
        </button>
        {isPrefilledExpanded && (
          <PrefilledFieldsEditor
            fields={prefilledFields}
            onChange={setPrefilledFields}
            availableFields={availableFields}
          />
        )}
      </section>

      {/* Section 4: Mock Responses (collapsible) */}
      <section className="space-y-3">
        <button
          onClick={() => setIsMockExpanded(!isMockExpanded)}
          className="flex items-center gap-2 w-full text-left border-b border-[#E5E7EB] pb-2"
        >
          <h2 className="text-[14px] font-semibold text-[#111827]">
            Mock Responses
          </h2>
          <span className="text-[12px] text-[#9CA3AF]">
            ({extractResponses.length} extract, {contracts.length} contracts)
          </span>
          <div className="flex-1" />
          {isMockExpanded ? (
            <ChevronUp className="h-4 w-4 text-[#9CA3AF]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
          )}
        </button>
        {isMockExpanded && (
          <MockSetup
            extractResponses={extractResponses}
            onExtractResponsesChange={setExtractResponses}
            contracts={contracts}
            onContractsChange={setContracts}
            errorConfig={errorConfig}
            onErrorConfigChange={setErrorConfig}
          />
        )}
      </section>

      {/* Section 5: Conversation Turns */}
      <section className="space-y-4">
        <h2 className="text-[14px] font-semibold text-[#111827] border-b border-[#E5E7EB] pb-2">
          Conversation Turns ({turns.length})
        </h2>

        <div className="space-y-3">
          {turns.map((turn, index) => (
            <TurnEditor
              key={index}
              turn={turn}
              index={index}
              onChange={(t) => updateTurn(index, t)}
              onRemove={() => removeTurn(index)}
              availableFields={availableFields}
            />
          ))}
        </div>

        <Button variant="outline" onClick={addTurn} className="w-full">
          <Plus className="h-4 w-4" />
          Add Turn
        </Button>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-[#E5E7EB] pt-6">
        <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
          {isSaving ? "Saving..." : "Save Scenario"}
        </Button>
      </div>
    </div>
  );
}
