"use client";

import React from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { getSlideVariants } from "./step-personal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface StepGoalsProps {
  carbonGoal: number;
  onCarbonGoalChange: (v: number) => void;
}

export function StepGoals({ carbonGoal, onCarbonGoalChange }: StepGoalsProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      key="step5"
      variants={getSlideVariants(prefersReducedMotion)}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      className="space-y-5 text-center"
    >
      <div className="flex flex-col items-center gap-3 mb-6">
        <Award className="h-8 w-8 text-emerald-400 animate-bounce" />
        <h2 className="text-base font-semibold text-zinc-100">Monthly Reduction Targets</h2>
        <p className="text-xs text-zinc-400">Set your monthly carbon footprint limit target. Global average is ~400 kg.</p>
      </div>

      <div className="space-y-4 max-w-xs mx-auto">
        <div className="flex justify-between items-center">
          <label htmlFor="carbonGoal" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Monthly Cap</label>
          <span className="text-sm text-emerald-400 font-bold font-mono">{carbonGoal} kg CO2</span>
        </div>
        <input
          id="carbonGoal"
          type="range"
          min="100"
          max="800"
          step="20"
          value={carbonGoal}
          onChange={(e) => onCarbonGoalChange(Number(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />

        <div className="p-4 rounded-xl border border-white/[0.08] bg-zinc-950/50 text-left space-y-2 mt-4">
          <h4 className="text-xs font-semibold text-zinc-300">Bonus Reward</h4>
          <p className="text-[10px] text-zinc-500 leading-normal">
            By completing this onboarding profile, you will earn **100 Eco XP** points and unlock the **&quot;Green Pioneer&quot;** level badge on the leaderboard.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
