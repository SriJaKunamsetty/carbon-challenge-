/**
 * @fileoverview Unit tests for calculateElectricityEmissions.
 * Covers all branches: default params, negative hours guard,
 * unknown appliance type (?? 0 fallback), renewable ratio clamping,
 * and custom kWh input.
 */

import { calculateElectricityEmissions, type ApplianceUsage } from "@/lib/carbon/electricity";
import { EMISSION_FACTORS } from "@/lib/carbon/emissionFactors";

const GRID = EMISSION_FACTORS.electricity.standardGrid;

describe("calculateElectricityEmissions", () => {
  // ── Empty usage ───────────────────────────────────────────────────────────
  it("returns 0 for empty usage array and 0 customKwh", () => {
    expect(calculateElectricityEmissions([])).toBe(0);
  });

  // ── Default parameter behavior ────────────────────────────────────────────
  it("uses customKwh=0 and renewableRatio=0 by default", () => {
    const usage: ApplianceUsage[] = [{ type: "television", hours: 2 }];
    const expectedKwh = EMISSION_FACTORS.appliances.television * 2;
    expect(calculateElectricityEmissions(usage)).toBeCloseTo(expectedKwh * GRID);
  });

  // ── Custom kWh ────────────────────────────────────────────────────────────
  it("adds customKwh on top of appliance usage", () => {
    const usage: ApplianceUsage[] = [];
    const result = calculateElectricityEmissions(usage, 10, 0);
    expect(result).toBeCloseTo(10 * GRID);
  });

  it("combines appliance kWh with customKwh", () => {
    const usage: ApplianceUsage[] = [{ type: "computer", hours: 4 }];
    const applianceKwh = EMISSION_FACTORS.appliances.computer * 4;
    const customKwh = 5;
    const result = calculateElectricityEmissions(usage, customKwh, 0);
    expect(result).toBeCloseTo((applianceKwh + customKwh) * GRID);
  });

  // ── Renewable ratio ───────────────────────────────────────────────────────
  it("returns 0 emissions when renewableRatio=1 (full renewable)", () => {
    const usage: ApplianceUsage[] = [{ type: "airConditioner", hours: 10 }];
    expect(calculateElectricityEmissions(usage, 0, 1)).toBe(0);
  });

  it("halves emissions when renewableRatio=0.5", () => {
    const usage: ApplianceUsage[] = [{ type: "heater", hours: 5 }];
    const full = calculateElectricityEmissions(usage, 0, 0);
    const half = calculateElectricityEmissions(usage, 0, 0.5);
    expect(half).toBeCloseTo(full * 0.5);
  });

  it("clamps renewableRatio > 1 to 1 (no negative emissions)", () => {
    const usage: ApplianceUsage[] = [{ type: "computer", hours: 3 }];
    expect(calculateElectricityEmissions(usage, 0, 2)).toBe(0);
  });

  it("clamps renewableRatio < 0 to 0 (full grid emissions)", () => {
    const usage: ApplianceUsage[] = [{ type: "television", hours: 2 }];
    const zeroRatio = calculateElectricityEmissions(usage, 0, 0);
    const negativeRatio = calculateElectricityEmissions(usage, 0, -1);
    expect(negativeRatio).toBeCloseTo(zeroRatio);
  });

  // ── Negative hours guard (covers the `if (item.hours < 0) continue` branch) ──
  it("skips appliance entries with negative hours", () => {
    const usage: ApplianceUsage[] = [
      { type: "airConditioner", hours: -5 },
      { type: "television", hours: 2 },
    ];
    const expected = EMISSION_FACTORS.appliances.television * 2 * GRID;
    expect(calculateElectricityEmissions(usage)).toBeCloseTo(expected);
  });

  it("returns 0 when all entries have negative hours", () => {
    const usage: ApplianceUsage[] = [
      { type: "heater", hours: -10 },
      { type: "computer", hours: -3 },
    ];
    expect(calculateElectricityEmissions(usage)).toBe(0);
  });

  // ── Unknown appliance type ?? 0 fallback ──────────────────────────────────
  it("returns 0 for an unknown appliance type (covers ?? 0 fallback)", () => {
    const usage = [{ type: "jetpack" as keyof typeof EMISSION_FACTORS.appliances, hours: 10 }];
    expect(calculateElectricityEmissions(usage)).toBe(0);
  });

  // ── All known appliance types ─────────────────────────────────────────────
  it("calculates emissions for all known appliance types", () => {
    const usage: ApplianceUsage[] = Object.keys(EMISSION_FACTORS.appliances).map((type) => ({
      type: type as ApplianceUsage["type"],
      hours: 1,
    }));
    const expectedKwh = Object.values(EMISSION_FACTORS.appliances).reduce((a, b) => a + b, 0);
    const result = calculateElectricityEmissions(usage, 0, 0);
    expect(result).toBeCloseTo(expectedKwh * GRID);
  });

  // ── Return type ───────────────────────────────────────────────────────────
  it("returns a number", () => {
    expect(typeof calculateElectricityEmissions([])).toBe("number");
  });

  // ── Zero hours edge case ──────────────────────────────────────────────────
  it("returns 0 for 0 hours on any appliance", () => {
    const usage: ApplianceUsage[] = [{ type: "airConditioner", hours: 0 }];
    expect(calculateElectricityEmissions(usage)).toBe(0);
  });
});
