
import {
  calculateShoppingEmissions,
  type ShoppingItem,
  type ShoppingCategory,
} from "@/lib/carbon/shopping";
import { EMISSION_FACTORS } from "@/lib/carbon/emissionFactors";

describe("calculateShoppingEmissions", () => {
  describe("individual categories", () => {
    it("calculates clothing emissions correctly", () => {
      const items: ShoppingItem[] = [{ category: "clothing", count: 2 }];
      const expected = 2 * EMISSION_FACTORS.shopping.clothing;
      expect(calculateShoppingEmissions(items)).toBe(expected);
    });

    it("calculates electronics emissions correctly", () => {
      const items: ShoppingItem[] = [{ category: "electronics", count: 1 }];
      const expected = 1 * EMISSION_FACTORS.shopping.electronics;
      expect(calculateShoppingEmissions(items)).toBe(expected);
    });

    it("calculates furniture emissions correctly", () => {
      const items: ShoppingItem[] = [{ category: "furniture", count: 3 }];
      const expected = 3 * EMISSION_FACTORS.shopping.furniture;
      expect(calculateShoppingEmissions(items)).toBe(expected);
    });

    it("calculates misc emissions correctly", () => {
      const items: ShoppingItem[] = [{ category: "misc", count: 5 }];
      const expected = 5 * EMISSION_FACTORS.shopping.misc;
      expect(calculateShoppingEmissions(items)).toBe(expected);
    });
  });

  describe("multiple items combined", () => {
    it("sums emissions from multiple categories", () => {
      const items: ShoppingItem[] = [
        { category: "clothing", count: 1 },
        { category: "electronics", count: 2 },
        { category: "furniture", count: 1 },
      ];
      const expected =
        1 * EMISSION_FACTORS.shopping.clothing +
        2 * EMISSION_FACTORS.shopping.electronics +
        1 * EMISSION_FACTORS.shopping.furniture;
      expect(calculateShoppingEmissions(items)).toBe(expected);
    });

    it("sums emissions from duplicate categories", () => {
      const items: ShoppingItem[] = [
        { category: "clothing", count: 2 },
        { category: "clothing", count: 3 },
      ];
      const expected = 5 * EMISSION_FACTORS.shopping.clothing;
      expect(calculateShoppingEmissions(items)).toBe(expected);
    });
  });

  describe("edge cases", () => {
    it("returns 0 for an empty array", () => {
      expect(calculateShoppingEmissions([])).toBe(0);
    });

    it("returns 0 for count of 0", () => {
      const items: ShoppingItem[] = [{ category: "electronics", count: 0 }];
      expect(calculateShoppingEmissions(items)).toBe(0);
    });

    it("skips items with negative count", () => {
      const items: ShoppingItem[] = [{ category: "clothing", count: -3 }];
      expect(calculateShoppingEmissions(items)).toBe(0);
    });

    it("only sums non-negative items when mixed with negative", () => {
      const items: ShoppingItem[] = [
        { category: "clothing", count: -1 },
        { category: "electronics", count: 2 },
      ];
      const expected = 2 * EMISSION_FACTORS.shopping.electronics;
      expect(calculateShoppingEmissions(items)).toBe(expected);
    });

    it("handles large count values", () => {
      const items: ShoppingItem[] = [{ category: "misc", count: 100000 }];
      const expected = 100000 * EMISSION_FACTORS.shopping.misc;
      expect(calculateShoppingEmissions(items)).toBe(expected);
    });

    it("handles fractional count values", () => {
      const items: ShoppingItem[] = [{ category: "clothing", count: 1.5 }];
      const expected = 1.5 * EMISSION_FACTORS.shopping.clothing;
      expect(calculateShoppingEmissions(items)).toBe(expected);
    });
  });

  describe("type safety", () => {
    it("ShoppingCategory type covers all expected keys", () => {
      const categories: ShoppingCategory[] = [
        "clothing",
        "electronics",
        "furniture",
        "misc",
      ];
      expect(categories).toHaveLength(4);
      for (const cat of categories) {
        expect(EMISSION_FACTORS.shopping).toHaveProperty(cat);
      }
    });

    it("returns a number type", () => {
      const result = calculateShoppingEmissions([
        { category: "clothing", count: 1 },
      ]);
      expect(typeof result).toBe("number");
    });

    it("returns 0 for unknown shopping category (covers ?? 0 fallback)", () => {
      const items = [{ category: "unknown-gadget" as ShoppingCategory, count: 3 }];
      expect(calculateShoppingEmissions(items)).toBe(0);
    });
  });
});
