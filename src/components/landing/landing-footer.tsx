"use client";

import React from "react";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.04] bg-zinc-950/40 py-12 px-6 md:px-12 text-center shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="text-lg">CM</span>
          <span className="font-bold text-xs tracking-wider text-zinc-300 uppercase">CarbonMind AI</span>
        </div>

        <span className="text-[10px] text-zinc-600 font-mono">
          Copyright 2026 CarbonMind AI. Made with Google Cloud and Firebase Web SDKs. All rights reserved.
        </span>

        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500">
          <a href="#features" className="hover:text-zinc-300">Features</a>
          <a href="#simulator" className="hover:text-zinc-300">Simulator</a>
          <a href="#faq" className="hover:text-zinc-300">FAQ</a>
        </div>
      </div>
    </footer>
  );
}
