"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Mic,
  FileText,
  Database,
  MapPin,
  User,
  Edit3,
  Shield,
  Send,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Voice-First Contract Creation",
    description: "Capture deal details naturally. AI understands context, not just keywords.",
    size: "large",
  },
  {
    icon: FileText,
    title: "Multi-Contract Support",
    description: "Purchase Contracts, BBAs, and Addenda. One system, all document types.",
    size: "medium",
  },
  {
    icon: Database,
    title: "MLS Integration",
    description: "Pull property data automatically. Never retype addresses again.",
    size: "medium",
  },
  {
    icon: MapPin,
    title: "State-Specific Templates",
    description: "Compliant forms for your state. MLS-aware and jurisdiction-ready.",
    size: "medium",
  },
  {
    icon: User,
    title: "Smart Defaults",
    description: "Agent profile and brokerage data pre-filled on every contract.",
    size: "small",
  },
  {
    icon: Edit3,
    title: "Live Editing",
    description: "Edit like a real PDF. Page-by-page review with full control.",
    size: "large",
  },
  {
    icon: Shield,
    title: "Deterministic Fields",
    description: "No AI hallucinations. Every field has a clear, traceable source.",
    size: "medium",
  },
  {
    icon: Send,
    title: "E-Signature Ready",
    description: "Send for review or signature. Seamless handoff to your workflow.",
    size: "small",
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24 md:py-32 bg-[#F5F5F3] scroll-mt-20" ref={ref}>
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-[family-name:var(--font-display)] text-[36px] md:text-[48px] leading-[1.1] text-[#0A1628] tracking-tight mb-6">
            Built for Real Estate.
            <br />
            <span className="text-[#D97642]">Not Adapted From Something Else.</span>
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {features.map((feature, index) => {
            const colSpan =
              feature.size === "large"
                ? "sm:col-span-2"
                : feature.size === "small"
                ? "sm:col-span-1"
                : "sm:col-span-1";

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + index * 0.08 }}
                className={`${colSpan} group`}
              >
                <div className="h-full p-6 md:p-8 bg-white rounded-2xl border border-[#0A1628]/5 hover:border-[#D97642]/30 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-center w-12 h-12 mb-5 rounded-xl bg-[#0A1628]/5 group-hover:bg-[#D97642]/10 transition-colors duration-300">
                    <feature.icon size={22} className="text-[#0A1628] group-hover:text-[#D97642] transition-colors duration-300" />
                  </div>
                  <h3 className="font-[family-name:var(--font-body)] text-lg font-semibold text-[#0A1628] mb-2">
                    {feature.title}
                  </h3>
                  <p className="font-[family-name:var(--font-body)] text-sm leading-relaxed text-[#5C5B58]">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
