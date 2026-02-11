"use client";

import { cn } from "@/lib/utils";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      className={cn(
        "flex items-center space-x-1 text-sm text-zinc-500",
        className
      )}
      aria-label="Breadcrumb"
    >
      <Link
        href="/dashboard"
        className="flex items-center hover:text-zinc-700 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>

      {items.map((item, index) => (
        <div key={item.label} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />
          {item.current || !item.href ? (
            <span className="font-medium text-zinc-900" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-zinc-700 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

// Admin-specific breadcrumb component
export function AdminBreadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      className={cn(
        "flex items-center space-x-1 text-sm text-zinc-500",
        className
      )}
      aria-label="Breadcrumb"
    >
      <Link
        href="/admin/dashboard"
        className="flex items-center hover:text-zinc-700 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="sr-only">Admin Home</span>
      </Link>

      {items.map((item, index) => (
        <div key={item.label} className="flex items-center">
          {index > 0 && <ChevronRight className="w-4 h-4 mx-1 text-zinc-400" />}
          {item.current || !item.href ? (
            <span className="font-medium text-zinc-900" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-zinc-700 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
