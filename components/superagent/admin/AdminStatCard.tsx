"use client";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import Link from "next/link";
interface AdminStatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  actionLabel?: string;
  actionLink?: string;
}
export function AdminStatCard({
  title,
  value,
  icon,
  trend,
  actionLabel,
  actionLink,
}: AdminStatCardProps) {
  return (
    <div className="bg-white border border-zinc-200 p-6 shadow-sm flex flex-col justify-between h-full">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-zinc-500">{title}</h3> {icon}
        </div>
        <div>
          <div className="text-3xl font-light text-zinc-900 tracking-tight">
            {value}
          </div>
          {trend && (
            <div className="flex items-center gap-2 mt-2">
              <div
                className={cn(
                  "flex items-center text-xs font-medium px-1.5 py-0.5 border",
                  trend.direction === "up" &&
                    "text-emerald-700 bg-emerald-50 border-emerald-100",
                  trend.direction === "down" &&
                    "text-rose-700 bg-rose-50 border-rose-100",
                  trend.direction === "neutral" &&
                    "text-zinc-600 bg-zinc-50 border-zinc-100"
                )}
              >
                {trend.direction === "up" && (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                )}
                {trend.direction === "down" && (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {trend.direction === "neutral" && (
                  <Minus className="w-3 h-3 mr-1" />
                )}
                {trend.value}
              </div>
              {trend.label && (
                <span className="text-xs text-zinc-400">{trend.label}</span>
              )}
            </div>
          )}
        </div>
      </div>
      {actionLabel && actionLink && (
        <div className="mt-6 pt-4 border-t border-zinc-50">
          <Link
            href={actionLink}
            className="text-xs font-medium text-[#0F766E] hover:text-[#115E59] flex items-center transition-colors"
          >
            {actionLabel}
            <ArrowUpRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
}
