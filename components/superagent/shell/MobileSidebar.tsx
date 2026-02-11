"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { LucideIcon, Sparkles, UserCircle, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export function MobileSidebar({
  isOpen,
  onOpenChange,
  items,
  title = "SuperAgent",
  subtitle = "Agent Mode",
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  items: NavItem[];
  title?: string;
  subtitle?: string;
}) {
  const pathname = usePathname();

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild>
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-black/5 shadow-2xl outline-none"
              >
                <div className="flex h-full flex-col">
                  <div className="flex h-20 items-center justify-between px-6 border-b border-black/5">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-zinc-900 rounded-none shadow-lg shadow-zinc-200/50">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <DialogPrimitive.Title className="text-sm font-bold text-zinc-900 tracking-tight leading-none">
                          {title}
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Description className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                          {subtitle}
                        </DialogPrimitive.Description>
                      </div>
                    </div>
                    <DialogPrimitive.Close asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-none h-10 w-10"
                      >
                        <X className="h-5 w-5 text-zinc-500" />
                      </Button>
                    </DialogPrimitive.Close>
                  </div>

                  <nav className="flex-1 space-y-2 px-4 py-8">
                    {items.map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" &&
                          pathname.startsWith(item.href));
                      const Icon = item.icon;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => onOpenChange(false)}
                          className={cn(
                            "group flex items-center gap-3 rounded-none px-4 py-4 text-sm font-medium transition-all duration-300",
                            isActive
                              ? "bg-white text-[#0F766E] shadow-md border-2 border-[#0F766E]"
                              : "text-[#0F766E] hover:bg-[#ECFDF5]"
                          )}
                        >
                          <Icon
                            className={cn(
                              "size-5",
                              isActive ? "text-[#0F766E]" : "text-[#0F766E]"
                            )}
                          />
                          <span className="flex-1">{item.label}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  <div className="p-6">
                    <div className="rounded-none bg-zinc-50 border border-black/[0.03] p-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-none bg-white border border-black/5 flex items-center justify-center">
                          <UserCircle className="h-5 w-5 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                            Logged in
                          </p>
                          <p className="text-xs font-semibold text-zinc-900">
                            User Identity
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
