"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X } from "lucide-react";

const comparisons = [
  {
    other: "Generic AI chatbots adapted for real estate",
    superagent: "Voice-first, natural conversation designed for agents",
  },
  {
    other: "Form-first data entry",
    superagent: "Conversation-first, forms fill automatically",
  },
  {
    other: "Hardcoded fields that can't adapt",
    superagent: "Schema-driven, admin-controlled templates",
  },
  {
    other: "Guesses information based on patterns",
    superagent: "Deterministic, sourced data you can trust",
  },
  {
    other: "Multiple disconnected systems",
    superagent: "One integrated workspace for everything",
  },
];

export function DifferenceSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 md:py-32 bg-white" ref={ref}>
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-[family-name:var(--font-display)] text-[36px] md:text-[48px] leading-[1.1] text-[#0A1628] tracking-tight mb-6">
            Not Another AI Tool.
            <br />
            <span className="text-[#D97642]">Built FOR Real Estate.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="overflow-hidden rounded-3xl border border-[#0A1628]/10"
        >
          {/* Headers */}
          <div className="grid grid-cols-2">
            <div className="p-6 md:p-8 bg-[#0A1628]/5 border-b border-r border-[#0A1628]/10">
              <h3 className="font-[family-name:var(--font-body)] text-lg font-semibold text-[#5C5B58]">
                Other Tools
              </h3>
            </div>
            <div className="p-6 md:p-8 bg-[#D97642]/5 border-b border-[#D97642]/20">
              <h3 className="font-[family-name:var(--font-body)] text-lg font-semibold text-[#D97642]">
                SuperAgent
              </h3>
            </div>
          </div>

          {/* Rows */}
          {comparisons.map((comparison, index) => (
            <div
              key={index}
              className={`grid grid-cols-2 ${
                index !== comparisons.length - 1 ? "border-b border-[#0A1628]/10" : ""
              }`}
            >
              <div className="p-6 md:p-8 border-r border-[#0A1628]/10 bg-white">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0A1628]/10 shrink-0 mt-0.5">
                    <X size={14} className="text-[#5C5B58]" />
                  </div>
                  <p className="font-[family-name:var(--font-body)] text-sm md:text-base text-[#5C5B58]">
                    {comparison.other}
                  </p>
                </div>
              </div>
              <div className="p-6 md:p-8 bg-[#D97642]/5">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#D97642] shrink-0 mt-0.5">
                    <Check size={14} className="text-white" />
                  </div>
                  <p className="font-[family-name:var(--font-body)] text-sm md:text-base text-[#0A1628] font-medium">
                    {comparison.superagent}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
