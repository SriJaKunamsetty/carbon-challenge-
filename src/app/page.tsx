"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { FaqSection } from "@/components/landing/faq-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function LandingPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-black text-zinc-100 flex flex-col overflow-hidden">
      {/* Aurora floating gradient lights */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none -z-10 motion-safe:animate-pulse" />
      <div className="absolute bottom-[10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none -z-10 motion-safe:animate-pulse" style={{ animationDuration: "8s" }} />

      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0a0a_1px,transparent_1px),linear-gradient(to_bottom,#0a0a0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] pointer-events-none -z-20" />

      {/* HEADER / NAVIGATION */}
      <header className="h-20 flex items-center justify-between px-6 md:px-12 border-b border-white/[0.04] bg-black/40 backdrop-blur-md relative z-30 shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-sm shadow-[0_0_15px_rgba(16,185,129,0.08)] font-display font-bold">
            CM
          </div>
          <span className="font-bold text-sm tracking-tight text-white">CarbonMind AI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide text-zinc-400">
          <a href="#features" className="hover:text-zinc-200 transition-colors">Features</a>
          <a href="#simulator" className="hover:text-zinc-200 transition-colors">Simulator</a>
          <a href="#faq" className="hover:text-zinc-200 transition-colors">FAQ</a>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <Link href="/dashboard">
              <Button size="sm">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors px-3 py-2">
                Sign In
              </Link>
              <Link href="/login">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          className="md:hidden w-8 h-8 rounded-lg border border-white/[0.08] flex items-center justify-center text-zinc-400 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
        </button>
      </header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 right-0 z-20 bg-zinc-950 border-b border-white/[0.08] p-6 flex flex-col gap-4 text-center"
          >
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-300 hover:text-white">Features</a>
            <a href="#simulator" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-300 hover:text-white">Simulator</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-zinc-300 hover:text-white">FAQ</a>
            <div className="h-[1px] bg-white/[0.06] my-2" />
            {user ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Dashboard</Button>
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <main className="flex-grow overflow-y-auto">
        {/* HERO SECTION */}
        <HeroSection isLoggedIn={!!user} />

        {/* PLATFORM STATISTICS */}
        <section className="border-y border-white/[0.04] bg-zinc-950/20 py-12">
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <span className="text-3xl font-bold font-mono tracking-tight text-white">42,840 kg</span>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1">Carbon Saved Monthly</p>
            </div>
            <div>
              <span className="text-3xl font-bold font-mono tracking-tight text-white">82%</span>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1">Avg Score Improvement</p>
            </div>
            <div>
              <span className="text-3xl font-bold font-mono tracking-tight text-white">12,000+</span>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1">Daily Habits Logs</p>
            </div>
            <div>
              <span className="text-3xl font-bold font-mono tracking-tight text-white">99.8%</span>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1">Uptime SLA Reliability</p>
            </div>
          </div>
        </section>

        {/* FEATURES CATALOG */}
        <FeaturesGrid />

        {/* INTERACTIVE TIMELINE / HOW IT WORKS */}
        <section className="bg-zinc-950/10 border-t border-white/[0.04] py-24 px-6 md:px-12">
          <div className="max-w-7xl mx-auto space-y-16 text-center">
            <div className="max-w-xl mx-auto">
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-emerald-400">How it works</span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-3 font-display">Three Steps to Carbon Freedom</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto relative">
              {/* Connector line for desktop */}
              <div className="hidden md:block absolute top-10 left-32 right-32 h-[1px] bg-white/[0.06] -z-10" />

              <div className="space-y-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold font-mono">1</div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Describe Habits</h3>
                <p className="text-xs text-zinc-500 leading-normal">
                  Write down daily habits in plain text (e.g. travel, AC, food servings). Our AI processes it automatically.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold font-mono">2</div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Analyze &amp; Score</h3>
                <p className="text-xs text-zinc-500 leading-normal">
                  Track dynamic metrics, scores, and weekly trends rendered on beautiful, light SVG dashboard graphs.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center text-xs font-bold font-mono">3</div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Simulate &amp; Reduce</h3>
                <p className="text-xs text-zinc-500 leading-normal">
                  Adjust sliders in your Digital Twin simulator to test changes (EV, solar) and earn points as you improve.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ACCORDION FAQ SECTION */}
        <FaqSection />
      </main>

      {/* FOOTER */}
      <LandingFooter />
    </div>
  );
}
