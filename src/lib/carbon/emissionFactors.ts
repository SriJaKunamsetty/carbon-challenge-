/**
 * Centralized emission factor constants for all carbon categories.
 *
 * This is the **single source of truth** for emission multipliers used
 * across the application — including the domain calculators, the AI
 * parser prompt, and the local heuristic engine (`mock-ai.ts`).
 *
 * Values sourced from DEFRA, EPA, and IPCC 2022 guidelines.
 *
 * @module emissionFactors
 */
export const EMISSION_FACTORS = {
  // Transport emissions in kg CO2 per km
  transport: {
    gasolineCar: 0.21,
    electricCar: 0.05,
    motorcycle: 0.11,
    bus: 0.04,
    train: 0.03,
    flightShort: 0.18, // short haul (< 1500km)
    flightLong: 0.12,  // long haul (> 1500km)
    bicycle: 0,
    walking: 0,
  },

  // Food emissions in kg CO2 per serving
  food: {
    beef: 6.5,
    poultry: 1.8,
    pork: 2.2,
    fish: 1.6,
    dairy: 0.9,
    vegetables: 0.3,
    grains: 0.4,
  },

  // Energy emissions in kg CO2 per kWh
  electricity: {
    standardGrid: 0.47, // global average grid intensity
    solar: 0.02,
    wind: 0.01,
  },

  // Shopping emissions in kg CO2 per item
  shopping: {
    clothing: 15,
    electronics: 120,
    furniture: 45,
    misc: 5,
  },

  // Water emissions in kg CO2 per liter
  water: {
    tapWater: 0.0003,
    bottledWater: 0.25, // includes plastic packaging impact
  },

  // Waste emissions in kg CO2 per kg
  waste: {
    landfill: 0.8,
    recycled: 0.1,
    compost: 0.05,
  },

  // Household appliance consumption in kW (used to compute kWh)
  appliances: {
    airConditioner: 1.5, // 1.5 kW average
    heater: 2,         // 2.0 kW average
    television: 0.1,     // 100W average
    computer: 0.2,       // 200W average
  }
};
