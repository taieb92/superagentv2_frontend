"use client";

import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PrefilledFieldsEditorProps {
  fields: Record<string, string>;
  onChange: (fields: Record<string, string>) => void;
  availableFields: string[];
}

export function PrefilledFieldsEditor({
  fields,
  onChange,
  availableFields,
}: PrefilledFieldsEditorProps) {
  const entries = Object.entries(fields);

  function addField() {
    onChange({ ...fields, "": "" });
  }

  function updateKey(oldKey: string, newKey: string, index: number) {
    const newFields: Record<string, string> = {};
    let i = 0;
    for (const [k, v] of Object.entries(fields)) {
      if (i === index) {
        newFields[newKey] = v;
      } else {
        newFields[k] = v;
      }
      i++;
    }
    onChange(newFields);
  }

  function updateValue(key: string, value: string) {
    onChange({ ...fields, [key]: value });
  }

  function removeField(key: string) {
    const newFields = { ...fields };
    delete newFields[key];
    onChange(newFields);
  }

  return (
    <div className="space-y-3">
      <Label className="text-[13px] font-medium text-[#111827]">
        Pre-filled Fields
      </Label>
      <p className="text-[12px] text-[#9CA3AF]">
        Fields that are already filled in (Edit mode). Agent will skip these.
      </p>

      {entries.map(([key, value], index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            placeholder="Field name"
            value={key}
            onChange={(e) => updateKey(key, e.target.value, index)}
            className="flex-1 h-9 text-sm border-[#E5E7EB] rounded-none"
            list={`field-suggestions-${index}`}
          />
          <datalist id={`field-suggestions-${index}`}>
            {availableFields.map((f) => (
              <option key={f} value={f} />
            ))}
          </datalist>
          <Input
            placeholder="Value"
            value={value}
            onChange={(e) => updateValue(key, e.target.value)}
            className="flex-1 h-9 text-sm border-[#E5E7EB] rounded-none"
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => removeField(key)}
            className="shrink-0"
          >
            <X className="h-3.5 w-3.5 text-[#9CA3AF]" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addField}
        className="text-[13px]"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Field
      </Button>
    </div>
  );
}
