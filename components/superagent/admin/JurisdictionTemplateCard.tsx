"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { TemplateListDto } from "@/lib/api/generated/fetch-client";
import { ArrowRight, Clock, FileText } from "lucide-react";
import Link from "next/link";

interface JurisdictionTemplateCardProps {
  template: TemplateListDto;
}

export function JurisdictionTemplateCard({
  template,
}: JurisdictionTemplateCardProps) {
  const templateType = template.templateType || "CONTRACT";
  const displayType = templateType.replace("_", " ");
  const urlType = templateType.toLowerCase();

  return (
    <Card className="p-6 border-zinc-200 hover:border-zinc-300 transition-all flex flex-col items-start bg-white h-full justify-between shadow-sm hover:shadow-md">
      <div className="w-full">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-emerald-50 text-emerald-600">
            <FileText className="w-5 h-5" />
          </div>
          {/* Placeholder status - in real app could come from template.status */}
          <Badge
            variant="secondary"
            className="border font-medium bg-emerald-50 text-emerald-700 border-emerald-100 px-2 py-0.5 text-[10px] uppercase tracking-wider"
          >
            Active
          </Badge>
        </div>
        <h3 className="font-semibold text-zinc-900 mb-1 leading-snug">
          {template.title || "Untitled Template"}
        </h3>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
          {displayType}
        </p>
      </div>
      <div className="w-full pt-4 border-t border-zinc-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Clock className="w-3 h-3" />
          {template.createdAt
            ? new Date(template.createdAt).toLocaleDateString()
            : "-"}
        </div>
        <Link
          href={`/admin/designer/studio?jurisdictionCode=${
            template.jurisdictionCode
          }&type=${urlType}&slug=${template.slug || ""}`}
          className="text-xs font-bold text-[#0F766E] flex items-center hover:text-[#115E59] transition-colors"
        >
          CONFIGURE <ArrowRight className="w-3 h-3 ml-1" />
        </Link>
      </div>
    </Card>
  );
}
