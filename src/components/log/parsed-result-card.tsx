"use client";

import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export interface ParsedLogResult {
  totalCarbon: number;
  categoryMatches: {
    transport: { mode?: string; distanceKm?: number; carbon?: number; [key: string]: unknown }[];
    food: { type?: string; servings?: number; carbon?: number; [key: string]: unknown }[];
    electricity: { type?: string; hours?: number; carbon?: number; [key: string]: unknown }[];
    shopping: { category?: string; count?: number; carbon?: number; [key: string]: unknown }[];
  };
}

export interface ParsedResultCardProps {
  parsedResult: ParsedLogResult;
  loading: boolean;
  onDiscard: () => void;
  onCommit: () => void;
}

export function ParsedResultCard({ parsedResult, loading, onDiscard, onCommit }: ParsedResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
      role="region"
      aria-label="AI Parsing Breakdown"
    >
      <GlassCard glowColor="rgba(16, 185, 129, 0.15)" className="p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-white/[0.06] pb-4">
          <Sparkles className="h-4.5 w-4.5 text-emerald-400 fill-current" aria-hidden="true" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-200">AI Compiler Breakdown</h2>
        </div>

        {/* Parsed list grid */}
        <ul className="space-y-4">
          {(parsedResult.categoryMatches.transport || []).map((item) => (
            <li key={`trans-${item.mode}-${item.distanceKm}-${item.carbon}`} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/[0.04]">
              <div>
                <span className="text-xs font-semibold text-zinc-200">Transit: {item.mode}</span>
                <p className="text-[10px] text-zinc-500 mt-0.5">{item.distanceKm} km traveled</p>
              </div>
              <span className="text-xs font-bold font-mono text-zinc-300">+{item.carbon} kg CO2</span>
            </li>
          ))}

          {(parsedResult.categoryMatches.food || []).map((item) => (
            <li key={`food-${item.type}-${item.servings}-${item.carbon}`} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/[0.04]">
              <div>
                <span className="text-xs font-semibold text-zinc-200">Diet: {item.type}</span>
                <p className="text-[10px] text-zinc-500 mt-0.5">{item.servings} serving(s)</p>
              </div>
              <span className="text-xs font-bold font-mono text-zinc-300">+{item.carbon} kg CO2</span>
            </li>
          ))}

          {(parsedResult.categoryMatches.electricity || []).map((item) => (
            <li key={`elec-${item.type}-${item.hours}-${item.carbon}`} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/[0.04]">
              <div>
                <span className="text-xs font-semibold text-zinc-200">Utility: {item.type}</span>
                <p className="text-[10px] text-zinc-500 mt-0.5">{item.hours} hours running</p>
              </div>
              <span className="text-xs font-bold font-mono text-zinc-300">+{item.carbon} kg CO2</span>
            </li>
          ))}

          {(parsedResult.categoryMatches.shopping || []).map((item) => (
            <li key={`shop-${item.category}-${item.count}-${item.carbon}`} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/[0.04]">
              <div>
                <span className="text-xs font-semibold text-zinc-200">Purchase: {item.category}</span>
                <p className="text-[10px] text-zinc-500 mt-0.5">{item.count} item(s)</p>
              </div>
              <span className="text-xs font-bold font-mono text-zinc-300">+{item.carbon} kg CO2</span>
            </li>
          ))}

          {(!parsedResult.categoryMatches.transport?.length && !parsedResult.categoryMatches.food?.length && !parsedResult.categoryMatches.electricity?.length && !parsedResult.categoryMatches.shopping?.length) && (
            <p className="text-xs text-zinc-500 py-2">No matching carbon activities found in your text.</p>
          )}
        </ul>

        {/* Aggregated Total */}
        <div className="mt-6 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Estimated Carbon Footprint</h3>
            <span className="text-xl font-bold font-mono text-white block mt-0.5">
              {parsedResult.totalCarbon} kg CO2
            </span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={onDiscard} className="h-10 flex-1 sm:flex-none" aria-label="Discard log">
              <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
              <span>Discard</span>
            </Button>
            <Button onClick={onCommit} className="h-10 flex-1 sm:flex-none" disabled={loading} aria-label="Log these habits">
              <Check className="h-4 w-4 mr-2" aria-hidden="true" />
              <span>Log Habits</span>
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
