"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 md:py-32 bg-[#FAFAF8] relative overflow-hidden" ref={ref}>
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#D97642]/5 rounded-full blur-[120px]" />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="font-[family-name:var(--font-display)] text-[40px] md:text-[56px] lg:text-[64px] leading-[1.05] text-[#0A1628] tracking-tight mb-8">
            Stop Losing Hours to
            <br />
            <span className="text-[#D97642]">Contract Paperwork</span>
          </h2>

          <p className="font-[family-name:var(--font-body)] text-lg md:text-xl leading-relaxed text-[#5C5B58] mb-12 max-w-2xl mx-auto">
            Join 500+ agents getting early access to SuperAgent.
            Start closing deals faster, without the paperwork.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/request-access"
              className="group inline-flex items-center justify-center gap-2 h-16 px-10 font-[family-name:var(--font-body)] text-lg font-semibold text-white bg-[#0A1628] rounded-full hover:bg-[#1a2332] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-[#0A1628]/20 w-full sm:w-auto"
            >
              Request Early Access
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/book-demo"
              className="inline-flex items-center justify-center gap-2 h-16 px-10 font-[family-name:var(--font-body)] text-lg font-semibold text-[#0A1628] border-2 border-[#0A1628]/20 rounded-full hover:border-[#0A1628]/40 hover:bg-[#0A1628]/5 transition-all duration-300 w-full sm:w-auto"
            >
              Schedule a Demo
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
