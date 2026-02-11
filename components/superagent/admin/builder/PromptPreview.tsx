"use client";
import { List } from "lucide-react";
interface PromptPreviewProps {
  field: {
    slug: string;
    type: string;
    instructions: string;
  };
}
export function PromptPreview({ field }: PromptPreviewProps) {
  return (
    <div className="bg-white border border-zinc-200 p-4 shadow-sm shrink-0 w-full">
      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2">
        <List className="w-3 h-3" /> Prompt Preview
      </h4>
      <div className="bg-zinc-50 border border-zinc-100 p-4 max-h-[100px] overflow-y-auto">
        <code className="text-xs text-zinc-600 font-mono leading-relaxed block">
          <span className="text-purple-600">EXTRACT:</span>
          {field.slug || "field_slug"}
          <br /> <span className="text-blue-600">TYPE:</span> {field.type}
          <br /> <span className="text-emerald-600">CONTEXT:</span>
          {field.instructions || "No custom instructions defined."}
        </code>
      </div>
    </div>
  );
}
