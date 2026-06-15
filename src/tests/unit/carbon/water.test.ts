
import { calculateWaterEmissions } from "@/lib/carbon/water";
import { EMISSION_FACTORS } from "@/lib/carbon/emissionFactors";

describe("calculateWaterEmissions", () => {
  describe("tap water only", () => {
    it("calculates tap water emissions correctly", () => {
      const result = calculateWaterEmissions(100, 0);
      expect(result).toBeCloseTo(100 * EMISSION_FACTORS.water.tapWater, 10);
    });

    it("returns 0 for 0 liters of tap water", () => {
      expect(calculateWaterEmissions(0, 0)).toBe(0);
    });
  });

  describe("bottled water only", () => {
    it("calculates bottled water emissions correctly", () => {
      const result = calculateWaterEmissions(0, 5);
      expect(result).toBeCloseTo(5 * EMISSION_FACTORS.water.bottledWater, 10);
    });

    it("bottled water has much higher emissions than tap", () => {
      const tapResult = calculateWaterEmissions(1, 0);
      const bottledResult = calculateWaterEmissions(0, 1);
      expect(bottledResult).toBeGreaterThan(tapResult);
    });
  });

  describe("combined sources", () => {
    it("sums emissions from both sources", () => {
      const result = calculateWaterEmissions(200, 3);
      const expected =
        200 * EMISSION_FACTORS.water.tapWater +
        3 * EMISSION_FACTORS.water.bottledWater;
      expect(result).toBeCloseTo(expected, 10);
    });
  });

  describe("edge cases", () => {
    it("returns 0 when both inputs are 0", () => {
      expect(calculateWaterEmissions(0, 0)).toBe(0);
    });

    it("treats negative tap liters as 0", () => {
      const result = calculateWaterEmissions(-10, 0);
      expect(result).toBe(0);
    });

    it("treats negative bottles count as 0", () => {
      const result = calculateWaterEmissions(0, -5);
      expect(result).toBe(0);
    });

    it("treats both negative inputs as 0", () => {
      expect(calculateWaterEmissions(-10, -5)).toBe(0);
    });

    it("handles very large tap water values", () => {
      const result = calculateWaterEmissions(1000000, 0);
      expect(result).toBe(1000000 * EMISSION_FACTORS.water.tapWater);
    });

    it("handles very large bottled water values", () => {
      const result = calculateWaterEmissions(0, 100000);
      expect(result).toBe(100000 * EMISSION_FACTORS.water.bottledWater);
    });

    it("handles fractional values", () => {
      const result = calculateWaterEmissions(1.5, 0.5);
      const expected =
        1.5 * EMISSION_FACTORS.water.tapWater +
        0.5 * EMISSION_FACTORS.water.bottledWater;
      expect(result).toBeCloseTo(expected, 10);
    });

    it("negative mixed with positive — only positive counted", () => {
      const result = calculateWaterEmissions(-10, 3);
      const expected = 3 * EMISSION_FACTORS.water.bottledWater;
      expect(result).toBeCloseTo(expected, 10);
    });
  });

  describe("return type", () => {
    it("returns a number", () => {
      expect(typeof calculateWaterEmissions(1, 1)).toBe("number");
    });
  });
});
