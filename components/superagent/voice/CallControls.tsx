"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Mic, MicOff, PhoneOff } from "lucide-react";

interface CallControlsProps {
  isConnected: boolean;
  isConnecting: boolean;
  duration?: string; // e.g. "02:14"
  onToggleMic: () => void;
  onEndCall: () => void;
}

export function CallControls({
  isConnected,
  isConnecting,
  duration,
  onToggleMic,
  onEndCall,
}: CallControlsProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border border-zinc-200 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-2.5 h-2.5 animate-pulse",
              isConnected ? "bg-emerald-500" : "bg-zinc-300"
            )}
          />
          <span className="text-sm font-medium text-zinc-700">
            {isConnected ? "Live Session" : "Disconnected"}
          </span>
        </div>
        {duration && (
          <span className="text-sm font-mono text-zinc-500 bg-zinc-100 px-2 py-0.5">
            {duration}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleMic}
          disabled={isConnecting}
          className={cn(
            "h-10 w-10 border-zinc-200",
            isConnected
              ? "hover:bg-zinc-50 text-zinc-700"
              : "bg-zinc-100 text-zinc-400"
          )}
        >
          {isConnecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isConnected ? (
            <Mic className="h-4 w-4" />
          ) : (
            <MicOff className="h-4 w-4" />
          )}
        </Button>
        <Button
          onClick={onEndCall}
          disabled={!isConnected}
          className="bg-red-600 hover:bg-red-700 text-white px-4 h-10"
        >
          <PhoneOff className="w-4 h-4 mr-2" /> End Session
        </Button>
      </div>
    </div>
  );
}
