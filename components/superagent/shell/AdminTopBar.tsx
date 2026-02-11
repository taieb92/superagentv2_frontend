"use client";

import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { Bell, Menu } from "lucide-react";
import { useEffect, useState } from "react";

export function AdminTopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-black/5 bg-white/70 px-6 backdrop-blur-xl md:px-10 supports-[backdrop-filter]:bg-white/60">
      <div className="flex flex-1 items-center gap-4">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden rounded-none h-10 w-10 border border-black/5 bg-white shadow-sm"
          >
            <Menu className="h-4 w-4 text-zinc-700" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          aria-label="Notifications"
          className="inline-flex size-9 items-center justify-center rounded-none border border-black/5 bg-white text-zinc-500 shadow-sm transition-shadow hover:text-zinc-900 hover:shadow"
        >
          <Bell className="size-4" />
        </button>
        <div className="h-6 w-px bg-zinc-200" />
        {isMounted && (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
        )}
        {!isMounted && (
          <div className="size-8 rounded-full bg-zinc-100" /> // Skeleton placeholder
        )}
      </div>
    </header>
  );
}
