import { calculateTransportEmissions, TransportMode } from "./transport";
import { calculateFoodEmissions, FoodEntry } from "./food";
import { calculateElectricityEmissions, ApplianceUsage } from "./electricity";
import { calculateShoppingEmissions, ShoppingItem } from "./shopping";
import { calculateWaterEmissions } from "./water";
import { calculateWasteEmissions } from "./waste";

/**
 * Input structure for a full month of carbon-emitting activities.
 *
 * @property transport - Array of transport journeys with mode and distance
 * @property food - Food consumption entries and sourcing flag
 * @property electricity - Appliance usage, custom kWh, and renewable ratio
 * @property shopping - Array of purchased items by category
 * @property water - Tap water liters and bottled water count
 * @property waste - Waste disposed by method (landfill, recycled, compost)
 */
export interface MonthlyInputs {
  transport: {
    mode: TransportMode;
    distanceKm: number;
  }[];
  food: {
    entries: FoodEntry[];
    isLocalOrOrganic: boolean;
  };
  electricity: {
    usage: ApplianceUsage[];
    customKwh?: number;
    renewableRatio?: number;
  };
  shopping: ShoppingItem[];
  water: {
    tapLiters: number;
    bottlesCount: number;
  };
  waste: {
    landfillKg: number;
    recycledKg: number;
    compostKg: number;
  };
}

/**
 * Aggregates CO₂ emissions across all categories for a full month.
 *
 * Sums transport, food, electricity, shopping, water, and waste emissions.
 * The result is rounded to two decimal places.
 *
 * @param inputs - Complete monthly activity inputs across all categories
 * @returns Total monthly CO₂ emissions in kg, rounded to 2 decimal places
 */
export function aggregateMonthlyCarbon(inputs: MonthlyInputs): number {
  let total = 0;

  // 1. Transport
  for (const t of inputs.transport) {
    total += calculateTransportEmissions(t.mode, t.distanceKm);
  }

  // 2. Food
  total += calculateFoodEmissions(inputs.food.entries, inputs.food.isLocalOrOrganic);

  // 3. Electricity
  total += calculateElectricityEmissions(
    inputs.electricity.usage,
    inputs.electricity.customKwh ?? 0,
    inputs.electricity.renewableRatio ?? 0
  );

  // 4. Shopping
  total += calculateShoppingEmissions(inputs.shopping);

  // 5. Water
  total += calculateWaterEmissions(inputs.water.tapLiters, inputs.water.bottlesCount);

  // 6. Waste
  total += calculateWasteEmissions(
    inputs.waste.landfillKg,
    inputs.waste.recycledKg,
    inputs.waste.compostKg
  );

  return Math.round(total * 100) / 100;
}
