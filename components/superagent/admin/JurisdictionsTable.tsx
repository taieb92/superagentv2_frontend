"use client";
import type { JurisdictionResponseDto as Jurisdiction } from "@/lib/api/generated/fetch-client";
import { cn } from "@/lib/utils";
import { ArrowRight, FileText, MapPin } from "lucide-react";
import Link from "next/link";
interface JurisdictionsTableProps {
  jurisdictions: Jurisdiction[];
  loading: boolean;
}
export function JurisdictionsTable({
  jurisdictions,
  loading,
}: JurisdictionsTableProps) {
  if (loading) {
    return (
      <div className="bg-white border border-zinc-200 overflow-hidden shadow-sm">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-b-2 border-[#0F766E]"></div>
        </div>
      </div>
    );
  }
  if (jurisdictions.length === 0) {
    return (
      <div className="bg-white border border-zinc-200 overflow-hidden shadow-sm p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-zinc-50 flex items-center justify-center mb-4">
          <MapPin className="w-8 h-8 text-zinc-300" />
        </div>
        <h3 className="text-zinc-900 font-medium mb-1">
          No jurisdictions found
        </h3>
        <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-6">
          Try adjusting your search or add a new jurisdiction to get started.
        </p>
      </div>
    );
  }
  return (
    <div className="bg-white border border-zinc-200 overflow-hidden shadow-sm w-full text-left">
      {/* Table Header */}
      <div className="grid grid-cols-12 px-6 py-3 bg-zinc-50/50 border-b border-zinc-100 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        <div className="col-span-4">State / Name</div>
        <div className="col-span-3">Status</div>
        <div className="col-span-3">Templates</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-zinc-100">
        {jurisdictions.map((item) => (
          <Link
            href={`/admin/jurisdictions/${item.code}
`}
            key={item.id}
            className="block group"
          >
            <div className="grid grid-cols-12 px-6 py-4 items-center hover:bg-zinc-50/80 transition-colors">
              {/* Name */}
              <div className="col-span-4 pr-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-600 group-hover:bg-[#ECFDF5] group-hover:text-[#0F766E] transition-colors">
                    {item.code}
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900 group-hover:text-[#0F766E] transition-colors">
                      {item.name}
                    </div>
                    <div className="text-xs text-zinc-500">ID: {item.id}</div>
                  </div>
                </div>
              </div>
              {/* Status */}
              <div className="col-span-3">
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 text-xs font-medium border",
                    "bg-emerald-50 text-emerald-700 border-emerald-100"
                  )}
                >
                  Active
                </span>
              </div>
              {/* Document Count */}
              <div className="col-span-3">
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  <span>View Templates</span>
                </div>
              </div>
              {/* Actions */}
              <div className="col-span-2 text-right">
                <div className="flex items-center justify-end gap-2 text-[#0F766E] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-medium">Manage</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
