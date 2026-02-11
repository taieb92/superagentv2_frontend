"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Users, Building2, Star } from "lucide-react";

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const stats = [
  {
    icon: Users,
    value: 500,
    suffix: "+",
    label: "Agents on the Waitlist",
  },
  {
    icon: Building2,
    value: 12,
    suffix: "",
    label: "Brokerages in Pilot",
  },
  {
    icon: Star,
    value: 98,
    suffix: "%",
    label: "Accuracy Rate",
  },
];

export function SocialProofSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 md:py-28 bg-white" ref={ref}>
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-[family-name:var(--font-display)] text-[32px] md:text-[40px] leading-[1.1] text-[#0A1628] tracking-tight">
            Trusted by Top Agents Nationwide
          </h2>
        </motion.div>

        <div className="grid grid-cols-3 gap-8 md:gap-16">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-xl bg-[#D97642]/10">
                <stat.icon size={22} className="text-[#D97642]" />
              </div>
              <div className="font-[family-name:var(--font-display)] text-[48px] md:text-[64px] leading-none text-[#0A1628] tracking-tight">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-2 font-[family-name:var(--font-body)] text-sm md:text-base text-[#5C5B58]">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="font-[family-name:var(--font-body)] text-sm text-[#5C5B58]">
            Designed in collaboration with licensed real estate professionals
          </p>
        </motion.div>
      </div>
    </section>
  );
}
