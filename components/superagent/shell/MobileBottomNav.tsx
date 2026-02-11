"use client";
import { cn } from "@/lib/utils";
import {
  FileText,
  LayoutDashboard,
  Mic,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
const NAV_ITEMS = [
  {
    label: "Home",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Contracts",
    href: "/dashboard/deals",
    icon: FileText,
  },
  {
    label: "Voice",
    href: "/dashboard/superagent",
    icon: Mic,
    isPrimary: true,
  },
  {
    label: "BBAs",
    href: "/dashboard/bbas",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/dashboard/profile",
    icon: UserCircle,
  },
];
export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
      <nav className="bg-zinc-900/90 backdrop-blur-lg border border-white/10 shadow-2xl flex items-center justify-between px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          if (item.isPrimary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-6"
              >
                <div
                  className={cn(
                    "w-14 h-14 flex items-center justify-center shadow-lg transition-transform active:scale-95 border-4 border-zinc-50",
                    isActive
                      ? "bg-white text-[#0F766E]"
                      : "bg-[#0F766E] text-white"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </Link>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[60px] py-2 transition-colors",
                isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon
                className={cn("w-5 h-5", isActive ? "fill-white/10" : "")}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 bg-white" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
