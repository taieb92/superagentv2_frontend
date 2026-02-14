"use client";

import { FileCheck, FlaskConical, LayoutDashboard, Palette, Users } from "lucide-react";
import { ReactNode, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";
import { MobileSidebar } from "./MobileSidebar";

const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Designer", href: "/admin/designer", icon: Palette },
  {
    label: "Signed Contracts",
    href: "/admin/signed-contracts",
    icon: FileCheck,
  },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "QA Tests", href: "/qa-tests", icon: FlaskConical },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-zinc-50 to-slate-50 overflow-x-hidden">
      <AdminSidebar />
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
        items={ADMIN_NAV_ITEMS}
        subtitle="Admin Control"
      />

      <div className="flex flex-1 flex-col min-w-0">
        <AdminTopBar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-6 md:p-10 lg:p-12 max-w-[1200px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
