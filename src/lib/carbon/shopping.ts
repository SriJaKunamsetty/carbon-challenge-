import { EMISSION_FACTORS } from "./emissionFactors";

/** Available shopping categories mapped to their per-item emission factors */
export type ShoppingCategory = keyof typeof EMISSION_FACTORS.shopping;

/**
 * Represents a purchased item in a shopping category.
 *
 * @property category - The shopping category (e.g. "clothing", "electronics")
 * @property count - Number of items purchased
 */
export interface ShoppingItem {
  category: ShoppingCategory;
  count: number;
}

/**
 * Calculates CO₂ emissions from shopping purchases.
 *
 * Sums per-item emission factors for each purchase. Items with negative
 * counts are silently skipped. Unknown categories default to zero emissions.
 *
 * @param items - Array of shopping purchase entries
 * @returns Total shopping-related CO₂ emissions in kg
 */
export function calculateShoppingEmissions(items: ShoppingItem[]): number {
  let totalEmissions = 0;
  for (const item of items) {
    if (item.count < 0) continue;
    const factor = EMISSION_FACTORS.shopping[item.category] ?? 0;
    totalEmissions += item.count * factor;
  }
  return totalEmissions;
}
