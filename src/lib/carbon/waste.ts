import { EMISSION_FACTORS } from "./emissionFactors";

/**
 * Calculates CO₂ emissions from waste disposal across three methods.
 *
 * Negative input values are clamped to zero to prevent underflow.
 *
 * @param landfillKg - Kilograms of waste sent to landfill
 * @param recycledKg - Kilograms of waste recycled
 * @param compostKg - Kilograms of waste composted
 * @returns Total waste-related CO₂ emissions in kg
 */
export function calculateWasteEmissions(
  landfillKg: number,
  recycledKg: number,
  compostKg: number
): number {
  const landfillEmissions = Math.max(0, landfillKg) * EMISSION_FACTORS.waste.landfill;
  const recycledEmissions = Math.max(0, recycledKg) * EMISSION_FACTORS.waste.recycled;
  const compostEmissions = Math.max(0, compostKg) * EMISSION_FACTORS.waste.compost;
  return landfillEmissions + recycledEmissions + compostEmissions;
}
