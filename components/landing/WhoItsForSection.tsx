"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Users, ShieldCheck, Zap } from "lucide-react";

const personas = [
  {
    icon: TrendingUp,
    title: "High-Volume Buyer Agents",
    subtitle: "Closing 3+ deals per month",
    quote: "I spend more time on contracts than with clients.",
    needs: ["Speed", "Consistency", "No repetitive work"],
  },
  {
    icon: Users,
    title: "Quality-Focused Teams",
    subtitle: "Maintaining compliance and professionalism",
    quote: "One mistake can cost us a relationship.",
    needs: ["Zero errors", "Clean handoffs", "Audit trails"],
  },
  {
    icon: ShieldCheck,
    title: "Growth-Minded Brokers",
    subtitle: "Scaling without sacrificing quality",
    quote: "Every agent does contracts differently.",
    needs: ["Standardization", "Template control", "Visibility"],
  },
];

export function WhoItsForSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="who-its-for" className="py-24 md:py-32 bg-[#FAFAF8] scroll-mt-20" ref={ref}>
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-[family-name:var(--font-display)] text-[36px] md:text-[48px] leading-[1.1] text-[#0A1628] tracking-tight mb-6">
            If You Write Contracts Every Week,
            <br />
            <span className="text-[#D97642]">This Is For You.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              className="group"
            >
              <div className="h-full p-8 bg-white rounded-2xl border border-[#0A1628]/10 hover:border-[#D97642]/30 hover:shadow-lg transition-all duration-300">
                {/* Icon */}
                <div className="flex items-center justify-center w-14 h-14 mb-6 rounded-2xl bg-[#0A1628]/5 group-hover:bg-[#D97642]/10 transition-colors duration-300">
                  <persona.icon size={26} className="text-[#0A1628] group-hover:text-[#D97642] transition-colors duration-300" />
                </div>

                {/* Title & Subtitle */}
                <h3 className="font-[family-name:var(--font-body)] text-xl font-semibold text-[#0A1628] mb-1">
                  {persona.title}
                </h3>
                <p className="font-[family-name:var(--font-body)] text-sm text-[#5C5B58] mb-6">
                  {persona.subtitle}
                </p>

                {/* Quote */}
                <blockquote className="relative pl-4 mb-6 border-l-2 border-[#D97642]">
                  <p className="font-[family-name:var(--font-display)] text-lg italic text-[#0A1628]/80">
                    "{persona.quote}"
                  </p>
                </blockquote>

                {/* Needs */}
                <div className="flex flex-wrap gap-2">
                  {persona.needs.map((need) => (
                    <span
                      key={need}
                      className="px-3 py-1 font-[family-name:var(--font-body)] text-xs font-medium text-[#5C5B58] bg-[#0A1628]/5 rounded-full"
                    >
                      {need}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
