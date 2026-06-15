import { EMISSION_FACTORS } from "./emissionFactors";

/** Available appliance types mapped to their power consumption in kW */
export type ApplianceType = keyof typeof EMISSION_FACTORS.appliances;

/**
 * Represents usage of a single electrical appliance.
 *
 * @property type - The appliance type (e.g. "airConditioner", "heater", "television")
 * @property hours - Number of hours the appliance was used
 */
export interface ApplianceUsage {
  type: ApplianceType;
  hours: number;
}

/**
 * Calculates CO₂ emissions from electricity consumption.
 *
 * Converts appliance usage hours into kWh, adds any custom kWh, then
 * applies the grid emission factor adjusted by the renewable energy ratio.
 *
 * @param usage - Array of appliance usage entries
 * @param customKwh - Additional kWh consumed from non-appliance sources (default: 0)
 * @param renewableRatio - Fraction of energy from renewables, 0–1 (default: 0)
 * @returns Total electricity-related CO₂ emissions in kg
 */
export function calculateElectricityEmissions(
  usage: ApplianceUsage[],
  customKwh: number = 0,
  renewableRatio: number = 0
): number {
  let totalKwh = customKwh;

  for (const item of usage) {
    if (item.hours < 0) continue;
    const powerKw = EMISSION_FACTORS.appliances[item.type] ?? 0;
    totalKwh += powerKw * item.hours;
  }

  // Adjust carbon intensity based on renewable energy offset
  const gridEmissionsFactor = EMISSION_FACTORS.electricity.standardGrid;
  const netEmissionsFactor = gridEmissionsFactor * (1 - Math.min(1, Math.max(0, renewableRatio)));

  return totalKwh * netEmissionsFactor;
}
