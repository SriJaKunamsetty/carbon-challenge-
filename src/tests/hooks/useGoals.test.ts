/**
 * @module useGoals Tests
 * Tests for the useGoals hook that manages goal CRUD operations.
 */
import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import { useGoals } from "@/hooks/useGoals";

// ─── Hoisted Mock Functions ───────────────────────────────────────────────────

const fsMocks = vi.hoisted(() => ({
  collection: vi.fn(() => "goalsRef"),
  query: vi.fn(() => "goalsQuery"),
  where: vi.fn((field: string, operator: string, value: string) => `${field}:${operator}:${value}`),
  orderBy: vi.fn((field: string, direction: string) => `${field}:${direction}`),
  onSnapshot: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => "goalDocRef"),
  serverTimestamp: vi.fn(() => "server-timestamp"),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("firebase/firestore", () => {
  class Timestamp {
    constructor(public seconds: number, public nanoseconds: number) {}
    toDate() {
      return new Date(this.seconds * 1000);
    }
    static fromDate(date: Date) {
      return new Timestamp(Math.floor(date.getTime() / 1000), 0);
    }
  }
  return {
    collection: fsMocks.collection,
    query: fsMocks.query,
    where: fsMocks.where,
    orderBy: fsMocks.orderBy,
    onSnapshot: fsMocks.onSnapshot,
    addDoc: fsMocks.addDoc,
    updateDoc: fsMocks.updateDoc,
    deleteDoc: fsMocks.deleteDoc,
    doc: fsMocks.doc,
    serverTimestamp: fsMocks.serverTimestamp,
    Timestamp,
  };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createGoalDoc(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    data: () => ({
      userId: "user123",
      title: "Use transit twice a week",
      category: "transport",
      targetValue: 40,
      currentValue: 12,
      status: "active",
      deadline: new Date("2026-07-01T00:00:00Z"),
      createdAt: new Date("2026-06-12T00:00:00Z"),
      ...overrides,
    }),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useGoals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fsMocks.collection.mockReturnValue("goalsRef");
    fsMocks.query.mockReturnValue("goalsQuery");
    fsMocks.doc.mockReturnValue("goalDocRef");
    fsMocks.serverTimestamp.mockReturnValue("server-timestamp");
    fsMocks.where.mockImplementation((field: string, operator: string, value: string) => `${field}:${operator}:${value}`);
    fsMocks.orderBy.mockImplementation((field: string, direction: string) => `${field}:${direction}`);
  });

  it("returns an empty settled state when no user is authenticated", () => {
    const { result } = renderHook(() => useGoals(null));

    expect(result.current.goals).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(fsMocks.onSnapshot).not.toHaveBeenCalled();
  });

  it("subscribes to the top-level goals collection", () => {
    fsMocks.onSnapshot.mockImplementation((_queryRef: unknown, onNext: (snap: unknown) => void) => {
      onNext({ docs: [createGoalDoc("goal-1")] });
      return vi.fn();
    });

    const { result } = renderHook(() => useGoals("user123"));

    expect(fsMocks.collection).toHaveBeenCalledWith({}, "goals");
    expect(fsMocks.where).toHaveBeenCalledWith("userId", "==", "user123");
    expect(fsMocks.orderBy).toHaveBeenCalledWith("createdAt", "desc");
    expect(fsMocks.query).toHaveBeenCalled();
    expect(result.current.goals).toHaveLength(1);
    expect(result.current.goals[0].title).toBe("Use transit twice a week");
    expect(result.current.loading).toBe(false);
  });

  it("surfaces subscription errors", () => {
    fsMocks.onSnapshot.mockImplementation((_queryRef: unknown, _onNext: unknown, onError: ((err: Error) => void) | undefined) => {
      onError?.(new Error("goals unavailable"));
      return vi.fn();
    });

    const { result } = renderHook(() => useGoals("user123"));

    expect(result.current.error).toBe("goals unavailable");
    expect(result.current.loading).toBe(false);
  });

  it("adds a goal to the top-level goals collection", async () => {
    fsMocks.onSnapshot.mockImplementation(() => vi.fn());
    fsMocks.addDoc.mockResolvedValue({ id: "goal-2" });

    const { result } = renderHook(() => useGoals("user123"));

    let goalId = "";
    await act(async () => {
      goalId = await result.current.addGoal({
        userId: "user123",
        title: "Cut shopping emissions",
        category: "shopping",
        targetValue: 25,
        deadline: new Date("2026-08-01T00:00:00Z") as never,
      });
    });

    expect(fsMocks.serverTimestamp).toHaveBeenCalled();
    expect(fsMocks.addDoc).toHaveBeenCalledWith("goalsRef", expect.objectContaining({
      title: "Cut shopping emissions",
      currentValue: 0,
      status: "active",
      createdAt: "server-timestamp",
    }));
    expect(goalId).toBe("goal-2");
  });

  it("updates and deletes goals through top-level document paths", async () => {
    fsMocks.onSnapshot.mockImplementation(() => vi.fn());
    fsMocks.updateDoc.mockResolvedValue(undefined);
    fsMocks.deleteDoc.mockResolvedValue(undefined);

    const { result } = renderHook(() => useGoals("user123"));

    await act(async () => {
      await result.current.updateGoal("goal-5", { title: "Updated goal" });
      await result.current.deleteGoal("goal-5");
    });

    expect(fsMocks.doc).toHaveBeenCalledWith({}, "goals", "goal-5");
    expect(fsMocks.updateDoc).toHaveBeenCalledWith("goalDocRef", { title: "Updated goal" });
    expect(fsMocks.deleteDoc).toHaveBeenCalledWith("goalDocRef");
  });

  it("marks a goal completed using its target value", async () => {
    fsMocks.onSnapshot.mockImplementation((_queryRef: unknown, onNext: (snap: unknown) => void) => {
      onNext({
        docs: [createGoalDoc("goal-8", { targetValue: 60, currentValue: 10 })],
      });
      return vi.fn();
    });
    fsMocks.updateDoc.mockResolvedValue(undefined);

    const { result } = renderHook(() => useGoals("user123"));

    await act(async () => {
      await result.current.completeGoal("goal-8");
    });

    expect(fsMocks.updateDoc).toHaveBeenCalledWith("goalDocRef", {
      status: "completed",
      currentValue: 60,
    });
  });

  it("throws guardrail errors for unauthenticated goal mutations", async () => {
    const { result } = renderHook(() => useGoals(null));

    await expect(
      result.current.addGoal({
        userId: "user123",
        title: "Goal",
        category: "general",
        targetValue: 10,
        deadline: new Date("2026-08-01T00:00:00Z") as never,
      })
    ).rejects.toThrow("Cannot add goal: no authenticated user");

    await expect(result.current.updateGoal("goal-1", { title: "x" })).rejects.toThrow(
      "Cannot update goal: no authenticated user"
    );
    await expect(result.current.deleteGoal("goal-1")).rejects.toThrow(
      "Cannot delete goal: no authenticated user"
    );
    await expect(result.current.completeGoal("goal-1")).rejects.toThrow(
      "Cannot complete goal: no authenticated user"
    );
  });

  it("updates goal progress correctly based on activities", async () => {
    fsMocks.onSnapshot.mockImplementation((_queryRef: unknown, onNext: (snap: unknown) => void) => {
      onNext({
        docs: [
          createGoalDoc("goal-active", {
            category: "transport",
            targetValue: 50,
            currentValue: 10,
            status: "active",
            createdAt: new Date("2026-06-12T00:00:00Z"),
            deadline: new Date("2026-06-20T00:00:00Z"),
          }),
        ],
      });
      return vi.fn();
    });
    fsMocks.updateDoc.mockResolvedValue(undefined);

    const activities = [
      {
        id: "act-1",
        userId: "user123",
        category: "transport",
        value: 10,
        unit: "km",
        carbonEmit: 30,
        date: new Date("2026-06-15T00:00:00Z"),
      },
      {
        id: "act-2",
        userId: "user123",
        category: "food", // different category, should be ignored
        value: 5,
        unit: "servings",
        carbonEmit: 10,
        date: new Date("2026-06-15T00:00:00Z"),
      },
      {
        id: "act-3",
        userId: "user123",
        category: "transport",
        value: 10,
        unit: "km",
        carbonEmit: 25, // total transport carbon = 55 (>= targetValue 50)
        date: new Date("2026-06-16T00:00:00Z"),
      },
    ] as any[];

    const { result } = renderHook(() => useGoals("user123", activities));

    await act(async () => {
      if (result.current.updateGoalProgress) {
        await result.current.updateGoalProgress(activities);
      }
    });

    expect(fsMocks.updateDoc).toHaveBeenCalledWith("goalDocRef", {
      currentValue: 55,
      status: "completed",
    });
  });

  it("returns empty state without subscribing when userId is null", async () => {
    const { result } = renderHook(() => useGoals(null, []));
    // Should not call onSnapshot (no Firestore subscription when userId is absent)
    expect(fsMocks.onSnapshot).not.toHaveBeenCalled();
    expect(result.current.goals).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
