import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMonthlyReport } from "@/hooks/useMonthlyReport";
import type { Activity } from "@/types";
import { Timestamp } from "firebase/firestore";

describe("useMonthlyReport", () => {
  const createMockActivity = (date: Date, carbon: number, category: Activity["category"] = "transport"): Activity => ({
    id: "act-id",
    userId: "user-123",
    category,
    value: 10,
    unit: "km",
    carbonEmit: carbon,
    date,
  });

  it("calculates current and previous month totals, comparison, and category breakdown", () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const today = new Date(currentYear, currentMonth, 15);
    const lastMonth = new Date(currentYear, currentMonth - 1, 15);
    const twoMonthsAgo = new Date(currentYear, currentMonth - 2, 15);

    const activities: Activity[] = [
      createMockActivity(today, 100, "transport"),
      createMockActivity(today, 50, "food"),
      createMockActivity(lastMonth, 200, "transport"),
      createMockActivity(twoMonthsAgo, 300, "electricity"),
    ];

    const { result } = renderHook(() => useMonthlyReport(activities));

    expect(result.current.monthlyCarbon).toBe(150);
    expect(result.current.prevMonthlyCarbon).toBe(200);
    expect(result.current.comparisonPercent).toBe(-25);
    expect(result.current.categoryBreakdown).toEqual({
      transport: 100,
      food: 50,
    });
  });

  it("assigns grade A for carbon < 200", () => {
    const now = new Date();
    const activities = [createMockActivity(now, 150)];
    const { result } = renderHook(() => useMonthlyReport(activities));
    expect(result.current.grade).toBe("A");
    expect(result.current.gradeExplanation).toContain("Outstanding");
  });

  it("assigns grade B for carbon between 200 and 349", () => {
    const now = new Date();
    const activities = [createMockActivity(now, 300)];
    const { result } = renderHook(() => useMonthlyReport(activities));
    expect(result.current.grade).toBe("B");
    expect(result.current.gradeExplanation).toContain("Great job");
  });

  it("assigns grade C for carbon between 350 and 499", () => {
    const now = new Date();
    const activities = [createMockActivity(now, 450)];
    const { result } = renderHook(() => useMonthlyReport(activities));
    expect(result.current.grade).toBe("C");
    expect(result.current.gradeExplanation).toContain("Good effort");
  });

  it("assigns grade D for carbon between 500 and 649", () => {
    const now = new Date();
    const activities = [createMockActivity(now, 600)];
    const { result } = renderHook(() => useMonthlyReport(activities));
    expect(result.current.grade).toBe("D");
    expect(result.current.gradeExplanation).toContain("Caution");
  });

  it("assigns grade F for carbon >= 650", () => {
    const now = new Date();
    const activities = [createMockActivity(now, 700)];
    const { result } = renderHook(() => useMonthlyReport(activities));
    expect(result.current.grade).toBe("F");
    expect(result.current.gradeExplanation).toContain("Critical limit");
  });

  it("handles Firestore Timestamp dates correctly", () => {
    const now = new Date();
    const mockTimestamp = {
      seconds: Math.floor(now.getTime() / 1000),
      nanoseconds: 0,
      toDate: () => now,
    } as any;

    const activities = [createMockActivity(mockTimestamp, 100)];
    const { result } = renderHook(() => useMonthlyReport(activities));
    expect(result.current.monthlyCarbon).toBe(100);
  });
});
