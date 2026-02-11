"use client";

import { listContainer, listItem } from "@/components/superagent/motion/motion";
import { useGetExtractionsQuery } from "@/lib/api/generated/fetch-client/Query";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNowStrict } from "date-fns";
import { motion } from "framer-motion";
import { ArrowRight, Mic } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

export interface RecentVoiceSessionItem {
  id: string;
  label: string;
  timestampISO: string;
  href?: string;
}

function timeAgo(iso: string) {
  try {
    return formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

interface RecentVoiceSessionsProps {
  items?: RecentVoiceSessionItem[];
}

/**
 * Recent voice sessions list. Same visual style as ActivityList.
 * Last 5 sessions with date/time and summary; click to view transcript (or deal).
 */
export function RecentVoiceSessions({
  items = [],
}: Readonly<RecentVoiceSessionsProps>) {
  const { user, isLoaded } = useUser();

  // 1. Fetch real extractions — only when Clerk has loaded so the API request includes auth
  const { data: extractions, isLoading } = useGetExtractionsQuery(
    user?.id,
    undefined, // callId
    { enabled: isLoaded && !!user?.id }
  );

  // 2. Transform into display items
  const displayItems = useMemo(() => {
    // If props items are passed, use them (fallback/override)
    if (items.length > 0) return items;

    if (!extractions) return [];

    // Sort by createdAt descending
    const sorted = [...extractions].sort((a, b) => {
      const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tB - tA;
    });

    return sorted.slice(0, 5).map((ex) => {
      // Create a label from fields or fallback
      let label = "Voice Session";
      if (ex.fieldsJson) {
        // Try to find a meaningful label from extracted fields
        // fieldsJson is a JsonNode, but assuming it behaves like an object or map
        const fields = ex.fieldsJson as any;
        // Most common address fields in contracts
        label =
          fields?.["Property Address"] ||
          fields?.["Address"] ||
          fields?.["Buyer Name"] ||
          "Untitled Session";
      }

      return {
        id: ex.callId || Math.random().toString(),
        label: label,
        timestampISO: ex.createdAt || new Date().toISOString(),
        href: "/dashboard/superagent", // Currently points to main voice page, could be specific transcript if supported
        // If we had a specific transcript page, it might be: `/dashboard/superagent/transcript/${ex.callId}`
      };
    });
  }, [items, extractions]);

  const list = displayItems;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={`skeleton-${i}`}
            className="h-[72px] w-full animate-pulse bg-[#F9FAFB] border border-[#E5E7EB]"
          />
        ))}
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="flex h-32 flex-col items-center justify-center border border-dashed border-[#E5E7EB] text-center p-6 bg-white">
        <p className="text-[13px] text-[#9CA3AF]">
          No recent voice sessions yet
        </p>
        <p className="text-[12px] text-[#9CA3AF] mt-1">
          Start a voice session to capture contract details
        </p>
        <Link
          href="/dashboard/superagent"
          className="mt-3 inline-flex items-center gap-2 text-[14px] font-medium text-[#0F766E] hover:text-[#115E59]"
        >
          <Mic className="h-4 w-4" />
          Start Voice Session
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      variants={listContainer}
      initial="hidden"
      animate="show"
      className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] bg-white overflow-hidden"
    >
      {list.map((it: RecentVoiceSessionItem) => {
        const href = it.href ?? "/dashboard/superagent";
        const content = (
          <div className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-[#F8F9FB]">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[#E5E7EB] bg-[#F9FAFB]">
                <Mic className="h-4 w-4 text-[#0F766E]" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[14px] text-[#374151] font-normal">
                  {it.label}
                </div>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[12px] text-[#9CA3AF] font-medium">
                {timeAgo(it.timestampISO)}
              </span>
              <ArrowRight className="h-4 w-4 text-[#9CA3AF]" />
            </div>
          </div>
        );
        return (
          <motion.div key={it.id} variants={listItem}>
            <Link href={href} className="block">
              {content}
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
