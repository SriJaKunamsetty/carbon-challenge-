/**
 * @fileoverview Unit tests for calculateFoodEmissions.
 * Covers all branches: default params, negative servings,
 * unknown food types (??0 fallback), and the isLocalOrOrganic discount.
 */

import { calculateFoodEmissions, type FoodEntry } from "@/lib/carbon/food";
import { EMISSION_FACTORS } from "@/lib/carbon/emissionFactors";

describe("calculateFoodEmissions", () => {
  // ── Empty list ────────────────────────────────────────────────────────────
  it("returns 0 for an empty entries list", () => {
    expect(calculateFoodEmissions([])).toBe(0);
  });

  // ── Default parameter ─────────────────────────────────────────────────────
  it("uses isLocalOrOrganic=false by default (no discount)", () => {
    const withDefault = calculateFoodEmissions([{ type: "beef", servings: 1 }]);
    const withExplicitFalse = calculateFoodEmissions([{ type: "beef", servings: 1 }], false);
    expect(withDefault).toBe(withExplicitFalse);
    expect(withDefault).toBe(EMISSION_FACTORS.food.beef);
  });

  // ── Normal positive servings ──────────────────────────────────────────────
  it("calculates emissions for a known food type with positive servings", () => {
    const entry: FoodEntry = { type: "poultry", servings: 2 };
    expect(calculateFoodEmissions([entry])).toBeCloseTo(2 * EMISSION_FACTORS.food.poultry);
  });

  // ── Negative servings skip branch (continue) ──────────────────────────────
  it("skips entries with negative servings (covers continue branch)", () => {
    const entries: FoodEntry[] = [
      { type: "beef", servings: -5 },       // skipped
      { type: "vegetables", servings: 2 },  // processed
    ];
    expect(calculateFoodEmissions(entries)).toBeCloseTo(2 * EMISSION_FACTORS.food.vegetables);
  });

  // ── Zero servings edge case ───────────────────────────────────────────────
  it("treats zero servings as no emission (0 * factor = 0)", () => {
    const entries: FoodEntry[] = [{ type: "beef", servings: 0 }];
    expect(calculateFoodEmissions(entries)).toBe(0);
  });

  // ── Unknown type ?? 0 fallback branch ────────────────────────────────────
  it("returns 0 for unknown food types (covers ?? 0 right-side fallback)", () => {
    const result = calculateFoodEmissions([
      { type: "unicorn-steak" as any, servings: 10 },
    ]);
    expect(result).toBe(0);
  });

  // ── isLocalOrOrganic true branch ─────────────────────────────────────────
  it("applies 10% reduction when isLocalOrOrganic is true", () => {
    const standard = calculateFoodEmissions([{ type: "beef", servings: 10 }], false);
    const local = calculateFoodEmissions([{ type: "beef", servings: 10 }], true);
    expect(local).toBeCloseTo(standard * 0.9);
  });

  // ── isLocalOrOrganic false explicit ──────────────────────────────────────
  it("does not reduce emissions when isLocalOrOrganic is explicitly false", () => {
    const result = calculateFoodEmissions([{ type: "dairy", servings: 4 }], false);
    expect(result).toBeCloseTo(4 * EMISSION_FACTORS.food.dairy);
  });

  // ── Mixed valid and skipped entries ──────────────────────────────────────
  it("handles mixed valid and negative servings in same call", () => {
    const entries: FoodEntry[] = [
      { type: "beef", servings: 2 },     // 2 * 6.5 = 13
      { type: "poultry", servings: -1 }, // skipped
      { type: "grains", servings: 5 },   // 5 * 0.4 = 2
    ];
    expect(calculateFoodEmissions(entries)).toBeCloseTo(
      2 * EMISSION_FACTORS.food.beef + 5 * EMISSION_FACTORS.food.grains
    );
  });

  // ── Unknown type with isLocalOrOrganic=true (two edge branches together) ─
  it("handles unknown type with isLocalOrOrganic=true (0 * 0.9 = 0)", () => {
    const result = calculateFoodEmissions(
      [{ type: "mystery-meat" as any, servings: 5 }],
      true
    );
    expect(result).toBe(0);
  });

  // ── All known food types ──────────────────────────────────────────────────
  it("calculates emissions for all known food types", () => {
    const entries: FoodEntry[] = Object.keys(EMISSION_FACTORS.food).map((type) => ({
      type: type as any,
      servings: 1,
    }));
    const expected = Object.values(EMISSION_FACTORS.food).reduce((a, b) => a + b, 0);
    expect(calculateFoodEmissions(entries)).toBeCloseTo(expected);
  });
});
