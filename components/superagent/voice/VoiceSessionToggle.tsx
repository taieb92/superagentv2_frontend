"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Eye, FileText, MessageSquare } from "lucide-react";

export type VoiceSessionView = "transcript" | "extracted" | "preview";

interface VoiceSessionToggleProps {
  activeView: VoiceSessionView;
  onViewChange: (view: VoiceSessionView) => void;
  extractedCount?: number;
  className?: string;
}

/**
 * Mobile-first toggle component for switching between
 * Transcript and Extracted Data views during voice sessions.
 * Designed with large touch targets (min 44px) for use during calls.
 */
export function VoiceSessionToggle({
  activeView,
  onViewChange,
  extractedCount = 0,
  className,
}: VoiceSessionToggleProps) {
  const tabs = [
    {
      id: "transcript" as const,
      label: "Transcript",
      icon: MessageSquare,
    },
    {
      id: "extracted" as const,
      label: "Data",
      icon: FileText,
      badge: extractedCount > 0 ? extractedCount : undefined,
    },
    {
      id: "preview" as const,
      label: "Preview",
      icon: Eye,
    },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 bg-[#F3F4F6] rounded-full",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeView === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            onClick={() => onViewChange(tab.id)}
            className={cn(
              "relative flex items-center justify-center gap-2 px-5 py-3 min-h-[44px] min-w-[100px] rounded-full text-sm font-medium transition-colors",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2",
              isActive ? "text-white" : "text-[#6B7280] hover:text-[#111827]"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="voiceSessionTab"
                className="absolute inset-0 bg-[#0F766E] rounded-full shadow-sm"
                transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#0F766E] text-white"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
