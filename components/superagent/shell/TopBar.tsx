"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Bell, Menu } from "lucide-react";

function ClerkAuthSection() {
  const hasClerkKey = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!hasClerkKey) {
    return (
      <div className="flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="inline-flex h-10 w-10 items-center justify-center border border-black/5 bg-white shadow-sm transition-shadow hover:shadow"
        >
          <Bell className="h-4 w-4 text-zinc-700" />
        </button>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </SignInButton>
        </div>
      </SignedOut>
    </>
  );
}

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-zinc-200 bg-white w-full">
      <div className="flex h-full items-center gap-4 px-6 md:px-10 lg:px-16 w-full">
        {onMenuClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden h-10 w-10 text-zinc-500 hover:text-zinc-900"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1 max-w-xl">
          <Input
            aria-label="Global search"
            placeholder="Search…"
            className="h-10 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors hidden md:flex w-full"
          />
        </div>
        <div className="ml-auto">
          <ClerkAuthSection />
        </div>
      </div>
    </header>
  );
}
