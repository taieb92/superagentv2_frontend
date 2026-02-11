"use client";

import Link from "next/link";
import { Linkedin, Twitter } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 md:py-16 bg-[#0A1628]">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-xl text-white hover:opacity-80 transition-opacity"
            >
              SuperAgent
            </Link>
            <p className="font-[family-name:var(--font-body)] text-sm text-white/40">
              &copy; {currentYear} SuperAgent. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-8" aria-label="Footer navigation">
            <Link
              href="#"
              className="font-[family-name:var(--font-body)] text-sm text-white/60 hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="font-[family-name:var(--font-body)] text-sm text-white/60 hover:text-white transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="font-[family-name:var(--font-body)] text-sm text-white/60 hover:text-white transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} className="text-white" />
            </a>
            <a
              href="#"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={18} className="text-white" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
