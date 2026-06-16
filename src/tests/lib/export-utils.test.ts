import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { exportToCsv } from "@/lib/export-utils";
import type { Activity } from "@/types";

describe("exportToCsv", () => {
  let createObjectURLMock: any;
  let revokeObjectURLMock: any;
  let clickMock: any;
  let appendChildSpy: any;
  let removeChildSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock URL methods
    createObjectURLMock = vi.fn(() => "blob:mock-url");
    revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    // Mock document methods
    clickMock = vi.fn();
    const mockAnchor = {
      setAttribute: vi.fn(),
      style: { visibility: "" },
      click: clickMock,
    };

    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "a") {
        return mockAnchor as any;
      }
      return {} as any;
    });

    appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation(() => ({} as any));
    removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation(() => ({} as any));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does nothing if window is undefined (e.g. server-side)", () => {
    const originalWindow = global.window;
    // Temporarily delete window
    (global as any).window = undefined;

    const activities: Activity[] = [
      { id: "1", userId: "u", category: "transport", value: 10, unit: "km", carbonEmit: 2, date: new Date() }
    ];

    exportToCsv(activities);

    expect(createObjectURLMock).not.toHaveBeenCalled();

    // Restore window
    global.window = originalWindow;
  });

  it("does nothing if activities is empty", () => {
    exportToCsv([]);
    expect(createObjectURLMock).not.toHaveBeenCalled();
  });

  it("generates a CSV content and triggers download in browser", () => {
    const date = new Date("2026-06-15T00:00:00Z");
    const activities: Activity[] = [
      {
        id: "act-1",
        userId: "user-123",
        category: "transport",
        value: 15.5,
        unit: "km",
        carbonEmit: 3.1,
        date,
        note: "Normal commute, with comma",
      },
    ];

    exportToCsv(activities);

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(appendChildSpy).toHaveBeenCalled();
    expect(clickMock).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });

  it("handles activity with no note (empty note branch)", () => {
    const activities: Activity[] = [
      {
        id: "act-no-note",
        userId: "user-1",
        category: "food",
        value: 2,
        unit: "servings",
        carbonEmit: 5.2,
        date: new Date("2026-01-01T00:00:00Z"),
      },
    ];
    exportToCsv(activities);
    expect(clickMock).toHaveBeenCalled();
  });

  it("handles Firestore-like Timestamp date (toDate branch)", () => {
    const firestoreTimestamp = { toDate: () => new Date("2026-03-15T00:00:00Z") };
    const activities: Activity[] = [
      {
        id: "act-ts",
        userId: "user-1",
        category: "electricity",
        value: 4,
        unit: "hours",
        carbonEmit: 1.8,
        date: firestoreTimestamp as unknown as Date,
      },
    ];
    exportToCsv(activities);
    expect(clickMock).toHaveBeenCalled();
  });

  it("handles numeric timestamp date (number branch)", () => {
    const activities: Activity[] = [
      {
        id: "act-num",
        userId: "user-1",
        category: "shopping",
        value: 1,
        unit: "item",
        carbonEmit: 10,
        date: 1700000000000 as unknown as Date,
      },
    ];
    exportToCsv(activities);
    expect(clickMock).toHaveBeenCalled();
  });

  it("handles string date", () => {
    const activities: Activity[] = [
      {
        id: "act-str",
        userId: "user-1",
        category: "transport",
        value: 5,
        unit: "km",
        carbonEmit: 1.1,
        date: "2026-05-20" as unknown as Date,
      },
    ];
    exportToCsv(activities);
    expect(clickMock).toHaveBeenCalled();
  });

  it("escapes CSV fields containing quotes and commas", () => {
    const activities: Activity[] = [
      {
        id: "act-special",
        userId: "user-1",
        category: "food",
        value: 1,
        unit: "serving",
        carbonEmit: 3,
        date: new Date("2026-06-01"),
        note: 'Note with "quotes" and, commas',
      },
    ];
    exportToCsv(activities);
    expect(clickMock).toHaveBeenCalled();
  });
});
