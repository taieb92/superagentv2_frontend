"use client";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
interface QuickLinkCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}
export function QuickLinkCard({
  title,
  description,
  icon,
  href,
}: QuickLinkCardProps) {
  return (
    <Link
      href={href}
      className="group block p-6 bg-white border border-zinc-200 hover:border-[#0F766E] hover:shadow-sm transition-all shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-zinc-50 text-zinc-500 group-hover:text-[#0F766E] group-hover:bg-[#ECFDF5] transition-colors">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900 group-hover:text-[#0F766E] transition-colors">
              {title}
            </h3>
            <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-[#0F766E] transform group-hover:translate-x-1 transition-all" />
          </div>
          <p className="mt-1 text-sm text-zinc-500 group-hover:text-zinc-600 transition-colors">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}
