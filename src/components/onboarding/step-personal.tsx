"use client";

import React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Animation variants shared by all onboarding step panels */
export const slideVariants = {
  initial: { x: 50, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -50, opacity: 0 },
};

export const getSlideVariants = (prefersReducedMotion: boolean) => 
  prefersReducedMotion 
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : slideVariants;

export interface StepPersonalProps {
  name: string;
  age: number;
  country: string;
  occupation: string;
  onNameChange: (v: string) => void;
  onAgeChange: (v: number) => void;
  onCountryChange: (v: string) => void;
  onOccupationChange: (v: string) => void;
}

export function StepPersonal({
  name,
  age,
  country,
  occupation,
  onNameChange,
  onAgeChange,
  onCountryChange,
  onOccupationChange,
}: StepPersonalProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      key="step1"
      variants={getSlideVariants(prefersReducedMotion)}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3 mb-6">
        <User className="h-5 w-5 text-emerald-400" />
        <h2 className="text-base font-semibold text-zinc-100">Personal Details</h2>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="displayName" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Your Display Name</label>
        <input
          id="displayName"
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter display name"
          className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="age" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Age</label>
          <input
            id="age"
            type="number"
            value={age}
            onChange={(e) => onAgeChange(Number(e.target.value))}
            className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="occupation" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Occupation</label>
          <input
            id="occupation"
            type="text"
            value={occupation}
            onChange={(e) => onOccupationChange(e.target.value)}
            placeholder="e.g. Designer, Student"
            className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="country" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Country of Residence</label>
        <input
          id="country"
          type="text"
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          placeholder="e.g. Canada, Germany"
          className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black transition-all"
        />
      </div>
    </motion.div>
  );
}
