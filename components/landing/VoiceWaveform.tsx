"use client";

import { motion } from "framer-motion";

interface VoiceWaveformProps {
  isActive?: boolean;
  className?: string;
}

export function VoiceWaveform({ isActive = true, className = "" }: VoiceWaveformProps) {
  const bars = [
    { height: 40, delay: 0 },
    { height: 60, delay: 0.1 },
    { height: 80, delay: 0.2 },
    { height: 55, delay: 0.15 },
    { height: 70, delay: 0.25 },
    { height: 45, delay: 0.05 },
    { height: 85, delay: 0.3 },
    { height: 50, delay: 0.12 },
    { height: 65, delay: 0.22 },
    { height: 40, delay: 0.08 },
    { height: 75, delay: 0.18 },
    { height: 55, delay: 0.28 },
  ];

  return (
    <div className={`flex items-center justify-center gap-1 h-24 ${className}`}>
      {bars.map((bar, index) => (
        <motion.div
          key={index}
          className="w-1.5 rounded-full bg-gradient-to-t from-[#D97642] to-[#E8956A]"
          initial={{ height: 8 }}
          animate={
            isActive
              ? {
                  height: [8, bar.height, 12, bar.height * 0.7, 8],
                  opacity: [0.5, 1, 0.7, 1, 0.5],
                }
              : { height: 8 }
          }
          transition={{
            duration: 1.5,
            delay: bar.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
