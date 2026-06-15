/**
 * @module ActivityService Tests
 * Tests for the buildActivityConstraints utility.
 */
import { vi } from "vitest";
import { buildActivityConstraints } from "@/services/activityService";

// Use vi.hoisted so mock references are available in vi.mock factories
const fsMocks = vi.hoisted(() => ({
  where: vi.fn((field: string, operator: string, value: unknown) => ({
    kind: "where",
    field,
    operator,
    value,
  })),
  orderBy: vi.fn((field: string, direction: string) => ({
    kind: "orderBy",
    field,
    direction,
  })),
  Timestamp: {
    fromDate: vi.fn((date: Date) => `timestamp:${date.toISOString()}`),
  },
}));

vi.mock("firebase/firestore", () => ({
  where: fsMocks.where,
  orderBy: fsMocks.orderBy,
  Timestamp: fsMocks.Timestamp,
}));

describe("buildActivityConstraints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore default implementations after clearAllMocks
    fsMocks.where.mockImplementation((field: string, operator: string, value: unknown) => ({
      kind: "where",
      field,
      operator,
      value,
    }));
    fsMocks.orderBy.mockImplementation((field: string, direction: string) => ({
      kind: "orderBy",
      field,
      direction,
    }));
    fsMocks.Timestamp.fromDate.mockImplementation((date: Date) => `timestamp:${date.toISOString()}`);
  });

  it("builds baseline constraints for a user", () => {
    const constraints = buildActivityConstraints("user-1");

    expect(fsMocks.where).toHaveBeenCalledWith("userId", "==", "user-1");
    expect(fsMocks.orderBy).toHaveBeenCalledWith("date", "desc");
    expect(constraints).toHaveLength(2);
  });

  it("adds category and date filters when provided", () => {
    const startDate = new Date("2026-06-01T00:00:00Z");
    const endDate = new Date("2026-06-30T00:00:00Z");

    const constraints = buildActivityConstraints("user-1", {
      category: "food",
      startDate,
      endDate,
    });

    expect(fsMocks.Timestamp.fromDate).toHaveBeenCalledWith(startDate);
    expect(fsMocks.Timestamp.fromDate).toHaveBeenCalledWith(endDate);
    expect(constraints).toEqual([
      { kind: "where", field: "userId", operator: "==", value: "user-1" },
      { kind: "orderBy", field: "date", direction: "desc" },
      { kind: "where", field: "category", operator: "==", value: "food" },
      { kind: "where", field: "date", operator: ">=", value: `timestamp:${startDate.toISOString()}` },
      { kind: "where", field: "date", operator: "<=", value: `timestamp:${endDate.toISOString()}` },
    ]);
  });

  it("adds only category filter when only category is provided", () => {
    const constraints = buildActivityConstraints("user-1", { category: "transport" });

    expect(constraints).toHaveLength(3);
    expect(constraints[2]).toMatchObject({ field: "category", operator: "==", value: "transport" });
    expect(fsMocks.Timestamp.fromDate).not.toHaveBeenCalled();
  });

  it("adds only startDate filter when only startDate is provided", () => {
    const startDate = new Date("2026-06-01T00:00:00Z");
    const constraints = buildActivityConstraints("user-1", { startDate });

    expect(constraints).toHaveLength(3);
    expect(fsMocks.Timestamp.fromDate).toHaveBeenCalledWith(startDate);
    expect(fsMocks.Timestamp.fromDate).toHaveBeenCalledTimes(1);
  });

  it("adds only endDate filter when only endDate is provided", () => {
    const endDate = new Date("2026-06-30T00:00:00Z");
    const constraints = buildActivityConstraints("user-1", { endDate });

    expect(constraints).toHaveLength(3);
    expect(fsMocks.Timestamp.fromDate).toHaveBeenCalledWith(endDate);
    expect(fsMocks.Timestamp.fromDate).toHaveBeenCalledTimes(1);
  });

  it("handles empty filter object", () => {
    const constraints = buildActivityConstraints("user-1", {});
    expect(constraints).toHaveLength(2);
  });
});
