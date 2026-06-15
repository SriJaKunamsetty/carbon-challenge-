"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";

export interface AiRecommendation {
  title: string;
  description: string;
  potentialSaving: string;
  cta: string;
}

export interface QuickActionsProps {
  aiRecommendation: AiRecommendation;
  climbers: { userId: string; name: string; points: number }[];
}

function getClimberRankColor(idx: number): string {
  if (idx === 0) return "text-yellow-500";
  if (idx === 1) return "text-zinc-400";
  if (idx === 2) return "text-amber-600";
  return "text-zinc-500";
}

export function QuickActions({ aiRecommendation, climbers }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* AI Insight Card */}
      <GlassCard className="lg:col-span-2" glowColor="rgba(16, 185, 129, 0.2)">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-200">AI Coach Recommendation</h2>
        </div>
        <h3 className="text-sm font-semibold text-zinc-100">{aiRecommendation.title}</h3>
        <p className="text-xs text-zinc-400 mt-2 leading-relaxed">{aiRecommendation.description}</p>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.06]">
          <span className="text-[10px] text-zinc-500">Potential Savings: <strong className="text-emerald-400 font-mono">{aiRecommendation.potentialSaving}</strong></span>
          <Link href="/dashboard/twin" className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold hover:text-emerald-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded p-1 -m-1">
            <span>{aiRecommendation.cta}</span>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </GlassCard>

      {/* Global Leaderboard Snippet */}
      <GlassCard>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Top Climbers</h2>
          <Link href="/dashboard/leaderboard" className="text-[10px] font-bold text-zinc-400 hover:text-zinc-200 flex items-center gap-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded p-1 -m-1">
            <span>View All</span>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>

        <ul className="space-y-3">
          {climbers.length > 0 ? climbers.map((climber, idx) => (
            <li
              key={climber.userId}
              className={`flex items-center justify-between p-2 rounded-xl border transition-all ${
                idx === 0
                  ? "bg-white/5 border-white/[0.06]"
                  : "bg-transparent border-transparent"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono font-bold w-4 text-center ${getClimberRankColor(idx)}`} aria-hidden="true">
                  #{idx + 1}
                </span>
                <span className="text-xs font-medium text-zinc-300">{climber.name}</span>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-bold" aria-label={`${climber.points} experience points`}>
                {climber.points} XP
              </span>
            </li>
          )) : (
            <li className="text-xs text-zinc-500 text-center py-4">No ranked users yet.</li>
          )}
        </ul>
      </GlassCard>
    </div>
  );
}
