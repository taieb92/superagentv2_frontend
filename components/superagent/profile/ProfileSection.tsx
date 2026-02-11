"use client";
import { LucideIcon } from "lucide-react";
interface ProfileSectionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
}
export function ProfileSection({
  title,
  icon: Icon,
  description,
  children,
}: ProfileSectionProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-none overflow-hidden shadow-sm">
      <div className="px-8 py-6 border-b border-[#E5E7EB] flex items-center gap-4">
        <div className="p-2.5 bg-[#F0FDF4] border border-[#E5E7EB] rounded-none text-[#0F766E]">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-[18px] font-semibold text-[#111827]">{title}</h2>
          <p className="text-[14px] text-[#6B7280]">{description}</p>
        </div>
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}
