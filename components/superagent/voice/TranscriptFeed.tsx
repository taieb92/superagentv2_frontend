"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

export interface TranscriptMessage {
  role: "user" | "agent" | "system";
  content: string;
}

interface TranscriptFeedProps {
  messages: TranscriptMessage[];
  className?: string;
}

export function TranscriptFeed({
  messages,
  className,
}: Readonly<TranscriptFeedProps>) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex-1 min-h-0 overflow-y-auto space-y-6 pr-4 custom-scrollbar",
        className
      )}
    >
      <AnimatePresence initial={false}>
        {messages.map((message, index) => {
          const isAgent = message.role === "agent";
          const isSystem = message.role === "system";

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col gap-1.5",
                isAgent ? "items-start" : "items-end",
                isSystem && "items-center py-2"
              )}
            >
              {!isSystem && (
                <span className="text-[11px] font-medium text-[#9CA3AF] uppercase tracking-wider px-1">
                  {isAgent ? "Assistant" : "You"}
                </span>
              )}

              <div
                className={cn(
                  "max-w-[85%] px-4 py-3 min-h-[44px] flex items-center text-[16px] leading-relaxed",
                  isAgent
                    ? "bg-[#F9FAFB] text-[#111827] border border-[#E5E7EB]"
                    : "bg-[#0F766E] text-white shadow-sm",
                  isSystem &&
                    "bg-transparent text-[#6B7280] text-[14px] italic border-none px-0 py-0 min-h-0"
                )}
              >
                {message.content}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {messages.length === 0 && (
        <div className="h-full min-h-[200px] flex items-center justify-center text-[#9CA3AF] text-[13px] italic border border-dashed border-[#E5E7EB] bg-white">
          Waiting for session to start...
        </div>
      )}
    </div>
  );
}
