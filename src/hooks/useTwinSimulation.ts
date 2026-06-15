import { useState } from "react";
import { calculateCarbonScore } from "@/lib/carbon/score";

/** Base assumptions for the Carbon Twin simulation */
const BASE_CAR_KM = 600;
const BASE_AC_HOURS = 120; // 4 hrs/day * 30 days
const BASE_MEAT_MEALS = 30; // beef/poultry meals per month

const AC_POWER_KW = 1.5;
const GRID_FACTOR = 0.47;
const BEEF_SERVING_FACTOR = 6.5;
const VEG_SERVING_FACTOR = 0.3;
const BASELINE_OTHER = 80; // shopping, waste, water constants

export interface TwinSimulationInputs {
  transitDays: number;
  acReduction: number;
  vegMealsSwaps: number;
  renewableUtility: number;
  useEV: boolean;
}

export interface TwinSimulationResult {
  baselineTotal: number;
  projectedTotal: number;
  carbonSaved: number;
  moneySaved: number;
  treesEquivalent: number;
  scoreImprovement: number;
  chartData: { label: string; value: number }[];
}

/**
 * Custom hook that encapsulates all Carbon Twin simulation state and calculations.
 * Separates calculation logic from the UI layer so both can be independently tested.
 */
export function useTwinSimulation() {
  const [transitDays, setTransitDays] = useState(0);
  const [acReduction, setAcReduction] = useState(0);
  const [vegMealsSwaps, setVegMealsSwaps] = useState(0);
  const [renewableUtility, setRenewableUtility] = useState(0);
  const [useEV, setUseEV] = useState(false);

  // Carbon factors
  const carFactor = useEV ? 0.05 : 0.21;
  const transitFactor = 0.04;

  // 1. Calculate Baseline Carbon
  const baselineCarCarbon = BASE_CAR_KM * 0.21;
  const baselineACCarbon = BASE_AC_HOURS * AC_POWER_KW * GRID_FACTOR;
  const baselineMeatCarbon = BASE_MEAT_MEALS * BEEF_SERVING_FACTOR;
  const baselineTotal = Math.round(baselineCarCarbon + baselineACCarbon + baselineMeatCarbon + BASELINE_OTHER);

  // 2. Calculate Projected Carbon
  const monthlyCarKmSwapped = Math.min(BASE_CAR_KM, transitDays * 80);
  const projectedCarKm = BASE_CAR_KM - monthlyCarKmSwapped;
  const projectedCarCarbon = projectedCarKm * carFactor + monthlyCarKmSwapped * transitFactor;

  const projectedACHours = Math.max(0, BASE_AC_HOURS - acReduction * 30);
  const electricityMultiplier = 1 - renewableUtility / 100;
  const projectedACCarbon = projectedACHours * AC_POWER_KW * GRID_FACTOR * electricityMultiplier;

  const monthlyMeatSwaps = Math.min(BASE_MEAT_MEALS, vegMealsSwaps * 4);
  const projectedMeatMeals = BASE_MEAT_MEALS - monthlyMeatSwaps;
  const projectedDietCarbon = projectedMeatMeals * BEEF_SERVING_FACTOR + monthlyMeatSwaps * VEG_SERVING_FACTOR;

  const projectedTotal = Math.round(projectedCarCarbon + projectedACCarbon + projectedDietCarbon + (BASELINE_OTHER * electricityMultiplier));

  // 3. Offsets and Savings Calculations
  const carbonSaved = Math.max(0, baselineTotal - projectedTotal);
  const moneySaved = Math.round((monthlyCarKmSwapped * 0.15) + (acReduction * 30 * AC_POWER_KW * 0.16));
  const treesEquivalent = Math.round(carbonSaved * 12 * 0.045);
  const scoreImprovement = Math.max(0, calculateCarbonScore(projectedTotal) - calculateCarbonScore(baselineTotal));

  const chartData = [
    { label: "Current", value: baselineTotal },
    { label: "Simulated", value: projectedTotal },
  ];

  return {
    // Inputs
    transitDays,
    acReduction,
    vegMealsSwaps,
    renewableUtility,
    useEV,
    // Setters
    setTransitDays,
    setAcReduction,
    setVegMealsSwaps,
    setRenewableUtility,
    setUseEV,
    // Results
    baselineTotal,
    projectedTotal,
    carbonSaved,
    moneySaved,
    treesEquivalent,
    scoreImprovement,
    chartData,
  };
}
