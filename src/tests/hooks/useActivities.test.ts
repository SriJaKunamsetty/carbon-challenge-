/**
 * @module useActivities Tests
 * Tests for the useActivities hook that manages activity CRUD operations.
 */
import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";
import { useActivities, calculateStreak } from "@/hooks/useActivities";

// ─── Hoisted Mock Functions ───────────────────────────────────────────────────

const fsMocks = vi.hoisted(() => ({
  collection: vi.fn(() => "activitiesRef"),
  query: vi.fn(() => "activitiesQuery"),
  limit: vi.fn((value: number) => `limit:${value}`),
  startAfter: vi.fn((value: unknown) => `startAfter:${String(value)}`),
  onSnapshot: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(() => "activityDocRef"),
  getDocs: vi.fn(),
  serverTimestamp: vi.fn(() => "server-timestamp"),
}));

const servicesMocks = vi.hoisted(() => ({
  buildActivityConstraints: vi.fn(() => ["baseConstraint"]),
}));

vi.mock("@/lib/firebase", () => ({
  db: {},
}));

vi.mock("@/services", () => ({
  buildActivityConstraints: servicesMocks.buildActivityConstraints,
}));

vi.mock("firebase/firestore", () => {
  class Timestamp {
    constructor(public seconds: number, public nanoseconds: number) {}
    toDate() {
      return new Date(this.seconds * 1000);
    }
  }
  return {
    collection: fsMocks.collection,
    query: fsMocks.query,
    limit: fsMocks.limit,
    startAfter: fsMocks.startAfter,
    onSnapshot: fsMocks.onSnapshot,
    addDoc: fsMocks.addDoc,
    deleteDoc: fsMocks.deleteDoc,
    doc: fsMocks.doc,
    getDocs: fsMocks.getDocs,
    serverTimestamp: fsMocks.serverTimestamp,
    Timestamp,
  };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createActivityDoc(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    data: () => ({
      userId: "user123",
      category: "transport",
      value: 12,
      unit: "km",
      carbonEmit: 2.4,
      date: new Date("2026-06-12T00:00:00Z"),
      ...overrides,
    }),
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useActivities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    servicesMocks.buildActivityConstraints.mockReturnValue(["baseConstraint"]);
    fsMocks.collection.mockReturnValue("activitiesRef");
    fsMocks.query.mockReturnValue("activitiesQuery");
    fsMocks.doc.mockReturnValue("activityDocRef");
    fsMocks.serverTimestamp.mockReturnValue("server-timestamp");
    fsMocks.limit.mockImplementation((value: number) => `limit:${value}`);
    fsMocks.startAfter.mockImplementation((value: unknown) => `startAfter:${String(value)}`);
  });

  it("returns an empty settled state when no user is authenticated", () => {
    const { result } = renderHook(() => useActivities({ userId: null }));

    expect(result.current.activities).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.hasMore).toBe(false);
    expect(fsMocks.onSnapshot).not.toHaveBeenCalled();
  });

  it("subscribes to the top-level activities collection and trims the first page", () => {
    fsMocks.onSnapshot.mockImplementation((_queryRef: unknown, onNext: (snap: unknown) => void) => {
      onNext({
        docs: [
          createActivityDoc("activity-1"),
          createActivityDoc("activity-2", { note: "Train commute" }),
          createActivityDoc("activity-3"),
        ],
      });
      return vi.fn();
    });

    const { result } = renderHook(() =>
      useActivities({ userId: "user123", pageSize: 2, filter: { category: "transport" } })
    );

    expect(fsMocks.collection).toHaveBeenCalledWith({}, "activities");
    expect(servicesMocks.buildActivityConstraints).toHaveBeenCalledWith("user123", { category: "transport" });
    expect(fsMocks.limit).toHaveBeenCalledWith(3);
    expect(fsMocks.query).toHaveBeenCalled();
    expect(result.current.activities).toHaveLength(2);
    expect(result.current.activities[1].note).toBe("Train commute");
    expect(result.current.hasMore).toBe(true);
    expect(result.current.loading).toBe(false);
  });

  it("surfaces subscription errors", () => {
    fsMocks.onSnapshot.mockImplementation((_queryRef: unknown, _onNext: unknown, onError: ((err: Error) => void) | undefined) => {
      onError?.(new Error("permission denied"));
      return vi.fn();
    });

    const { result } = renderHook(() => useActivities({ userId: "user123" }));

    expect(result.current.error).toBe("permission denied");
    expect(result.current.loading).toBe(false);
  });

  it("loads the next page when more activities are available", async () => {
    fsMocks.onSnapshot.mockImplementation((_queryRef: unknown, onNext: (snap: unknown) => void) => {
      onNext({
        docs: [
          createActivityDoc("activity-1"),
          createActivityDoc("activity-2"),
          createActivityDoc("activity-3"),
        ],
      });
      return vi.fn();
    });

    fsMocks.getDocs.mockResolvedValue({
      docs: [
        createActivityDoc("activity-4"),
        createActivityDoc("activity-5"),
      ],
    });

    const { result } = renderHook(() => useActivities({ userId: "user123", pageSize: 2 }));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(fsMocks.startAfter).toHaveBeenCalled();
    expect(fsMocks.getDocs).toHaveBeenCalled();
    expect(result.current.activities.map((activity) => activity.id)).toEqual([
      "activity-1",
      "activity-2",
      "activity-4",
      "activity-5",
    ]);
    expect(result.current.hasMore).toBe(false);
  });

  it("refreshes the subscription on demand", async () => {
    fsMocks.onSnapshot.mockImplementation((_queryRef: unknown, onNext: (snap: unknown) => void) => {
      onNext({ docs: [createActivityDoc("activity-1")] });
      return vi.fn();
    });

    const { result } = renderHook(() => useActivities({ userId: "user123" }));
    expect(fsMocks.onSnapshot).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.refresh();
    });

    expect(fsMocks.onSnapshot).toHaveBeenCalledTimes(2);
  });

  it("adds a new activity to the top-level collection", async () => {
    fsMocks.onSnapshot.mockImplementation(() => vi.fn());
    fsMocks.addDoc.mockResolvedValue({ id: "new-activity" });

    const { result } = renderHook(() => useActivities({ userId: "user123" }));

    let createdId = "";
    await act(async () => {
      createdId = await result.current.addActivity({
        userId: "user123",
        category: "transport",
        value: 18,
        unit: "km",
        carbonEmit: 3.1,
        date: new Date("2026-06-12T00:00:00Z"),
        note: "Evening commute",
      });
    });

    expect(fsMocks.serverTimestamp).toHaveBeenCalled();
    expect(fsMocks.addDoc).toHaveBeenCalledWith("activitiesRef", expect.objectContaining({
      note: "Evening commute",
      createdAt: "server-timestamp",
    }));
    expect(createdId).toBe("new-activity");
  });

  it("deletes an activity from the top-level collection", async () => {
    fsMocks.onSnapshot.mockImplementation(() => vi.fn());
    fsMocks.deleteDoc.mockResolvedValue(undefined);

    const { result } = renderHook(() => useActivities({ userId: "user123" }));

    await act(async () => {
      await result.current.deleteActivity("activity-9");
    });

    expect(fsMocks.doc).toHaveBeenCalledWith({}, "activities", "activity-9");
    expect(fsMocks.deleteDoc).toHaveBeenCalledWith("activityDocRef");
  });

  it("throws guardrail errors for unauthenticated mutations", async () => {
    const { result } = renderHook(() => useActivities({ userId: null }));

    await expect(
      result.current.addActivity({
        userId: "user123",
        category: "transport",
        value: 18,
        unit: "km",
        carbonEmit: 3.1,
        date: new Date("2026-06-12T00:00:00Z"),
      })
    ).rejects.toThrow("Cannot add activity: no authenticated user");

    await expect(result.current.deleteActivity("activity-2")).rejects.toThrow(
      "Cannot delete activity: no authenticated user"
    );
  });

  it("returns early from loadMore if hasMore is false", async () => {
    fsMocks.onSnapshot.mockImplementation(() => vi.fn());
    const { result } = renderHook(() => useActivities({ userId: "user123" }));
    
    // initially hasMore is false
    await act(async () => {
      await result.current.loadMore();
    });
    
    expect(fsMocks.getDocs).not.toHaveBeenCalled();
  });

  it("sets hasMore=true and paginates when loadMore returns more than pageSize docs", async () => {
    // Set up initial snapshot with pageSize+1 docs so hasMore=true
    fsMocks.onSnapshot.mockImplementation((_queryRef: unknown, onNext: (snap: unknown) => void) => {
      onNext({
        docs: [
          createActivityDoc("activity-1"),
          createActivityDoc("activity-2"),
          createActivityDoc("activity-3"), // extra doc signals more pages
        ],
      });
      return vi.fn();
    });

    // loadMore returns pageSize+1 docs → triggers the hasMore=true branch with early return
    fsMocks.getDocs.mockResolvedValue({
      docs: [
        createActivityDoc("activity-4"),
        createActivityDoc("activity-5"),
        createActivityDoc("activity-6"), // extra doc = more pages exist
      ],
    });

    const { result } = renderHook(() => useActivities({ userId: "user123", pageSize: 2 }));

    await act(async () => {
      await result.current.loadMore();
    });

    // After loadMore with 3 docs > pageSize 2: hasMore should be true, only 2 new appended
    expect(result.current.hasMore).toBe(true);
    expect(fsMocks.getDocs).toHaveBeenCalled();
  });

  describe("calculateStreak", () => {
    it("returns 0 if activities is empty", () => {
      expect(calculateStreak([])).toBe(0);
    });

    it("returns 0 if the latest activity is older than yesterday", () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const activities = [
        { id: "1", date: threeDaysAgo, userId: "u", category: "transport", value: 1, unit: "km", carbonEmit: 1 }
      ];
      expect(calculateStreak(activities as any)).toBe(0);
    });

    it("returns 1 if the latest activity is today", () => {
      const today = new Date();
      const activities = [
        { id: "1", date: today, userId: "u", category: "transport", value: 1, unit: "km", carbonEmit: 1 }
      ];
      expect(calculateStreak(activities as any)).toBe(1);
    });

    it("returns 2 if activities logged today and yesterday", () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      
      const activities = [
        { id: "1", date: today, userId: "u", category: "transport", value: 1, unit: "km", carbonEmit: 1 },
        { id: "2", date: yesterday, userId: "u", category: "transport", value: 1, unit: "km", carbonEmit: 1 }
      ];
      expect(calculateStreak(activities as any)).toBe(2);
    });

    it("returns 3 if activities logged today, yesterday, and two days ago, ignoring duplicates", () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(today.getDate() - 2);
      
      const activities = [
        { id: "1", date: today, userId: "u", category: "transport", value: 1, unit: "km", carbonEmit: 1 },
        { id: "2", date: today, userId: "u", category: "food", value: 1, unit: "servings", carbonEmit: 1 }, // duplicate date
        { id: "3", date: yesterday, userId: "u", category: "transport", value: 1, unit: "km", carbonEmit: 1 },
        { id: "4", date: twoDaysAgo, userId: "u", category: "transport", value: 1, unit: "km", carbonEmit: 1 }
      ];
      expect(calculateStreak(activities as any)).toBe(3);
    });
  });
});
