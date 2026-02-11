"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Mic, Zap, Send } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Mic,
    title: "Start a Voice Session",
    description: "No forms. No prep. Just talk like you're on a call with a client. SuperAgent understands context.",
  },
  {
    number: "02",
    icon: Zap,
    title: "AI Fills Your Contract",
    description: "MLS data pulled. State templates applied. Fields determined, not guessed. Watch it happen live.",
  },
  {
    number: "03",
    icon: Send,
    title: "Review & Send",
    description: "Edit like a real document. Send for signature. Done in minutes, not hours.",
  },
];

export function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-[#FAFAF8] scroll-mt-20" ref={ref}>
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <h2 className="font-[family-name:var(--font-display)] text-[36px] md:text-[48px] leading-[1.1] text-[#0A1628] tracking-tight mb-6">
            Talk. Review. Send.
            <br />
            <span className="text-[#D97642]">Done.</span>
          </h2>
          <p className="font-[family-name:var(--font-body)] text-lg md:text-xl leading-relaxed text-[#5C5B58]">
            SuperAgent listens during your calls, structures the information, and fills your
            contracts live — exactly the way agents already work.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-24 left-[16.67%] right-[16.67%] h-0.5 bg-gradient-to-r from-[#D97642]/20 via-[#D97642] to-[#D97642]/20" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.15 }}
              className="relative"
            >
              <div className="bg-white rounded-2xl border border-[#0A1628]/10 p-8 shadow-sm hover:shadow-lg transition-shadow duration-300">
                {/* Step number */}
                <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-full bg-[#D97642] relative z-10">
                  <span className="font-[family-name:var(--font-body)] text-sm font-bold text-white">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-[#0A1628]/5">
                  <step.icon size={28} className="text-[#0A1628]" />
                </div>

                <h3 className="font-[family-name:var(--font-body)] text-xl font-semibold text-[#0A1628] mb-3">
                  {step.title}
                </h3>
                <p className="font-[family-name:var(--font-body)] text-base leading-relaxed text-[#5C5B58]">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
