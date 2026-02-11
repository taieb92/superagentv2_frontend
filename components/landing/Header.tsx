"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#how-it-works", label: "How it Works" },
  { href: "#features", label: "Features" },
  { href: "#who-its-for", label: "Who It's For" },
  { href: "#security", label: "Security" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-[#FAFAF8]/80 backdrop-blur-xl border-b border-[#0A1628]/5 shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav
        className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4 lg:px-10"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-2xl text-[#0A1628] tracking-tight hover:opacity-80 transition-opacity"
        >
          SuperAgent
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="font-[family-name:var(--font-body)] text-[15px] font-medium text-[#5C5B58] hover:text-[#0A1628] transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D97642] transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/book-demo"
            className="font-[family-name:var(--font-body)] text-[15px] font-medium text-[#5C5B58] hover:text-[#0A1628] transition-colors"
          >
            Book a Demo
          </Link>
          <SignInButton mode="modal">
            <Button className="h-11 px-6 bg-white text-[#0A1628] border border-[#0A1628]/20 hover:bg-[#0A1628] hover:text-white shadow-sm hover:scale-[1.02] transition-all active:scale-[0.98] text-sm font-semibold rounded-full">
              Sign in
            </Button>
          </SignInButton>
          <Link
            href="/request-access"
            className="inline-flex items-center justify-center h-11 px-6 font-[family-name:var(--font-body)] text-[15px] font-semibold text-white bg-[#0A1628] rounded-full hover:bg-[#1a2332] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Request Access
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="lg:hidden p-2 -mr-2 text-[#0A1628]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-[#FAFAF8] border-b border-[#0A1628]/5"
          >
            <div className="px-6 py-6 space-y-6">
              <ul className="space-y-4">
                {navLinks.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <a
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="block font-[family-name:var(--font-body)] text-lg font-medium text-[#0A1628]"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              <div className="flex flex-col gap-3 pt-4 border-t border-[#0A1628]/10">
                <Link
                  href="/book-demo"
                  className="inline-flex items-center justify-center h-12 px-6 font-[family-name:var(--font-body)] text-[15px] font-medium text-[#0A1628] border border-[#0A1628]/20 rounded-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Book a Demo
                </Link>
                <SignInButton mode="modal">
                  <Button
                    className="w-full h-12 px-6 bg-white text-[#0A1628] border border-[#0A1628]/20 hover:bg-[#0A1628] hover:text-white text-sm font-semibold rounded-full"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign in
                  </Button>
                </SignInButton>
                <Link
                  href="/request-access"
                  className="inline-flex items-center justify-center h-12 px-6 font-[family-name:var(--font-body)] text-[15px] font-semibold text-white bg-[#0A1628] rounded-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Request Access
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
