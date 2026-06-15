"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";
import { getSlideVariants } from "./step-personal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface StepTransportProps {
  carKm: number;
  carType: "gasolineCar" | "electricCar";
  busKm: number;
  trainKm: number;
  flightHours: number;
  onCarKmChange: (v: number) => void;
  onCarTypeChange: (v: "gasolineCar" | "electricCar") => void;
  onBusKmChange: (v: number) => void;
  onTrainKmChange: (v: number) => void;
  onFlightHoursChange: (v: number) => void;
}

export function StepTransport({
  carKm,
  carType,
  busKm,
  trainKm,
  flightHours,
  onCarKmChange,
  onCarTypeChange,
  onBusKmChange,
  onTrainKmChange,
  onFlightHoursChange,
}: StepTransportProps) {
  const prefersReducedMotion = useReducedMotion();
  return (
    <motion.div
      key="step2"
      variants={getSlideVariants(prefersReducedMotion)}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3 mb-6">
        <Compass className="h-5 w-5 text-emerald-400" />
        <h2 className="text-base font-semibold text-zinc-100">Transportation Profile</h2>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="monthlyCarDrive" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Monthly Car Drive</label>
          <span className="text-xs text-emerald-400 font-bold font-mono">{carKm} km/mo</span>
        </div>
        <input
          id="monthlyCarDrive"
          type="range"
          min="0"
          max="3000"
          step="50"
          value={carKm}
          onChange={(e) => onCarKmChange(Number(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        {carKm > 0 && (
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="radio"
                checked={carType === "gasolineCar"}
                onChange={() => onCarTypeChange("gasolineCar")}
                className="accent-emerald-500"
              /> Gasoline / Hybrid
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
              <input
                type="radio"
                checked={carType === "electricCar"}
                onChange={() => onCarTypeChange("electricCar")}
                className="accent-emerald-500"
              /> Electric / EV
            </label>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="publicTransit" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Public Transit (Bus/Metro)</label>
          <span className="text-xs text-emerald-400 font-bold font-mono">{busKm + trainKm} km/mo</span>
        </div>
        <input
          id="publicTransit"
          type="range"
          min="0"
          max="1500"
          step="25"
          value={busKm}
          onChange={(e) => {
            onBusKmChange(Number(e.target.value));
            onTrainKmChange(Math.round(Number(e.target.value) / 2));
          }}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label htmlFor="annualFlightHours" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Annual Flight Hours</label>
          <span className="text-xs text-emerald-400 font-bold font-mono">{flightHours} hours/yr</span>
        </div>
        <input
          id="annualFlightHours"
          type="range"
          min="0"
          max="40"
          step="1"
          value={flightHours}
          onChange={(e) => onFlightHoursChange(Number(e.target.value))}
          className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
      </div>
    </motion.div>
  );
}
