import { EMISSION_FACTORS } from "./emissionFactors";

/** Available transport modes mapped to their per-km emission factors */
export type TransportMode = keyof typeof EMISSION_FACTORS.transport;

/**
 * Calculates CO₂ emissions for a single transport journey.
 *
 * Returns zero for negative distances. Unknown transport modes default
 * to zero emissions via the nullish coalescing operator.
 *
 * @param mode - The transport mode (e.g. "gasolineCar", "electricCar", "bus")
 * @param distanceKm - Distance traveled in kilometers
 * @returns CO₂ emissions in kg for the journey
 */
export function calculateTransportEmissions(
  mode: TransportMode,
  distanceKm: number
): number {
  if (distanceKm < 0) return 0;
  const factor = EMISSION_FACTORS.transport[mode] ?? 0;
  return distanceKm * factor;
}
