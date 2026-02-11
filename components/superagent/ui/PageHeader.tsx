"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  right?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  action,
  right,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
      <div className="space-y-1">
        <h1 className="text-[24px] font-semibold tracking-tight text-[#111827] font-serif italic">
          {title}
        </h1>
        {subtitle && <p className="text-[14px] text-[#6B7280]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {right}
        {action}
      </div>
    </div>
  );
}
