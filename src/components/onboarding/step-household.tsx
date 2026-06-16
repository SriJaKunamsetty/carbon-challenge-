"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";
import { getSlideVariants } from "./step-personal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface StepHouseholdProps {
  acHours: number;
  heaterHours: number;
  computerHours: number;
  renewablePercent: number;
  onAcHoursChange: (v: number) => void;
  onHeaterHoursChange: (v: number) => void;
  onComputerHoursChange: (v: number) => void;
  onRenewablePercentChange: (v: number) => void;
}

export function StepHousehold({
  acHours,
  heaterHours,
  computerHours,
  renewablePercent,
  onAcHoursChange,
  onHeaterHoursChange,
  onComputerHoursChange,
  onRenewablePercentChange,
}: StepHouseholdProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      key="step4"
      variants={getSlideVariants(prefersReducedMotion)}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="h-5 w-5 text-emerald-400" />
        <h2 className="text-base font-semibold text-zinc-100">Household Energy</h2>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="acHours" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Air Conditioner daily use</label>
          <span className="text-xs text-emerald-400 font-bold font-mono">{acHours} hours/day</span>
        </div>
        <input
          id="acHours"
          type="range"
          min="0"
          max="24"
          value={acHours}
          onChange={(e) => onAcHoursChange(Number(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="heaterHours" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Space Heater daily use</label>
          <span className="text-xs text-emerald-400 font-bold font-mono">{heaterHours} hours/day</span>
        </div>
        <input
          id="heaterHours"
          type="range"
          min="0"
          max="24"
          value={heaterHours}
          onChange={(e) => onHeaterHoursChange(Number(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="computerHours" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Computer / Console usage</label>
          <span className="text-xs text-emerald-400 font-bold font-mono">{computerHours} hours/day</span>
        </div>
        <input
          id="computerHours"
          type="range"
          min="0"
          max="24"
          value={computerHours}
          onChange={(e) => onComputerHoursChange(Number(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="renewablePercent" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Renewable Power offset</label>
          <span className="text-xs text-emerald-400 font-bold font-mono">{renewablePercent}% solar/wind</span>
        </div>
        <input
          id="renewablePercent"
          type="range"
          min="0"
          max="100"
          step="5"
          value={renewablePercent}
          onChange={(e) => onRenewablePercentChange(Number(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>
    </motion.div>
  );
}
