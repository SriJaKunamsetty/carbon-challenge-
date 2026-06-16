"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { getSlideVariants } from "./step-personal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface StepDietProps {
  beefServings: number;
  poultryServings: number;
  dairyServings: number;
  vegServings: number;
  isLocalOrganic: boolean;
  onBeefChange: (v: number) => void;
  onPoultryChange: (v: number) => void;
  onDairyChange: (v: number) => void;
  onVegChange: (v: number) => void;
  onLocalOrganicChange: (v: boolean) => void;
}

export function StepDiet({
  beefServings,
  poultryServings,
  dairyServings,
  vegServings,
  isLocalOrganic,
  onBeefChange,
  onPoultryChange,
  onDairyChange,
  onVegChange,
  onLocalOrganicChange,
}: StepDietProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      key="step3"
      variants={getSlideVariants(prefersReducedMotion)}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="h-5 w-5 text-emerald-400" />
        <h2 className="text-base font-semibold text-zinc-100">Diet &amp; Food Habits</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="redMeat" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Red Meat (Beef/Lamb)</label>
          <span className="text-xs text-zinc-500 block font-mono">{beefServings} meals/week</span>
          <input
            id="redMeat"
            type="range"
            min="0"
            max="14"
            value={beefServings}
            onChange={(e) => onBeefChange(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="poultry" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Poultry (Chicken/Pork)</label>
          <span className="text-xs text-zinc-500 block font-mono">{poultryServings} meals/week</span>
          <input
            id="poultry"
            type="range"
            min="0"
            max="14"
            value={poultryServings}
            onChange={(e) => onPoultryChange(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="dairy" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Dairy &amp; Cheese</label>
          <span className="text-xs text-zinc-500 block font-mono">{dairyServings} servings/week</span>
          <input
            id="dairy"
            type="range"
            min="0"
            max="28"
            value={dairyServings}
            onChange={(e) => onDairyChange(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="vegMeals" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Vegetarian Meals</label>
          <span className="text-xs text-zinc-500 block font-mono">{vegServings} meals/week</span>
          <input
            id="vegMeals"
            type="range"
            min="0"
            max="28"
            value={vegServings}
            onChange={(e) => onVegChange(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      <div className="border border-white/[0.06] rounded-xl p-3 bg-zinc-950/40 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-zinc-200"><label htmlFor="localOrganic">Local &amp; Organic Foods</label></h4>
          <p className="text-[10px] text-zinc-500 mt-0.5">Prefer locally sourced products</p>
        </div>
        <input
          id="localOrganic"
          type="checkbox"
          checked={isLocalOrganic}
          onChange={(e) => onLocalOrganicChange(e.target.checked)}
          className="w-4 h-4 rounded accent-emerald-500 bg-zinc-950 border-white/[0.08]"
        />
      </div>
    </motion.div>
  );
}
