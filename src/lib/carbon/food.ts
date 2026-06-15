import { EMISSION_FACTORS } from "./emissionFactors";

/** Available food types mapped to their emission factors (kgCO₂ per serving) */
export type FoodType = keyof typeof EMISSION_FACTORS.food;

/**
 * Represents a single food consumption entry.
 *
 * @property type - The food category (e.g. "beef", "poultry", "vegetables")
 * @property servings - Number of servings consumed
 */
export interface FoodEntry {
  type: FoodType;
  servings: number;
}

/** Discount factor applied when food is locally or organically sourced (10% reduction) */
const LOCAL_ORGANIC_FACTOR = 0.9;

/**
 * Calculates total CO₂ emissions from food consumption.
 *
 * Sums per-serving emission factors for each entry. Entries with negative
 * servings are silently skipped. Unknown food types default to zero emissions.
 *
 * @param entries - Array of food consumption entries
 * @param isLocalOrOrganic - Whether food is locally/organically sourced (applies 10% reduction)
 * @returns Total food-related CO₂ emissions in kg
 */
export function calculateFoodEmissions(
  entries: FoodEntry[],
  isLocalOrOrganic: boolean = false
): number {
  let totalEmissions = 0;

  for (const entry of entries) {
    if (entry.servings < 0) continue;
    const factor = EMISSION_FACTORS.food[entry.type] ?? 0;
    totalEmissions += entry.servings * factor;
  }

  if (isLocalOrOrganic) {
    totalEmissions *= LOCAL_ORGANIC_FACTOR;
  }

  return totalEmissions;
}
