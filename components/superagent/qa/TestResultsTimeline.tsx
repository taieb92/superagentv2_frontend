"use client";

import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import type { TurnResult, TurnCheckResult } from "@/lib/api/qa-runner";

interface TestResultsTimelineProps {
  turns: TurnResult[];
  status: "passed" | "failed" | "error";
  durationMs: number;
  error?: string;
}

function CheckIcon({ passed }: { passed: boolean }) {
  if (passed) {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />;
  }
  return <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
}

function CheckRow({ check }: { check: TurnCheckResult }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetails = !check.passed && !!(check.reason || check.actual);

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-1 px-2",
          hasDetails && "cursor-pointer hover:bg-zinc-50"
        )}
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
      >
        <CheckIcon passed={check.passed} />
        <span className="text-[13px] text-[#111827] font-medium">{check.type}</span>
        {check.expected != null && (
          <span className="text-[12px] text-[#6B7280]">
            : &quot;{String(check.expected).slice(0, 60)}&quot;
          </span>
        )}
        <span
          className={cn(
            "ml-auto text-[11px] font-semibold",
            check.passed ? "text-emerald-600" : "text-red-500"
          )}
        >
          {check.passed ? "PASS" : "FAIL"}
        </span>
        {hasDetails && (
          isExpanded ? (
            <ChevronUp className="h-3 w-3 text-[#9CA3AF]" />
          ) : (
            <ChevronDown className="h-3 w-3 text-[#9CA3AF]" />
          )
        )}
      </div>
      {isExpanded && hasDetails && (
        <div className="ml-8 mb-2 p-2 bg-red-50 border border-red-100 text-[12px] text-red-700">
          {check.reason ? <p>{String(check.reason)}</p> : null}
          {check.actual != null && (
            <p className="mt-1 text-[11px] text-red-500">
              Actual: {String(check.actual).slice(0, 200)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function TestResultsTimeline({
  turns,
  status,
  durationMs,
  error,
}: TestResultsTimelineProps) {
  if (error) {
    return (
      <div className="border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-sm font-semibold text-red-700">Execution Error</span>
        </div>
        <p className="text-[13px] text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Summary bar */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border",
          status === "passed"
            ? "bg-emerald-50 border-emerald-200"
            : "bg-red-50 border-red-200"
        )}
      >
        <div className="flex items-center gap-2">
          {status === "passed" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span
            className={cn(
              "text-sm font-semibold",
              status === "passed" ? "text-emerald-700" : "text-red-700"
            )}
          >
            {status === "passed" ? "All checks passed" : "Some checks failed"}
          </span>
        </div>
        <span className="text-[12px] text-[#6B7280]">{durationMs}ms</span>
      </div>

      {/* Per-turn timeline */}
      {turns.map((turn) => {
        const allPassed = turn.checks.every((c) => c.passed);
        return (
          <div
            key={turn.turn}
            className="border border-[#E5E7EB] bg-white"
          >
            {/* Turn header */}
            <div className="flex items-start gap-3 px-4 py-3 border-b border-[#E5E7EB]">
              <div
                className={cn(
                  "mt-0.5 h-6 w-6 flex items-center justify-center rounded-full text-[11px] font-bold shrink-0",
                  allPassed
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                {turn.turn}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#111827]">
                  {turn.user_input || "(agent continues)"}
                </p>
                {turn.agent_response && (
                  <p className="mt-1 text-[12px] text-[#6B7280] line-clamp-3">
                    Agent: &quot;{turn.agent_response}&quot;
                  </p>
                )}
                {turn.tool_calls.length > 0 && (
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {turn.tool_calls.map((tc, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono bg-[#ECFDF5] text-[#0F766E] px-1.5 py-0.5 border border-[#0F766E]/10"
                      >
                        {tc.name}()
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Checks */}
            {turn.checks.length > 0 && (
              <div className="px-2 py-1">
                {turn.checks.map((check, i) => (
                  <CheckRow key={i} check={check} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
