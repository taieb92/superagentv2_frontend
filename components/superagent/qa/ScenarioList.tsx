"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Play, FlaskConical } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/superagent/ui/StatCard";
import { EmptyState } from "@/components/superagent/ui/EmptyState";
import { listContainer, listItem } from "@/components/superagent/motion/motion";
import { cn } from "@/lib/utils";
import type { ScenarioSummary } from "@/lib/api/qa-runner";

interface ScenarioListProps {
  scenarios: ScenarioSummary[];
  isLoading: boolean;
  onRunAll: () => void;
  isRunningAll: boolean;
}

const CATEGORIES = [
  "all",
  "flow",
  "edit",
  "fields",
  "errors",
  "end_call",
];

function statusColor(result: string | null): string {
  if (result === "passed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (result === "failed") return "bg-red-50 text-red-700 border-red-200";
  return "bg-zinc-50 text-zinc-500 border-zinc-200";
}

function statusLabel(result: string | null): string {
  if (result === "passed") return "Passed";
  if (result === "failed") return "Failed";
  return "Not Run";
}

export function ScenarioList({
  scenarios,
  isLoading,
  onRunAll,
  isRunningAll,
}: ScenarioListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = scenarios.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      categoryFilter === "all" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const passedCount = scenarios.filter((s) => s.last_result === "passed").length;
  const failedCount = scenarios.filter((s) => s.last_result === "failed").length;
  const notRunCount = scenarios.filter((s) => s.last_result === null).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-[72px] flex-1 border bg-white animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-[140px] border bg-white animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="flex gap-3">
        <StatCard label="Total" count={scenarios.length} />
        <StatCard label="Passed" count={passedCount} />
        <StatCard label="Failed" count={failedCount} highlight={failedCount > 0} />
        <StatCard label="Not Run" count={notRunCount} />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 border border-[#E5E7EB] shadow-sm">
        <div className="relative flex-1 w-full">
          <Input
            placeholder="Search scenarios by name or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 border-[#E5E7EB] focus:ring-[#0F766E]/5 focus:border-[#0F766E] rounded-none"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px] h-10 border-[#E5E7EB] rounded-none">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="rounded-none">
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Scenario Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No scenarios found"
          description={searchQuery ? "Try a different search term" : "Create your first test scenario"}
          icon={<FlaskConical className="h-5 w-5 text-[#6B7280]" />}
        />
      ) : (
        <motion.div
          variants={listContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map((scenario) => (
            <motion.div key={scenario.file_path} variants={listItem}>
              <Link href={`/qa-tests/${encodeURIComponent(scenario.file_path)}`}>
                <div className="border border-[#E5E7EB] bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#111827] line-clamp-1">
                      {scenario.name}
                    </h3>
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 text-[11px] font-medium border rounded-full shrink-0 ml-2",
                        statusColor(scenario.last_result)
                      )}
                    >
                      {statusLabel(scenario.last_result)}
                    </span>
                  </div>

                  {scenario.description && (
                    <p className="text-[13px] text-[#6B7280] line-clamp-2 mb-3">
                      {scenario.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-medium text-[#0F766E] bg-[#ECFDF5] px-1.5 py-0.5 border border-[#0F766E]/10">
                        {scenario.contract_type}
                      </span>
                      <span className="text-[11px] text-[#6B7280]">
                        {scenario.turn_count} turns
                      </span>
                    </div>

                    <div className="flex gap-1">
                      {scenario.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-[#9CA3AF] bg-zinc-50 px-1.5 py-0.5 border border-zinc-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
