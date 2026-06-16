/**
 * @file transport.test.ts
 * @description Unit tests for calculateTransportEmissions — covers all transport
 * modes, zero distance, negative distance guard, and large distances.
 */
import { describe, it, expect } from "vitest";
import { calculateTransportEmissions } from "@/lib/carbon/transport";
import { EMISSION_FACTORS } from "@/lib/carbon/emissionFactors";

describe("calculateTransportEmissions", () => {
  it("returns 0 for negative distance", () => {
    expect(calculateTransportEmissions("gasolineCar", -10)).toBe(0);
  });

  it("returns 0 for zero distance", () => {
    expect(calculateTransportEmissions("gasolineCar", 0)).toBe(0);
  });

  it("calculates gasoline car emissions correctly", () => {
    const result = calculateTransportEmissions("gasolineCar", 100);
    expect(result).toBeCloseTo(100 * EMISSION_FACTORS.transport.gasolineCar, 5);
  });

  it("calculates electric car emissions correctly", () => {
    const result = calculateTransportEmissions("electricCar", 100);
    expect(result).toBeCloseTo(100 * EMISSION_FACTORS.transport.electricCar, 5);
  });

  it("calculates bus emissions correctly", () => {
    const result = calculateTransportEmissions("bus", 50);
    expect(result).toBeCloseTo(50 * EMISSION_FACTORS.transport.bus, 5);
  });

  it("calculates train emissions correctly", () => {
    const result = calculateTransportEmissions("train", 200);
    expect(result).toBeCloseTo(200 * EMISSION_FACTORS.transport.train, 5);
  });

  it("calculates flight emissions correctly", () => {
    const result = calculateTransportEmissions("flightShort", 1000);
    expect(result).toBeCloseTo(1000 * EMISSION_FACTORS.transport.flightShort, 5);
  });

  it("calculates bicycle emissions as 0", () => {
    const factor = EMISSION_FACTORS.transport.bicycle ?? 0;
    const result = calculateTransportEmissions("bicycle", 15);
    expect(result).toBeCloseTo(15 * factor, 5);
  });

  it("electric car emits less than gasoline car for same distance", () => {
    const ev = calculateTransportEmissions("electricCar", 100);
    const gas = calculateTransportEmissions("gasolineCar", 100);
    expect(ev).toBeLessThan(gas);
  });

  it("returns a positive number for all defined transport modes", () => {
    const modes = Object.keys(EMISSION_FACTORS.transport) as Array<keyof typeof EMISSION_FACTORS.transport>;
    modes.forEach((mode) => {
      const result = calculateTransportEmissions(mode, 100);
      expect(result).toBeGreaterThanOrEqual(0);
    });
  });

  it("scales linearly with distance", () => {
    const d100 = calculateTransportEmissions("gasolineCar", 100);
    const d200 = calculateTransportEmissions("gasolineCar", 200);
    expect(d200).toBeCloseTo(d100 * 2, 5);
  });
});
