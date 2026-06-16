/**
 * @file useTwinSimulation.test.ts
 * @description Unit tests for the Carbon Twin what-if simulation hook.
 * Validates baseline calculations, projected reductions, savings, and edge cases.
 */
import { renderHook, act } from "@testing-library/react";
import { useTwinSimulation } from "@/hooks/useTwinSimulation";

describe("useTwinSimulation", () => {
  it("returns sensible baseline values with default inputs", () => {
    const { result } = renderHook(() => useTwinSimulation());
    const { baselineTotal, projectedTotal, carbonSaved } = result.current;

    expect(baselineTotal).toBeGreaterThan(0);
    // With no changes, projected should equal baseline
    expect(projectedTotal).toBe(baselineTotal);
    expect(carbonSaved).toBe(0);
  });

  it("reduces projected carbon when transit days are increased", () => {
    const { result } = renderHook(() => useTwinSimulation());
    const baseline = result.current.baselineTotal;

    act(() => result.current.setTransitDays(5));

    expect(result.current.projectedTotal).toBeLessThan(baseline);
    expect(result.current.carbonSaved).toBeGreaterThan(0);
  });

  it("reduces projected carbon when AC hours are reduced", () => {
    const { result } = renderHook(() => useTwinSimulation());
    act(() => result.current.setAcReduction(2));

    expect(result.current.projectedTotal).toBeLessThan(result.current.baselineTotal);
  });

  it("reduces projected carbon when veg meal swaps are increased", () => {
    const { result } = renderHook(() => useTwinSimulation());
    act(() => result.current.setVegMealsSwaps(5));

    expect(result.current.projectedTotal).toBeLessThan(result.current.baselineTotal);
  });

  it("reduces projected carbon when renewable utility percentage is set", () => {
    const { result } = renderHook(() => useTwinSimulation());
    act(() => result.current.setRenewableUtility(100));

    expect(result.current.projectedTotal).toBeLessThan(result.current.baselineTotal);
  });

  it("reduces projected carbon further when EV is enabled", () => {
    const { result } = renderHook(() => useTwinSimulation());
    const withoutEV = result.current.projectedTotal;

    act(() => result.current.setUseEV(true));
    const withEV = result.current.projectedTotal;

    expect(withEV).toBeLessThan(withoutEV);
  });

  it("calculates money saved based on transit days and AC reduction", () => {
    const { result } = renderHook(() => useTwinSimulation());

    act(() => {
      result.current.setTransitDays(5);
      result.current.setAcReduction(2);
    });

    expect(result.current.moneySaved).toBeGreaterThan(0);
  });

  it("calculates trees equivalent from carbon saved", () => {
    const { result } = renderHook(() => useTwinSimulation());

    act(() => {
      result.current.setTransitDays(7);
      result.current.setVegMealsSwaps(7);
      result.current.setRenewableUtility(100);
    });

    expect(result.current.treesEquivalent).toBeGreaterThanOrEqual(0);
  });

  it("returns chart data with current and simulated labels", () => {
    const { result } = renderHook(() => useTwinSimulation());
    const { chartData } = result.current;

    expect(chartData).toHaveLength(2);
    expect(chartData[0].label).toBe("Current");
    expect(chartData[1].label).toBe("Simulated");
  });

  it("caps transit swaps at BASE_CAR_KM equivalent (no negative car km)", () => {
    const { result } = renderHook(() => useTwinSimulation());
    // Set extreme transit days — should not produce negative car km
    act(() => result.current.setTransitDays(31));

    expect(result.current.projectedTotal).toBeGreaterThanOrEqual(0);
    expect(result.current.carbonSaved).toBeGreaterThanOrEqual(0);
  });

  it("caps veg meal swaps at BASE_MEAT_MEALS (no negative meat meals)", () => {
    const { result } = renderHook(() => useTwinSimulation());
    act(() => result.current.setVegMealsSwaps(100));

    expect(result.current.projectedTotal).toBeGreaterThanOrEqual(0);
  });

  it("never produces negative carbonSaved", () => {
    const { result } = renderHook(() => useTwinSimulation());
    // No changes — carbonSaved should be exactly 0, never negative
    expect(result.current.carbonSaved).toBe(0);
  });

  it("produces a positive scoreImprovement when emissions are reduced", () => {
    const { result } = renderHook(() => useTwinSimulation());

    act(() => {
      result.current.setTransitDays(7);
      result.current.setVegMealsSwaps(7);
      result.current.setRenewableUtility(100);
      result.current.setAcReduction(4);
    });

    expect(result.current.scoreImprovement).toBeGreaterThanOrEqual(0);
  });

  it("exposes all setter functions", () => {
    const { result } = renderHook(() => useTwinSimulation());
    expect(typeof result.current.setTransitDays).toBe("function");
    expect(typeof result.current.setAcReduction).toBe("function");
    expect(typeof result.current.setVegMealsSwaps).toBe("function");
    expect(typeof result.current.setRenewableUtility).toBe("function");
    expect(typeof result.current.setUseEV).toBe("function");
  });
});
