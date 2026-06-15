import { EMISSION_FACTORS } from "./emissionFactors";

/**
 * Calculates CO₂ emissions from water consumption.
 *
 * Accounts for both tap water usage and bottled water purchases.
 * Negative input values are clamped to zero to prevent underflow.
 *
 * @param tapLiters - Liters of tap water consumed
 * @param bottlesCount - Number of bottled water units purchased
 * @returns Total water-related CO₂ emissions in kg
 */
export function calculateWaterEmissions(
  tapLiters: number,
  bottlesCount: number
): number {
  const tapEmissions = Math.max(0, tapLiters) * EMISSION_FACTORS.water.tapWater;
  const bottledEmissions = Math.max(0, bottlesCount) * EMISSION_FACTORS.water.bottledWater;
  return tapEmissions + bottledEmissions;
}
