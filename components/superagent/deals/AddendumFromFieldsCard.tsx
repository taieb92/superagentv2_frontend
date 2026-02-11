"use client";

import { humanizeAddendumSlug } from "@/lib/utils/addendum-from-fields";
import { cn } from "@/lib/utils";
import { FileText, ChevronRight } from "lucide-react";

interface AddendumFromFieldsCardProps {
  slug: string;
  onClick?: () => void;
}

export function AddendumFromFieldsCard({
  slug,
  onClick,
}: AddendumFromFieldsCardProps) {
  const displayName = humanizeAddendumSlug(slug);

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "bg-white border border-[#E5E7EB] rounded-[14px] p-5 shadow-sm flex items-center gap-4",
        onClick && "cursor-pointer hover:border-[#0F766E]/30 transition-colors"
      )}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#F0FDFA]">
        <FileText className="w-5 h-5 text-[#0F766E]" />
      </div>
      <h3 className="text-[15px] font-semibold text-[#111827] flex-1">
        {displayName}
      </h3>
      {onClick && (
        <ChevronRight className="w-5 h-5 text-[#9CA3AF]" />
      )}
    </div>
  );
}

interface AddendumFromFieldsCardWithTemplateProps {
  slug: string;
  fieldValues: Record<string, unknown>;
  jurisdictionCode: string;
  onClick?: () => void;
}

export function AddendumFromFieldsCardWithTemplate({
  slug,
  onClick,
}: AddendumFromFieldsCardWithTemplateProps) {
  return (
    <AddendumFromFieldsCard
      slug={slug}
      onClick={onClick}
    />
  );
}
