"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Leaf,
  Globe,
  ArrowRight,
} from "lucide-react";

interface HeroSectionProps {
  readonly isLoggedIn: boolean;
}

export function HeroSection({ isLoggedIn }: HeroSectionProps) {
  return (
    <section className="px-6 md:px-12 py-24 md:py-32 flex flex-col lg:flex-row items-center gap-16 max-w-7xl mx-auto relative z-10">
      <div className="flex-1 space-y-6 text-center lg:text-left">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
          <Sparkles className="h-3 w-3 fill-current" />
          <span>Version 1.0 Live</span>
        </span>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display tracking-tight text-white leading-[1.05]">
          Understand Your Carbon. <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400">
            Shape Your Future.
          </span>
        </h1>

        <p className="text-sm md:text-base text-zinc-400 max-w-lg mx-auto lg:mx-0 leading-relaxed font-sans">
          An AI-powered carbon intelligence platform that translates your natural language logs into structured indices, runs twin simulations, and cuts your footprint.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
          <Link href={isLoggedIn ? "/dashboard" : "/login"}>
            <Button size="lg" className="w-full sm:w-auto flex items-center gap-2">
              <span>{isLoggedIn ? "Go to Dashboard" : "Get Started"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <a href="#simulator" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Live Demo
            </Button>
          </a>
        </div>
      </div>

      {/* Hero Visual globe */}
      <div className="flex-1 flex justify-center items-center relative w-full max-w-md aspect-square">
        {/* Spinning orbital rings */}
        <div className="absolute inset-0 rounded-full border border-emerald-500/10 motion-safe:animate-spin" style={{ animationDuration: "12s" }} />
        <div className="absolute inset-8 rounded-full border border-blue-500/10 motion-safe:animate-spin" style={{ animationDuration: "20s", animationDirection: "reverse" }} />
        
        {/* Glowing earth globe */}
        <div className="w-72 h-72 rounded-full bg-zinc-950 border border-white/[0.08] shadow-[0_0_80px_rgba(16,185,129,0.05)] flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/5 to-blue-500/5" />
          <Globe className="w-44 h-44 text-zinc-800 motion-safe:animate-pulse" />
          
          {/* Overlay indicators */}
          <div className="absolute top-1/4 right-8 bg-zinc-900/90 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur text-[9px] font-mono shadow-xl flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 motion-safe:animate-ping" />
            <span>AI Core Active</span>
          </div>

          <div className="absolute bottom-1/4 left-8 bg-zinc-900/90 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur text-[9px] font-mono shadow-xl flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulated Twin</span>
          </div>
        </div>
      </div>
    </section>
  );
}
