"use client";

import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "How does the AI compiler calculate my carbon footprint?",
    a: "The compiler scans your text input for distance keywords, diet categories, and AC usage metrics. It maps these parameters to global standard emission coefficients from our modular carbon engine."
  },
  {
    q: "Can I use CarbonMind AI for free?",
    a: "Yes! The core tracking, AI digital twin simulator, and dashboard are completely free. We also support local guest Demo mode for immediate testing."
  },
  {
    q: "Is my personal data secure?",
    a: "Absolutely. All authentication is verified via Firebase Security modules. User data is isolated under Cloud Firestore rules with strict ownership verification."
  },
  {
    q: "Can I export my tracking history?",
    a: "Yes, we support full data portability. You can download your complete profile details and logged carbon records in standard JSON format from the Settings panel."
  }
];

export function FaqSection() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="px-6 md:px-12 py-24 max-w-3xl mx-auto space-y-12 text-center">
      <div className="space-y-3">
        <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-emerald-400">FAQ</span>
        <h2 className="text-2xl font-bold tracking-tight text-white font-display">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-4 text-left">
        {faqs.map((faq, idx) => {
          const isOpen = faqOpen === idx;
          return (
            <GlassCard
              key={faq.q}
              className="p-5 cursor-pointer select-none"
              onClick={() => setFaqOpen(isOpen ? null : idx)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-200">{faq.q}</h3>
                <span className={`text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                  v
                </span>
              </div>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-zinc-400 leading-relaxed mt-3 pt-3 border-t border-white/[0.04]">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}
