"use client";

import { useUser } from "@clerk/nextjs";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { AgentSidebar } from "./AgentSidebar";
import { MobileSidebar } from "./MobileSidebar";
import { TopBar } from "./TopBar";

const AGENT_NAV_ITEMS = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "SuperAgent", href: "/dashboard/superagent", icon: Sparkles },
  { label: "Purchase Contracts", href: "/dashboard/deals", icon: Briefcase },
  { label: "BBAs", href: "/dashboard/bbas", icon: FileText },
  { label: "Profile", href: "/dashboard/profile", icon: UserCircle },
];

export function PageShell({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // Handle client-side mounting to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if user is not active or uninvited (client-side only)
  useEffect(() => {
    if (isMounted && isLoaded && user) {
      const role = (user?.publicMetadata?.role as string) || "";
      const status = (user?.publicMetadata?.status as string) || "";

      // If user is neither admin nor active agent, deny access
      if (role !== "admin" && status !== "ACTIVE") {
        router.push("/");
      }
    }
  }, [isMounted, isLoaded, user, router]);

  // Show loading state during initial load to match server/client render
  if (!isMounted || !isLoaded) {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-zinc-50 to-slate-50 overflow-x-hidden">
        <div className="flex flex-1 flex-col min-w-0">
          <main className="flex-1 px-3 pb-8 pt-4 md:px-6 lg:px-8 mx-auto max-w-[1400px] w-full">
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-zinc-50 to-slate-50 overflow-x-hidden">
      <AgentSidebar />
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
        items={AGENT_NAV_ITEMS}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <TopBar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 px-3 pb-8 pt-4 md:px-6 lg:px-8 mx-auto max-w-[1400px] w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
