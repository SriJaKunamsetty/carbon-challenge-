import { useState } from "react";
import { calculateCarbonScore } from "@/lib/carbon/score";
import { EMISSION_FACTORS } from "@/lib/carbon/emissionFactors";

/** Base assumptions for the Carbon Twin simulation */
const BASE_CAR_KM = 600;
const BASE_AC_HOURS = 120; // 4 hrs/day * 30 days
const BASE_MEAT_MEALS = 30; // beef/poultry meals per month

/** AC power draw in kW — sourced from EMISSION_FACTORS.appliances */
const AC_POWER_KW = EMISSION_FACTORS.appliances.airConditioner;
/** Grid carbon intensity in kg CO2/kWh — sourced from EMISSION_FACTORS.electricity */
const GRID_FACTOR = EMISSION_FACTORS.electricity.standardGrid;
/** Beef emission factor in kg CO2/serving — sourced from EMISSION_FACTORS.food */
const BEEF_SERVING_FACTOR = EMISSION_FACTORS.food.beef;
/** Vegetable emission factor in kg CO2/serving — sourced from EMISSION_FACTORS.food */
const VEG_SERVING_FACTOR = EMISSION_FACTORS.food.vegetables;
/** Gasoline car emission factor in kg CO2/km — sourced from EMISSION_FACTORS.transport */
const GASOLINE_CAR_FACTOR = EMISSION_FACTORS.transport.gasolineCar;
/** Electric car emission factor in kg CO2/km — sourced from EMISSION_FACTORS.transport */
const ELECTRIC_CAR_FACTOR = EMISSION_FACTORS.transport.electricCar;
/** Bus/transit emission factor in kg CO2/km — sourced from EMISSION_FACTORS.transport */
const TRANSIT_FACTOR = EMISSION_FACTORS.transport.bus;
/** Estimated fixed monthly carbon from shopping, water, and waste (kg CO2) */
const BASELINE_OTHER = 80;

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
 *
 * @returns An object containing simulation inputs, their setters, and computed results
 *   including baseline/projected carbon totals, savings estimates, and chart data.
 */
export function useTwinSimulation() {
  const [transitDays, setTransitDays] = useState(0);
  const [acReduction, setAcReduction] = useState(0);
  const [vegMealsSwaps, setVegMealsSwaps] = useState(0);
  const [renewableUtility, setRenewableUtility] = useState(0);
  const [useEV, setUseEV] = useState(false);

  // Carbon factors
  const carFactor = useEV ? ELECTRIC_CAR_FACTOR : GASOLINE_CAR_FACTOR;
  const transitFactor = TRANSIT_FACTOR;

  // 1. Calculate Baseline Carbon
  const baselineCarCarbon = BASE_CAR_KM * GASOLINE_CAR_FACTOR;
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
  /** Estimated fuel cost saving per km swapped to transit (USD/km) */
  const FUEL_COST_PER_KM = 0.15;
  /** Estimated electricity cost per kWh (USD/kWh) */
  const ELECTRICITY_COST_PER_KWH = 0.16;
  /** Monthly CO2 absorption per tree (tonnes CO2/month); used for tree equivalence */
  const TREE_CO2_ABSORPTION_MONTHLY = 0.045;

  const moneySaved = Math.round((monthlyCarKmSwapped * FUEL_COST_PER_KM) + (acReduction * 30 * AC_POWER_KW * ELECTRICITY_COST_PER_KWH));
  const treesEquivalent = Math.round(carbonSaved * 12 * TREE_CO2_ABSORPTION_MONTHLY);
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
