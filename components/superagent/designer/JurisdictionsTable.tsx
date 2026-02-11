"use client";

import { StatusPill } from "@/components/superagent/ui/StatusPill";
import { Button } from "@/components/ui/button";
import { JurisdictionResponseDto as Jurisdiction } from "@/lib/api/generated/fetch-client";
import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";

import { useTemplatesByJurisdiction } from "@/lib/hooks/use-templates";

interface JurisdictionsTableProps {
  jurisdictions: Jurisdiction[];
  isLoading?: boolean;
}

export function JurisdictionsTable({
  jurisdictions,
  isLoading,
}: JurisdictionsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 w-full animate-pulse bg-white border border-[#E5E7EB] rounded-[8px]"
          />
        ))}
      </div>
    );
  }

  if (jurisdictions.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-[10px] p-12 text-center">
        <div className="bg-[#F8F9FB] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-6 w-6 text-[#9CA3AF]" />
        </div>
        <h3 className="text-[16px] font-semibold text-[#111827] mb-1">
          No Jurisdictions Found
        </h3>
        <p className="text-[14px] text-[#6B7280]">
          Get started by adding your first jurisdiction.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[10px] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-[#F8F9FB]">
              <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider w-[40%]">
                Jurisdiction
              </th>
              <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider w-[15%]">
                Code
              </th>
              <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider w-[15%] text-center">
                Docs
              </th>
              <th className="px-6 py-4 text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider w-[15%]">
                Status
              </th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F3F4F6]">
            {jurisdictions.map((item) => (
              <JurisdictionRow key={item.id} jurisdiction={item} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JurisdictionRow({ jurisdiction }: { jurisdiction: Jurisdiction }) {
  const { data: templates } = useTemplatesByJurisdiction(jurisdiction.code || "");
  const docsCount = Array.isArray(templates) ? templates.length : 0;

  return (
    <tr className="group hover:bg-[#F8F9FB] transition-colors cursor-pointer">
      <td className="px-6 py-5">
        <Link href={`/admin/designer/${jurisdiction.code}`} className="block">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ECFDF5] text-[#0F766E] rounded-none shrink-0 group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
              <MapPin className="h-4 w-4" />
            </div>
            <span className="text-[14px] font-semibold text-[#111827]">
              {jurisdiction.name}
            </span>
          </div>
        </Link>
      </td>
      <td className="px-6 py-5">
        <span className="text-[14px] text-[#4B5563] font-medium font-mono">
          {jurisdiction.code}
        </span>
      </td>
      <td className="px-6 py-5 text-center">
        <span className="text-[14px] font-semibold text-[#111827]">
          {docsCount}
        </span>
      </td>
      <td className="px-6 py-5">
        <StatusPill status="COMPLETED" />
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/admin/designer/${jurisdiction.code}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-[13px] font-medium text-[#4B5563] hover:bg-white hover:text-[#0F766E] border border-transparent hover:border-[#E5E7EB] gap-1.5"
            >
              Open <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </td>
    </tr>
  );
}
