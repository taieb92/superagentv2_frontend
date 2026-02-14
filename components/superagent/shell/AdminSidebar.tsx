"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  ChevronLeft,
  ChevronRight,
  FileCheck,
  FlaskConical,
  LayoutDashboard,
  Palette,
  Users,
} from "lucide-react";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Designer",
    href: "/admin/designer",
    icon: Palette,
  },
  {
    label: "Signed Contracts",
    href: "/admin/signed-contracts",
    icon: FileCheck,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "QA Tests",
    href: "/qa-tests",
    icon: FlaskConical,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={cn(
        "hidden flex-col border-r border-black/5 bg-white lg:flex relative overflow-hidden transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Soft background glow */}
      <div className="absolute -left-10 top-0 w-32 h-64 bg-zinc-50 rounded-full blur-3xl opacity-50" />

      <div className="relative flex h-20 items-center px-4 border-b border-black/5 bg-white/50 backdrop-blur-md">
        <div
          className={cn(
            "flex items-center gap-3 transition-all duration-300",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <div className="p-1.5 bg-zinc-900 rounded-none shadow-lg shadow-zinc-200/50">
            <div className="h-5 w-5 border-2 border-white rounded-none" />
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-sm font-bold text-zinc-900 tracking-tight">
                SuperAgent
              </span>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Admin Control
              </p>
            </div>
          )}
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 p-1.5 bg-white border border-zinc-200 rounded-full shadow-md hover:shadow-lg transition-all duration-200 group"
        >
          {isCollapsed ? (
            <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-900" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-zinc-600 group-hover:text-zinc-900" />
          )}
        </button>
      </div>

      <nav className="relative flex-1 space-y-2 px-4 py-8">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-none py-3 text-sm font-medium transition-all duration-300",
                isCollapsed ? "px-3 justify-center" : "px-4",
                isActive
                  ? "bg-white text-[#0F766E] shadow-md border-2 border-[#0F766E]"
                  : "text-[#0F766E] hover:bg-[#ECFDF5] hover:translate-x-1"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "size-4 transition-transform group-hover:scale-110",
                  isActive ? "text-[#0F766E]" : "text-[#0F766E]"
                )}
              />
              {!isCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="h-1.5 w-1.5 rounded-full bg-[#0F766E]"
                    />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div
        className={cn(
          "relative p-6 px-4 transition-all duration-300",
          isCollapsed ? "px-2" : "px-4"
        )}
      >
        {!isCollapsed ? (
          <div className="rounded-none bg-zinc-50 border border-black/[0.03] p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-0.5">
                System Online
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-zinc-900">
                Instance v0.1.0
              </p>
              <p className="text-[10px] text-zinc-400">
                Stable Build • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
