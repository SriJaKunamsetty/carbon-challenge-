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
});
