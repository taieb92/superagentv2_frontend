"use client";

import { FileCheck, LucideIcon, Palette, Users } from "lucide-react";
import Link from "next/link";

const ADMIN_QUICK_LINKS = [
  {
    label: "Designer",
    href: "/admin/designer",
    icon: Palette,
    description:
      "Create and edit document templates with the built-in designer.",
  },
  {
    label: "Signed Contracts",
    href: "/admin/signed-contracts",
    icon: FileCheck,
    description: "Review and manage all fully executed agreements.",
  },
  {
    label: "User Management",
    href: "/admin/users",
    icon: Users,
    description: "Manage system access, roles, and user invitations.",
  },
];

interface QuickNavProps {
  items?: {
    label: string;
    href: string;
    icon: LucideIcon;
    description: string;
  }[];
}

export function QuickNav({ items = ADMIN_QUICK_LINKS }: QuickNavProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-[16px] font-semibold text-[#111827]">
        Quick Navigation
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group p-5 bg-white border border-[#E5E7EB] hover:border-[#0F766E] transition-all duration-200 rounded-[8px] flex items-start gap-4"
          >
            <div className="p-2.5 rounded-[6px] bg-[#ECFDF5] text-[#0F766E] transition-colors group-hover:bg-[#0F766E] group-hover:text-white">
              <item.icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-[14px] font-semibold text-[#111827] group-hover:text-[#0F766E] transition-colors">
                {item.label}
              </p>
              <p className="text-[12px] text-[#6B7280] leading-relaxed">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
