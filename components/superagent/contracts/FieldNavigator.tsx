"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UnfilledField } from "./useUnfilledFields";

interface FieldNavigatorProps {
  currentField: UnfilledField | null;
  currentIndex: number;
  totalRemaining: number;
  totalRequired: number;
  filledCount: number;
  onNext: () => void;
  onPrev: () => void;
  className?: string;
}

export function FieldNavigator({
  currentField,
  currentIndex,
  totalRemaining,
  totalRequired,
  filledCount,
  onNext,
  onPrev,
  className,
}: FieldNavigatorProps) {
  const progressPercentage = totalRequired > 0
    ? Math.round((filledCount / totalRequired) * 100)
    : 0;

  console.log("FieldNavigator DEBUG:", {
    hasCurrentField: !!currentField,
    totalRemaining,
    totalRequired,
    filledCount,
    currentIndex,
    currentFieldName: currentField?.name
  });

  // Always show the navigator at the bottom
  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 z-30",
        "bg-gradient-to-t from-white via-white/98 to-white/95 backdrop-blur-md",
        "border-t border-[#E5E7EB] shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]",
        className
      )}
    >
      {totalRemaining > 0 && currentField ? (
        <>
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#E5E7EB] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-600 to-teal-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between max-w-2xl mx-auto px-4 py-3">
            {/* Back arrow */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-teal-600/50 transition-colors"
              onClick={() => {
                console.log("Prev clicked, currentIndex:", currentIndex);
                onPrev();
              }}
              disabled={totalRemaining <= 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Field info */}
            <div className="flex-1 text-center px-4 min-w-0">
              <div className="text-sm font-medium text-[#111827] truncate">
                {currentField.label}
              </div>
              <div className="text-xs text-[#6B7280] mt-0.5">
                {currentIndex + 1} of {totalRemaining} remaining
                {filledCount > 0 && (
                  <span className="text-teal-700 ml-1 font-medium">
                    ({filledCount} filled)
                  </span>
                )}
                {progressPercentage > 0 && (
                  <span className="text-teal-600 ml-2">
                    {progressPercentage}%
                  </span>
                )}
              </div>
            </div>

            {/* Forward arrow */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-[#E5E7EB] hover:bg-[#F9FAFB] hover:border-teal-600/50 transition-colors"
              onClick={() => {
                console.log("Next clicked, currentIndex:", currentIndex);
                onNext();
              }}
              disabled={totalRemaining <= 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <div className="px-4 py-3 text-sm text-center">
          {totalRequired > 0 ? (
            <span className="text-green-600 font-medium">🎉 All {totalRequired} required fields completed!</span>
          ) : (
            <span className="text-gray-500">No required fields found in template</span>
          )}
        </div>
      )}
    </div>
  );
}
