"use client";

import { useExtractions } from "@/lib/hooks/use-extractions";
import { listContainer, listItem } from "@/components/superagent/motion/motion";
import { motion } from "framer-motion";

interface ExtractionsFieldsProps {
  callId: string | null;
  pollInterval?: number;
  enabled?: boolean;
}

/**
 * Read-only extraction fields for mobile/call use.
 * Label + value only, chronological (latest on top), larger touch targets.
 */
export function ExtractionsFields({
  callId,
  pollInterval = 10000,
  enabled = true,
}: Readonly<ExtractionsFieldsProps>) {
  const { fields, isLoading, error } = useExtractions({
    callId,
    pollInterval,
    enabled,
  });

  if (error) {
    return (
      <div className="bg-[#FEF2F2] border border-[#FCA5A5] p-6">
        <p className="text-[14px] text-[#B91C1C]">
          Failed to load extractions. Please try again.
        </p>
      </div>
    );
  }

  if (isLoading && fields.length === 0) {
    return (
      <div className="space-y-3 border border-[#E5E7EB] bg-white overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[52px] bg-[#F9FAFB] border-[#E5E7EB] animate-pulse"
            style={{ borderBottom: "1px solid #E5E7EB" }}
          />
        ))}
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="border border-[#E5E7EB] bg-white p-8 text-center">
        <p className="text-[14px] text-[#6B7280]">
          No fields extracted yet. Fields will appear here as they are detected.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[440px] overflow-y-auto pr-2 border border-[#E5E7EB] bg-white overflow-hidden">
      <motion.div
        variants={listContainer}
        initial="hidden"
        animate="show"
        className="divide-y divide-[#E5E7EB]"
      >
        {[...fields].reverse().map((field) => (
          <motion.div
            key={field.key}
            variants={listItem}
            className="flex min-h-[52px] items-center justify-between gap-4 px-6 py-4"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-medium text-[#6B7280] uppercase tracking-wider">
                {field.key}
              </div>
              <div className="text-[14px] text-[#111827] leading-relaxed truncate">
                {field.value || (
                  <span className="text-[#9CA3AF] italic">Waiting...</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
