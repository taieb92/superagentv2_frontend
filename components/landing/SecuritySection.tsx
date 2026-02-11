"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Lock, FileSearch, Settings, Database } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "You Own Your Data",
    description: "Your contracts, your clients, your information. We never share or sell your data.",
  },
  {
    icon: FileSearch,
    title: "Full Audit Trail",
    description: "Every change tracked per contract. Know exactly who did what and when.",
  },
  {
    icon: Settings,
    title: "Admin-Controlled Templates",
    description: "Brokers control templates and defaults. Agents work within guardrails.",
  },
  {
    icon: Database,
    title: "No Training on Private Data",
    description: "Your contracts are not used to train our AI. Your business stays private.",
  },
];

export function SecuritySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="security" className="py-24 md:py-32 bg-[#0A1628] scroll-mt-20" ref={ref}>
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-[#D97642]/20">
            <Shield size={32} className="text-[#D97642]" />
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-[36px] md:text-[48px] leading-[1.1] text-white tracking-tight mb-6">
            Security & Control
          </h2>
          <p className="font-[family-name:var(--font-body)] text-lg text-white/60">
            Built to be production-grade, not a demo toy.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 mb-5 rounded-xl bg-white/10">
                <feature.icon size={22} className="text-[#D97642]" />
              </div>
              <h3 className="font-[family-name:var(--font-body)] text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="font-[family-name:var(--font-body)] text-sm leading-relaxed text-white/60">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
