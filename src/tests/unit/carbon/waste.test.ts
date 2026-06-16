
import { calculateWasteEmissions } from "@/lib/carbon/waste";
import { EMISSION_FACTORS } from "@/lib/carbon/emissionFactors";

describe("calculateWasteEmissions", () => {
  describe("individual waste types", () => {
    it("calculates landfill-only emissions", () => {
      const result = calculateWasteEmissions(10, 0, 0);
      expect(result).toBe(10 * EMISSION_FACTORS.waste.landfill);
    });

    it("calculates recycled-only emissions", () => {
      const result = calculateWasteEmissions(0, 10, 0);
      expect(result).toBe(10 * EMISSION_FACTORS.waste.recycled);
    });

    it("calculates compost-only emissions", () => {
      const result = calculateWasteEmissions(0, 0, 10);
      expect(result).toBe(10 * EMISSION_FACTORS.waste.compost);
    });
  });

  describe("combined waste", () => {
    it("sums emissions from all waste types", () => {
      const result = calculateWasteEmissions(5, 3, 2);
      const expected =
        5 * EMISSION_FACTORS.waste.landfill +
        3 * EMISSION_FACTORS.waste.recycled +
        2 * EMISSION_FACTORS.waste.compost;
      expect(result).toBeCloseTo(expected, 10);
    });

    it("landfill has highest emission factor", () => {
      const landfillOnly = calculateWasteEmissions(1, 0, 0);
      const recycledOnly = calculateWasteEmissions(0, 1, 0);
      const compostOnly = calculateWasteEmissions(0, 0, 1);
      expect(landfillOnly).toBeGreaterThan(recycledOnly);
      expect(recycledOnly).toBeGreaterThan(compostOnly);
    });
  });

  describe("edge cases", () => {
    it("returns 0 when all inputs are 0", () => {
      expect(calculateWasteEmissions(0, 0, 0)).toBe(0);
    });

    it("treats negative landfill as 0", () => {
      const result = calculateWasteEmissions(-5, 0, 0);
      expect(result).toBe(0);
    });

    it("treats negative recycled as 0", () => {
      const result = calculateWasteEmissions(0, -5, 0);
      expect(result).toBe(0);
    });

    it("treats negative compost as 0", () => {
      const result = calculateWasteEmissions(0, 0, -5);
      expect(result).toBe(0);
    });

    it("treats all negative inputs as 0", () => {
      expect(calculateWasteEmissions(-1, -2, -3)).toBe(0);
    });

    it("handles very large values", () => {
      const result = calculateWasteEmissions(1000000, 0, 0);
      expect(result).toBe(1000000 * EMISSION_FACTORS.waste.landfill);
    });

    it("handles fractional kg values", () => {
      const result = calculateWasteEmissions(0.5, 0.5, 0.5);
      const expected =
        0.5 * EMISSION_FACTORS.waste.landfill +
        0.5 * EMISSION_FACTORS.waste.recycled +
        0.5 * EMISSION_FACTORS.waste.compost;
      expect(result).toBeCloseTo(expected, 10);
    });

    it("negative values mixed with positive — only positive values counted", () => {
      const result = calculateWasteEmissions(-5, 10, -2);
      const expected = 10 * EMISSION_FACTORS.waste.recycled;
      expect(result).toBeCloseTo(expected, 10);
    });
  });

  describe("return type", () => {
    it("returns a number", () => {
      expect(typeof calculateWasteEmissions(1, 1, 1)).toBe("number");
    });
  });
});
