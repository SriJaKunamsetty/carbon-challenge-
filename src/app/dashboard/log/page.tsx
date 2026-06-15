"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { GlassCard } from "@/components/ui/glass-card";
import { Send, Check, Flame } from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import { db, getFirebaseAnalytics } from "@/lib/firebase";
import { logEvent } from "firebase/analytics";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { logger } from "@/lib/logger";

import { ParsedResultCard, type ParsedLogResult } from "@/components/log/parsed-result-card";

const LOG_CTX = { module: "DailyLogPage" };

export default function DailyLogPage() {
  const { profile } = useAuth();
  
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedLogResult | null>(null);
  const [commitSuccess, setCommitSuccess] = useState(false);

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setLoading(true); setCommitSuccess(false); setParsedResult(null);
    try {
      const response = await fetch("/api/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, mode: "parser", profile: { name: profile?.name, country: profile?.country } }),
      });
      const data = await response.json();
      const parsedLog = data.parsedResult ?? data;
      if (response.ok && parsedLog?.categoryMatches) { setParsedResult(parsedLog); }
      else { throw new Error(data.error || "Failed to parse log"); }
    } catch (error) {
      logger.error(LOG_CTX, "Failed to parse daily log", error);
    } finally { setLoading(false); }
  };

  const handleCommitLog = async () => {
    if (!parsedResult || !profile) return;
    setLoading(true);
    try {
      const logData = {
        userId: profile.uid, date: new Date().toISOString().split("T")[0],
        rawText: inputText, parsedItems: parsedResult.categoryMatches,
        totalCarbon: parsedResult.totalCarbon, createdAt: new Date(),
      };
      await addDoc(collection(db, "daily_logs"), logData);
      
      const actColRef = collection(db, "activities");
      for (const item of parsedResult.categoryMatches.transport || []) {
        await addDoc(actColRef, { userId: profile.uid, category: "transport", type: item.mode || "gasolineCar", value: item.distanceKm || 0, unit: "km", date: new Date(), note: `Via ${item.mode || "transport"}` });
      }
      for (const item of parsedResult.categoryMatches.food || []) {
        await addDoc(actColRef, { userId: profile.uid, category: "food", type: item.type || "poultry", value: item.servings || 0, unit: "servings", date: new Date(), note: `${item.type || "food"}` });
      }
      for (const item of parsedResult.categoryMatches.electricity || []) {
        await addDoc(actColRef, { userId: profile.uid, category: "electricity", type: item.type || "airConditioner", value: item.hours || 0, unit: "hours", date: new Date(), note: `${item.type || "electricity"}` });
      }
      for (const item of parsedResult.categoryMatches.shopping || []) {
        await addDoc(actColRef, { userId: profile.uid, category: "shopping", type: item.category || "misc", value: item.count || 0, unit: "items", date: new Date(), note: `${item.category || "shopping"}` });
      }

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ["#10B981", "#3B82F6", "#F59E0B"] });

      const analyticsInstance = getFirebaseAnalytics();
      if (analyticsInstance) {
        logEvent(analyticsInstance, "activity_logged", {
          total_carbon: parsedResult.totalCarbon,
          activity_count: (parsedResult.categoryMatches.transport?.length || 0) + (parsedResult.categoryMatches.food?.length || 0) +
                          (parsedResult.categoryMatches.electricity?.length || 0) + (parsedResult.categoryMatches.shopping?.length || 0),
        });
      }
      setCommitSuccess(true); setInputText(""); setParsedResult(null);
    } catch (error) {
      logger.error(LOG_CTX, "Failed to commit carbon log", error);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">AI Daily Log</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Type what you did today in simple words, and let our AI carbon compiler handle the math.</p>
      </div>

      <GlassCard className="p-6" role="region" aria-label="Habit Logging Form">
        <form onSubmit={handleParse} className="space-y-4">
          <label htmlFor="log-input" className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block font-mono">Describe Your Habits</label>
          <div className="relative">
            <textarea id="log-input" rows={3} value={inputText} onChange={(e) => setInputText(e.target.value)}
              placeholder="Example: 'I drove 15 km by car today, ate a beef steak for lunch, and had the AC running for 4 hours.'"
              className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-2xl py-3 pl-4 pr-12 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40 transition-all font-sans leading-relaxed resize-none"
              disabled={loading} aria-invalid={false} />
            <button type="submit" disabled={loading || !inputText.trim()}
              className="absolute right-3.5 bottom-3.5 w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              aria-label="Parse log entry">
              <Send className="h-4.5 w-4.5" aria-hidden="true" />
            </button>
          </div>
          <span className="text-[10px] text-zinc-500 block" id="log-hint">Tip: Mention distances (km/miles), food items (beef, chicken, greens), and AC hours.</span>
        </form>
      </GlassCard>

      <AnimatePresence>
        {commitSuccess && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-between"
            role="alert" aria-live="assertive">
            <div className="flex items-center gap-2">
              <Check className="h-4.5 w-4.5" aria-hidden="true" />
              <span>Activity successfully logged! You earned <strong className="font-bold">25 Eco XP</strong>.</span>
            </div>
            <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full text-[10px]">
              <Flame className="w-3 h-3 fill-current" aria-hidden="true" /><span>Streak Level Up!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {parsedResult && (
          <ParsedResultCard parsedResult={parsedResult} loading={loading}
            onDiscard={() => setParsedResult(null)} onCommit={handleCommitLog} />
        )}
      </AnimatePresence>
    </div>
  );
}
