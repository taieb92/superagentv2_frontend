"use client";

import { motion } from "framer-motion";

export function AmbientCanvas() {
  return (
    <div className="relative h-full overflow-hidden border border-black/5 bg-white shadow-sm">
      {/* Animated gradient layer */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        animate={{
          backgroundPosition: ["0% 0%", "100% 50%", "0% 100%"],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          backgroundImage:
            "radial-gradient(600px circle at 20% 20%, rgba(59,130,246,0.16), transparent 55%), radial-gradient(520px circle at 80% 30%, rgba(16,185,129,0.12), transparent 55%), radial-gradient(520px circle at 40% 90%, rgba(99,102,241,0.10), transparent 55%)",
          backgroundSize: "140% 140%",
          backgroundPosition: "0% 0%",
        }}
      />
      {/* Subtle noise overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.06] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='n' x='0' y='0'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/></filter><rect width='400' height='400' filter='url(%23n)' opacity='0.25'/></svg>")`,
        }}
      />
      <div className="relative h-full p-6">
        <div className="text-xs text-zinc-500"></div>
      </div>
    </div>
  );
}
