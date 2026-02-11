"use client";
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
import { Type } from "lucide-react";
//  Define strict types for the field configuration
export interface FieldConfig {
  label: string;
  type: string;
  required: boolean;
  slug: string;
  source: string;
  instructions: string;
}
interface FieldConfigFormProps {
  config: FieldConfig;
  onChange: (newConfig: FieldConfig) => void;
}
export function FieldConfigForm({ config, onChange }: FieldConfigFormProps) {
  //  Local state to handle inputs smoothly, sync with prop on change or blur if needed // For simplicity in this shell, we'll pipe changes directly up.
  return (
    <div className="bg-white border border-zinc-200 p-6 shadow-sm flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
          <Type className="w-4 h-4 text-zinc-400" /> Field Configuration
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
            Saved
          </span>
          <div className="h-2 w-2 bg-emerald-500" title="Saved" />
        </div>
      </div>
      <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
            Field Label
          </Label>
          <Input
            value={config.label}
            onChange={(e) =>
              onChange({
                ...config,
                label: e.target.value,
              })
            }
            className="h-9 font-medium focus-visible:ring-[#0F766E]"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
            Data Type
          </Label>
          <Select
            value={config.type}
            onValueChange={(v) =>
              onChange({
                ...config,
                type: v,
              })
            }
          >
            <SelectTrigger className="h-9 focus:ring-[#0F766E]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TEXT">Text String</SelectItem>
              <SelectItem value="NUMBER">Number / Currency</SelectItem>
              <SelectItem value="DATE">Date</SelectItem>
              <SelectItem value="BOOL">Checkbox</SelectItem>
              <SelectItem value="ENUM">Dropdown / Enum</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
            Slug (API Key)
          </Label>
          <Input
            value={config.slug}
            onChange={(e) =>
              onChange({
                ...config,
                slug: e.target.value,
              })
            }
            className="h-9 font-mono text-xs text-zinc-600 bg-zinc-50 focus-visible:ring-[#0F766E]"
          />
        </div>
        <div className="p-4 bg-zinc-50 border border-zinc-100 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
              Data Source
            </Label>
            <Select
              value={config.source}
              onValueChange={(v) =>
                onChange({
                  ...config,
                  source: v,
                })
              }
            >
              <SelectTrigger className="h-9 bg-white focus:ring-[#0F766E]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VOICE_SESSION">
                  Voice Session (AI Extracted)
                </SelectItem>
                <SelectItem value="AGENT_PROFILE">
                  Agent Profile (Prefill)
                </SelectItem>
                <SelectItem value="BBA">BBA Context</SelectItem>
                <SelectItem value="MLS">MLS Data</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {config.source === "VOICE_SESSION" && (
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                Extraction Instructions
              </Label>
              <Textarea
                value={config.instructions || ""}
                onChange={(e) =>
                  onChange({
                    ...config,
                    instructions: e.target.value,
                  })
                }
                className="h-24 bg-white text-xs leading-relaxed resize-none focus-visible:ring-[#0F766E]"
                placeholder="Describe how the AI should find this value..."
              />
              <p className="text-[10px] text-zinc-400">
                Tell the AI exactly what to listen for.
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            checked={config.required}
            onChange={() =>
              onChange({
                ...config,
                required: !config.required,
              })
            }
            className="border-zinc-300 text-[#0F766E] focus:ring-[#0F766E]"
          />
          <span className="text-sm text-zinc-700">Required Field</span>
        </div>
      </div>
    </div>
  );
}
