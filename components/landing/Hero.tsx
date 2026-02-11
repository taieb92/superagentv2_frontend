"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { VoiceWaveform } from "./VoiceWaveform";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#FAFAF8]">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAFAF8] via-[#F5F5F3] to-[#EFEDE8]" />

      {/* Decorative elements */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-[#D97642]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#0A1628]/5 rounded-full blur-[100px]" />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10 py-32 lg:py-40 w-full">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-20 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-[#0A1628]/5 rounded-full border border-[#0A1628]/10"
            >
              <span className="w-2 h-2 rounded-full bg-[#D97642] animate-pulse" />
              <span className="font-[family-name:var(--font-body)] text-sm font-medium text-[#5C5B58]">
                Built for U.S. Real Estate Professionals
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="font-[family-name:var(--font-display)] text-[48px] sm:text-[56px] md:text-[72px] lg:text-[80px] leading-[1.05] text-[#0A1628] tracking-tight"
            >
              Your Voice.
              <br />
              <span className="text-[#D97642]">Perfect Contracts.</span>
              <br />
              Every Time.
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 max-w-[540px] font-[family-name:var(--font-body)] text-lg md:text-xl leading-relaxed text-[#5C5B58]"
            >
              AI-powered voice assistant that fills Purchase Contracts and Buyer Broker
              Agreements while you talk. Built for U.S. real estate agents.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/request-access"
                className="group inline-flex items-center justify-center gap-2 h-14 px-8 font-[family-name:var(--font-body)] text-base font-semibold text-white bg-[#0A1628] rounded-full hover:bg-[#1a2332] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#0A1628]/20"
              >
                Request Early Access
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/book-demo"
                className="group inline-flex items-center justify-center gap-2 h-14 px-8 font-[family-name:var(--font-body)] text-base font-semibold text-[#0A1628] border-2 border-[#0A1628]/20 rounded-full hover:border-[#0A1628]/40 hover:bg-[#0A1628]/5 transition-all duration-300"
              >
                <Play size={16} className="fill-current" />
                Watch Demo
              </Link>
            </motion.div>
          </motion.div>

          {/* Right: Voice Interface Preview */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            {/* Main card */}
            <div className="relative bg-white rounded-3xl border border-[#0A1628]/10 shadow-2xl shadow-[#0A1628]/10 overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#0A1628]/5 bg-[#FAFAF8]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#E5E5E3]" />
                    <span className="w-3 h-3 rounded-full bg-[#E5E5E3]" />
                    <span className="w-3 h-3 rounded-full bg-[#E5E5E3]" />
                  </div>
                  <span className="font-[family-name:var(--font-body)] text-sm font-medium text-[#5C5B58]">
                    Live Contract Session
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-[#D97642] opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#D97642]" />
                  </span>
                  <span className="font-[family-name:var(--font-body)] text-xs font-medium text-[#D97642]">
                    Recording
                  </span>
                </div>
              </div>

              {/* Voice interface */}
              <div className="p-8">
                <div className="text-center mb-6">
                  <p className="font-[family-name:var(--font-body)] text-sm text-[#8B8A87] mb-2">
                    AI is listening...
                  </p>
                  <VoiceWaveform />
                </div>

                {/* Transcript */}
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-[#FAFAF8] rounded-xl">
                    <p className="font-[family-name:var(--font-body)] text-sm text-[#5C5B58] leading-relaxed">
                      "...the property at <span className="text-[#0A1628] font-medium">4521 East Desert Vista Trail</span>,
                      Scottsdale. Purchase price is <span className="text-[#0A1628] font-medium">$875,000</span>,
                      earnest money <span className="text-[#0A1628] font-medium">$20,000</span>..."
                    </p>
                  </div>
                </div>

                {/* Auto-filled fields */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#D97642]/5 rounded-lg border border-[#D97642]/20">
                    <span className="font-[family-name:var(--font-body)] text-xs font-medium text-[#8B8A87]">
                      Property Address
                    </span>
                    <span className="font-[family-name:var(--font-body)] text-sm font-medium text-[#0A1628]">
                      4521 E Desert Vista Trail
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#D97642]/5 rounded-lg border border-[#D97642]/20">
                    <span className="font-[family-name:var(--font-body)] text-xs font-medium text-[#8B8A87]">
                      Purchase Price
                    </span>
                    <span className="font-[family-name:var(--font-body)] text-sm font-medium text-[#0A1628]">
                      $875,000
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0A1628]/5 rounded-lg border border-[#0A1628]/10">
                    <span className="font-[family-name:var(--font-body)] text-xs font-medium text-[#8B8A87]">
                      Earnest Money
                    </span>
                    <span className="font-[family-name:var(--font-body)] text-sm font-medium text-[#0A1628]">
                      $20,000
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="absolute -bottom-4 -left-4 px-4 py-2 bg-white rounded-full border border-[#0A1628]/10 shadow-lg"
            >
              <span className="font-[family-name:var(--font-body)] text-sm font-medium text-[#0A1628]">
                32 fields auto-filled
              </span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
