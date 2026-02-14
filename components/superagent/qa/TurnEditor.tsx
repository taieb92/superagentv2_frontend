"use client";

import { ChevronDown, ChevronUp, GripVertical, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { TurnSpec } from "@/lib/api/qa-runner";

interface TurnEditorProps {
  turn: TurnSpec;
  index: number;
  onChange: (turn: TurnSpec) => void;
  onRemove: () => void;
  availableFields: string[];
}

const TOOL_NAMES = ["get_prompt", "deliver_extraction", "get_all_contracts", "end_call"];

export function TurnEditor({
  turn,
  index,
  onChange,
  onRemove,
  availableFields,
}: TurnEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasToolCall = !!turn.expect_tool_call;
  const hasNoToolCall = !!turn.expect_no_tool_call;
  const toolCallName =
    typeof turn.expect_tool_call === "string"
      ? turn.expect_tool_call
      : turn.expect_tool_call?.name ?? "";
  const toolCallArgs =
    typeof turn.expect_tool_call === "object" && turn.expect_tool_call !== null
      ? turn.expect_tool_call.arguments ?? {}
      : {};

  function updateField<K extends keyof TurnSpec>(key: K, value: TurnSpec[K]) {
    onChange({ ...turn, [key]: value });
  }

  function setToolCall(name: string) {
    if (!name) {
      const { expect_tool_call, ...rest } = turn;
      onChange(rest as TurnSpec);
      return;
    }
    onChange({
      ...turn,
      expect_tool_call: { name, arguments: toolCallArgs },
      expect_no_tool_call: undefined,
    });
  }

  function setToolCallArg(key: string, value: string) {
    const args = { ...toolCallArgs, [key]: value };
    onChange({
      ...turn,
      expect_tool_call: { name: toolCallName, arguments: args },
    });
  }

  function toggleNoToolCall(checked: boolean) {
    if (checked) {
      const { expect_tool_call, ...rest } = turn;
      onChange({ ...rest, expect_no_tool_call: true } as TurnSpec);
    } else {
      const { expect_no_tool_call, ...rest } = turn;
      onChange(rest as TurnSpec);
    }
  }

  function updateContainsList(
    field: "expect_contains" | "expect_not_contains",
    value: string
  ) {
    const items = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onChange({ ...turn, [field]: items.length > 0 ? items : undefined });
  }

  return (
    <div className="border border-[#E5E7EB] bg-white shadow-sm">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <GripVertical className="h-4 w-4 text-[#9CA3AF] shrink-0" />
        <span className="text-[13px] font-semibold text-[#0F766E]">
          Turn {index + 1}
        </span>
        <span className="text-[13px] text-[#6B7280] truncate flex-1">
          {turn.user_input || "(empty — agent continues)"}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <X className="h-3.5 w-3.5 text-[#9CA3AF]" />
          </Button>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-[#9CA3AF]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#9CA3AF]" />
          )}
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-[#E5E7EB]">
          {/* User input */}
          <div className="pt-4 space-y-1.5">
            <Label className="text-[12px] font-medium text-[#6B7280]">User says</Label>
            <Input
              placeholder="What the user says (empty = agent continues from previous)"
              value={turn.user_input}
              onChange={(e) => updateField("user_input", e.target.value)}
              className="h-9 text-sm border-[#E5E7EB] rounded-none"
            />
          </div>

          <div className="h-px bg-[#E5E7EB]" />

          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
            Expected Agent Behavior
          </p>

          {/* Tool call expectations */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Label className="text-[12px] text-[#6B7280] shrink-0">Calls tool:</Label>
                <Select
                  value={toolCallName || "__none__"}
                  onValueChange={(v) => setToolCall(v === "__none__" ? "" : v)}
                >
                  <SelectTrigger className="w-[200px] h-8 text-sm border-[#E5E7EB] rounded-none">
                    <SelectValue placeholder="No tool call expected" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="__none__">No tool expected</SelectItem>
                    {TOOL_NAMES.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tool call arguments (only for get_prompt) */}
            {toolCallName === "get_prompt" && (
              <div className="ml-6 flex items-center gap-2 flex-wrap">
                <Label className="text-[11px] text-[#9CA3AF]">type:</Label>
                <Input
                  placeholder="purchase"
                  value={(toolCallArgs as Record<string, string>).type ?? ""}
                  onChange={(e) => setToolCallArg("type", e.target.value)}
                  className="w-24 h-7 text-xs border-[#E5E7EB] rounded-none"
                />
                <Label className="text-[11px] text-[#9CA3AF]">mode:</Label>
                <Input
                  placeholder="New"
                  value={(toolCallArgs as Record<string, string>).mode ?? ""}
                  onChange={(e) => setToolCallArg("mode", e.target.value)}
                  className="w-20 h-7 text-xs border-[#E5E7EB] rounded-none"
                />
              </div>
            )}

            {/* No tool call checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id={`no-tool-${index}`}
                checked={hasNoToolCall}
                onCheckedChange={(checked) => toggleNoToolCall(checked === true)}
              />
              <Label
                htmlFor={`no-tool-${index}`}
                className="text-[12px] text-[#6B7280] cursor-pointer"
              >
                Does NOT call any tool
              </Label>
            </div>
          </div>

          <div className="h-px bg-[#E5E7EB]" />

          {/* Message intent */}
          <div className="space-y-1.5">
            <Label className="text-[12px] font-medium text-[#6B7280]">
              Agent should say (semantic)
            </Label>
            <Input
              placeholder="e.g., Asks for the seller's full legal name"
              value={turn.expect_message_intent ?? ""}
              onChange={(e) =>
                updateField("expect_message_intent", e.target.value || undefined)
              }
              className="h-9 text-sm border-[#E5E7EB] rounded-none"
            />
          </div>

          {/* Contains / Not contains */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-[#6B7280]">
                Response must contain (comma-separated)
              </Label>
              <Input
                placeholder="address, buyer"
                value={(turn.expect_contains ?? []).join(", ")}
                onChange={(e) => updateContainsList("expect_contains", e.target.value)}
                className="h-8 text-sm border-[#E5E7EB] rounded-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-[#6B7280]">
                Response must NOT contain
              </Label>
              <Input
                placeholder="error, failed"
                value={(turn.expect_not_contains ?? []).join(", ")}
                onChange={(e) => updateContainsList("expect_not_contains", e.target.value)}
                className="h-8 text-sm border-[#E5E7EB] rounded-none"
              />
            </div>
          </div>

          {/* Field asked / not asked */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-[#6B7280]">
                Field being asked
              </Label>
              <Input
                placeholder="purchase.parties.seller_name"
                value={turn.expect_field_asked ?? ""}
                onChange={(e) =>
                  updateField("expect_field_asked", e.target.value || undefined)
                }
                className="h-8 text-sm border-[#E5E7EB] rounded-none"
                list={`field-asked-${index}`}
              />
              <datalist id={`field-asked-${index}`}>
                {availableFields.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-[#6B7280]">
                Fields NOT asked (comma-separated)
              </Label>
              <Input
                placeholder="purchase.parties.buyer1_name"
                value={(turn.expect_field_not_asked ?? []).join(", ")}
                onChange={(e) => {
                  const items = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  updateField(
                    "expect_field_not_asked",
                    items.length > 0 ? items : undefined
                  );
                }}
                className="h-8 text-sm border-[#E5E7EB] rounded-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
