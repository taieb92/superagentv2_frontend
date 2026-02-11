"use client";

import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export function PublicNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-20 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 md:px-10">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-none bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-200 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-zinc-900 tracking-tight leading-none">
              SuperAgent
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
              Real Estate AI
            </span>
          </div>
        </Link>

        {/* NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-10">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-900 hover:text-zinc-500 transition-colors"
          >
            Home
          </Link>
          <Link
            href="#about"
            className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            About Us
          </Link>
          <Link
            href="#contact"
            className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* AUTH ACTIONS */}
        <div className="flex items-center gap-2 sm:gap-4">
          <SignInButton mode="modal">
            <Button className="h-11 px-6 bg-white text-zinc-900 border border-zinc-200 hover:bg-[#0F766E] hover:border-[#0F766E] shadow-xl hover:scale-105 transition-all active:scale-95 text-sm font-bold group">
              <span className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] bg-clip-text text-transparent group-hover:text-white group-hover:bg-none">
                Sign in
              </span>
            </Button>
          </SignInButton>
        </div>
      </div>
    </header>
  );
}
