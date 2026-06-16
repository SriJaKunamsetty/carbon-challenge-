"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Sparkles,
  Leaf,
  TrendingDown,
  MessageSquareCode,
  ShieldCheck,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: <Sparkles className="h-5 w-5 text-emerald-400" />,
    title: "AI Daily Log",
    description: "Describe your day in natural text. Our advanced parser translates inputs into structured carbon categories."
  },
  {
    icon: <Leaf className="h-5 w-5 text-blue-400" />,
    title: "Carbon Digital Twin",
    description: "A flagship simulator that mirrors your lifestyle. Test virtual swaps (solar panels, EV, diet changes) to see projected offsets."
  },
  {
    icon: <MessageSquareCode className="h-5 w-5 text-violet-400" />,
    title: "AI Sustainability Coach",
    description: "Get customized daily tips, local utility advice, and responsive feedback from a specialized sustainability chatbot."
  },
  {
    icon: <TrendingDown className="h-5 w-5 text-amber-400" />,
    title: "Beautiful Analytics",
    description: "Interactive animated Area, Bar, and Donut SVG graphs that track your carbon performance dynamically without performance bloat."
  },
  {
    icon: <Zap className="h-5 w-5 text-teal-400" />,
    title: "Streak Gamification",
    description: "Earn Eco XP, complete daily habits logging streaks, level up your profile rank, and unlock collectible badges."
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-red-400" />,
    title: "Audited Enterprise Vault",
    description: "Secure user ownership access, input sanitization rules, and full JSON data portability exports protect your metadata."
  }
];

export function FeaturesGrid() {
  return (
    <section id="features" className="px-6 md:px-12 py-24 max-w-7xl mx-auto space-y-16">
      <div className="text-center max-w-xl mx-auto">
        <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-emerald-400">Core Features</span>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-3 font-display">
          Enterprise Footprint Intelligence
        </h2>
        <p className="text-xs text-zinc-500 mt-1 leading-normal">
          A comprehensive set of tools to track, analyze, simulate and reduce your environmental footprint.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <GlassCard key={f.title} className="p-6 space-y-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-zinc-950/60 border border-white/[0.08] flex items-center justify-center shrink-0">
              {f.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">{f.title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed mt-2">{f.description}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}
