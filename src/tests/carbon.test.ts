import { calculateTransportEmissions } from "../lib/carbon/transport";
import { calculateFoodEmissions } from "../lib/carbon/food";
import { calculateElectricityEmissions } from "../lib/carbon/electricity";
import { calculateCarbonScore, getScoreRating } from "../lib/carbon/score";
import { aggregateMonthlyCarbon } from "../lib/carbon/calculator";
import { calculateWaterEmissions } from "../lib/carbon/water";
import { calculateShoppingEmissions } from "../lib/carbon/shopping";

describe("Carbon Calculations Engine Unit Tests", () => {
  
  describe("Transport Emissions", () => {
    it("should calculate correct emissions for gasoline cars", () => {
      // Gasoline car factor is 0.21 kg per km
      const result = calculateTransportEmissions("gasolineCar", 100);
      expect(result).toBe(21);
    });

    it("should calculate correct emissions for electric cars", () => {
      // Electric car factor is 0.05 kg per km
      const result = calculateTransportEmissions("electricCar", 100);
      expect(result).toBe(5);
    });

    it("should return 0 emissions for active travel (walking/biking)", () => {
      const bikeResult = calculateTransportEmissions("bicycle", 50);
      const walkResult = calculateTransportEmissions("walking", 12);
      expect(bikeResult).toBe(0);
      expect(walkResult).toBe(0);
    });
  });

  describe("Food/Dietary Emissions", () => {
    it("should calculate correct emissions for beef servings", () => {
      // Beef is 6.5 kg CO2 per serving
      const result = calculateFoodEmissions([{ type: "beef", servings: 3 }]);
      expect(result).toBe(19.5);
    });

    it("should apply 10% local/organic sourcing discount correctly", () => {
      const standard = calculateFoodEmissions([{ type: "beef", servings: 10 }]);
      const local = calculateFoodEmissions([{ type: "beef", servings: 10 }], true);
      expect(local).toBe(standard * 0.9);
    });

    it("should skip entries with negative servings", () => {
      const result = calculateFoodEmissions([
        { type: "beef", servings: -1 },
        { type: "poultry", servings: 2 },
      ]);
      // Beef with negative servings is skipped; only poultry counts (2 * 1.8 = 3.6)
      expect(result).toBeGreaterThan(0);
      // Result should be less than beef alone would be for same servings
      const beefOnly = calculateFoodEmissions([{ type: "beef", servings: 2 }]);
      expect(result).toBeLessThan(beefOnly);
    });

    it("should return 0 for empty entries list", () => {
      const result = calculateFoodEmissions([]);
      expect(result).toBe(0);
    });

    it("should not apply reduction when isLocalOrOrganic is false (default)", () => {
      const standard = calculateFoodEmissions([{ type: "beef", servings: 10 }], false);
      const withoutFlag = calculateFoodEmissions([{ type: "beef", servings: 10 }]);
      expect(standard).toBe(withoutFlag);
    });

    it("should return 0 for unknown food types (??0 fallback)", () => {
      // Cast unknown type to bypass TypeScript to exercise the ?? 0 fallback
      const result = calculateFoodEmissions([{ type: "unicorn-meat" as any, servings: 3 }]);
      expect(result).toBe(0);
    });
  });

  describe("Electricity & Home Appliance Emissions", () => {
    it("should calculate correct emissions for standard grid appliances", () => {
      // AC draws 1.5 kW. 10 hours = 15 kWh. Standard grid intensity is 0.47 kg CO2 / kWh.
      // 15 * 0.47 = 7.05 kg CO2
      const result = calculateElectricityEmissions([{ type: "airConditioner", hours: 10 }]);
      expect(result).toBe(7.05);
    });

    it("should offset emissions correctly when renewable offset is applied", () => {
      // 100% renewable offset should result in 0 net emissions
      const result = calculateElectricityEmissions([{ type: "airConditioner", hours: 10 }], 0, 1);
      expect(result).toBe(0);
    });
  });

  describe("Carbon Score Normalization", () => {
    it("should return 100 score for 0 emissions", () => {
      const score = calculateCarbonScore(0);
      expect(score).toBe(100);
    });

    it("should return 0 score for emissions exceeding the baseline cap", () => {
      const score = calculateCarbonScore(700, 600);
      expect(score).toBe(0);
    });

    it("should calculate a linear rating correctly between 0 and baseline", () => {
      const score = calculateCarbonScore(300, 600); // 50% of baseline
      expect(score).toBe(50);
    });
  });

  describe("Aggregate Calculator", () => {
    it("should sum emissions from multiple sectors correctly", () => {
      const aggregate = aggregateMonthlyCarbon({
        transport: [{ mode: "gasolineCar", distanceKm: 100 }], // 21 kg
        food: { entries: [{ type: "beef", servings: 2 }], isLocalOrOrganic: false }, // 13 kg
        electricity: { usage: [{ type: "airConditioner", hours: 10 }], renewableRatio: 0 }, // 7.05 kg
        shopping: [],
        water: { tapLiters: 0, bottlesCount: 0 },
        waste: { landfillKg: 0, recycledKg: 0, compostKg: 0 }
      });
      // 21 + 13 + 7.05 = 41.05 kg CO2
      expect(aggregate).toBe(41.05);
    });

    it("should handle empty transport array", () => {
      const aggregate = aggregateMonthlyCarbon({
        transport: [],
        food: { entries: [], isLocalOrOrganic: false },
        electricity: { usage: [] },
        shopping: [],
        water: { tapLiters: 0, bottlesCount: 0 },
        waste: { landfillKg: 0, recycledKg: 0, compostKg: 0 }
      });
      expect(aggregate).toBe(0);
    });

    it("should handle multiple transport modes", () => {
      const aggregate = aggregateMonthlyCarbon({
        transport: [
          { mode: "gasolineCar", distanceKm: 50 },
          { mode: "bus", distanceKm: 20 },
        ],
        food: { entries: [], isLocalOrOrganic: false },
        electricity: { usage: [] },
        shopping: [],
        water: { tapLiters: 0, bottlesCount: 0 },
        waste: { landfillKg: 0, recycledKg: 0, compostKg: 0 }
      });
      expect(aggregate).toBeGreaterThan(0);
    });
  });

  describe("Score Rating Labels", () => {
    it("returns Excellent for score >= 80", () => {
      const rating = getScoreRating(90);
      expect(rating.label).toContain("Excellent");
    });

    it("returns Good for score 60-79", () => {
      const rating = getScoreRating(65);
      expect(rating.label).toContain("Good");
    });

    it("returns Moderate for score 40-59", () => {
      const rating = getScoreRating(50);
      expect(rating.label).toContain("Moderate");
    });

    it("returns High Impact for score < 40", () => {
      const rating = getScoreRating(20);
      expect(rating.label).toContain("High Impact");
    });

    it("returns Excellent at boundary score of 80", () => {
      const rating = getScoreRating(80);
      expect(rating.label).toContain("Excellent");
    });

    it("returns Good at boundary score of 60", () => {
      const rating = getScoreRating(60);
      expect(rating.label).toContain("Good");
    });

    it("returns Moderate at boundary score of 40", () => {
      const rating = getScoreRating(40);
      expect(rating.label).toContain("Moderate");
    });
  });

  describe("Water Emissions", () => {
    it("should calculate water emissions correctly", () => {
      const result = calculateWaterEmissions(100, 5);
      expect(result).toBeGreaterThan(0);
    });

    it("should return 0 for no water usage", () => {
      const result = calculateWaterEmissions(0, 0);
      expect(result).toBe(0);
    });

    it("should clamp negative inputs to 0", () => {
      const result = calculateWaterEmissions(-100, -5);
      expect(result).toBe(0);
    });
  });

  describe("Shopping Emissions", () => {
    it("should calculate shopping emissions", () => {
      const result = calculateShoppingEmissions([
        { category: "clothing", count: 2 },
        { category: "electronics", count: 1 },
      ]);
      expect(result).toBeGreaterThan(0);
    });

    it("should return 0 for empty shopping list", () => {
      const result = calculateShoppingEmissions([]);
      expect(result).toBe(0);
    });

    it("should skip items with negative count", () => {
      const result = calculateShoppingEmissions([
        { category: "clothing", count: -1 },
        { category: "misc", count: 2 },
      ]);
      // Only misc counts: 2 * 5 = 10
      expect(result).toBe(10);
    });

    it("should return 0 for unknown shopping categories (??0 fallback)", () => {
      const result = calculateShoppingEmissions([{ category: "luxury-yacht" as any, count: 1 }]);
      expect(result).toBe(0);
    });
  });

  describe("Carbon Score Boundary Conditions", () => {
    it("should return 100 for zero emissions", () => {
      const score = calculateCarbonScore(0);
      expect(score).toBe(100);
    });

    it("should return 100 for negative emissions", () => {
      const score = calculateCarbonScore(-50);
      expect(score).toBe(100);
    });

    it("should return 0 when emissions equal or exceed the baseline", () => {
      // calculateCarbonScore with a very high value >= baseline
      const score = calculateCarbonScore(99999);
      expect(score).toBe(0);
    });

    it("should return 0 when emissions exactly match the baseline", () => {
      // Pass baseline as second arg so we can test the >= boundary exactly
      const score = calculateCarbonScore(800, 800);
      expect(score).toBe(0);
    });
  });
});
