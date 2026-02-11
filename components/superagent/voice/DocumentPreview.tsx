"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AlertCircle, Check } from "lucide-react";

interface FieldStatus {
  key: string;
  label: string;
  value: string | null;
  status: "MISSING" | "LOW_CONFIDENCE" | "FILLED";
}

interface DocumentPreviewProps {
  title: string;
  progress: number;
  fields: FieldStatus[];
}

export function DocumentPreview({
  title,
  progress,
  fields,
}: DocumentPreviewProps) {
  return (
    <div className="flex flex-col h-full bg-zinc-50 border border-zinc-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-200 bg-white flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            Live Preview
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-zinc-900">{progress}%</div>
          <div className="text-xs text-zinc-500">Completed</div>
        </div>
      </div>

      {/* Document "Paper" Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto min-h-[600px] bg-white text-zinc-900 p-8 shadow-sm border border-zinc-200 space-y-8">
          <div className="text-center border-b border-zinc-100 pb-8 mb-8">
            <h1 className="text-2xl font-serif font-bold tracking-tight mb-2">
              RESIDENTIAL PURCHASE AGREEMENT
            </h1>
            <p className="text-xs text-zinc-400 uppercase tracking-widest">
              Official Standard Form
            </p>
          </div>

          <div className="grid gap-6">
            {/* Render fields as a "form" */}
            {fields.map((field) => (
              <div key={field.key} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-zinc-500 group-hover:text-zinc-800 transition-colors">
                    {field.label}
                  </label>
                  {field.status === "MISSING" && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase">
                      <AlertCircle className="w-3 h-3" /> Required
                    </span>
                  )}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "relative p-3 min-h-[44px] text-sm border transition-all cursor-default",
                          field.status === "MISSING"
                            ? "bg-red-50/50 border-red-200 text-red-800"
                            : field.status === "LOW_CONFIDENCE"
                              ? "bg-amber-50/50 border-amber-200 text-amber-900"
                              : "bg-zinc-50 border-zinc-200 text-zinc-900"
                        )}
                      >
                        {field.value || (
                          <span className="text-zinc-300 italic">
                            Waiting for input...
                          </span>
                        )}
                        {field.status === "FILLED" && (
                          <div className="absolute top-1/2 right-3 -translate-y-1/2 text-emerald-600">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="text-xs font-medium">
                        Status: {field.status}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
