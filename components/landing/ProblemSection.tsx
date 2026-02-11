"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Clock, RefreshCw, Moon, AlertTriangle } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "3-5 Hours Per Contract",
    description: "Data entry, formatting, double-checking, fixing mistakes. Time you could spend with clients.",
  },
  {
    icon: RefreshCw,
    title: "Repeated Information",
    description: "Type the same details across Purchase, BBA, and Addenda. Again and again.",
  },
  {
    icon: Moon,
    title: "Late Night Paperwork",
    description: "Great calls end. Then hours at your desk filling forms while life passes by.",
  },
  {
    icon: AlertTriangle,
    title: "Costly Mistakes",
    description: "One missed field can delay closing or kill a deal. The pressure is always there.",
  },
];

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 md:py-32 bg-[#0A1628]" ref={ref}>
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mb-16"
        >
          <h2 className="font-[family-name:var(--font-display)] text-[36px] md:text-[48px] leading-[1.1] text-white tracking-tight">
            The Hidden Cost of
            <br />
            <span className="text-[#D97642]">Manual Contracts</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="group p-8 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 mb-6 rounded-xl bg-[#D97642]/20">
                <problem.icon size={24} className="text-[#D97642]" />
              </div>
              <h3 className="font-[family-name:var(--font-body)] text-xl font-semibold text-white mb-3">
                {problem.title}
              </h3>
              <p className="font-[family-name:var(--font-body)] text-base leading-relaxed text-white/60">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <p className="font-[family-name:var(--font-display)] text-[28px] md:text-[36px] leading-[1.2] text-white/90">
            "Real estate shouldn't run on
            <br />
            <span className="text-[#D97642]">calls + PDFs + manual work.</span>"
          </p>
        </motion.div>
      </div>
    </section>
  );
}
