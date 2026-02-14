"use client";

import { Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RunButtonProps {
  onClick: () => void;
  isRunning: boolean;
  lastStatus?: "passed" | "failed" | "error" | null;
  className?: string;
}

export function RunButton({
  onClick,
  isRunning,
  lastStatus,
  className,
}: RunButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isRunning}
      className={cn(
        lastStatus === "passed" && "bg-emerald-600 hover:bg-emerald-700",
        lastStatus === "failed" && "bg-red-600 hover:bg-red-700",
        className
      )}
    >
      <Play className="h-4 w-4" />
      {isRunning ? "Running..." : "Run Test"}
    </Button>
  );
}
