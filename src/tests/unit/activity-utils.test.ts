import { describe, it, expect } from "vitest";
import { Timestamp } from "firebase/firestore";
import { toDate, calculateStreak } from "@/lib/activity-utils";
import type { Activity } from "@/types";

describe("activity-utils", () => {
  describe("toDate", () => {
    it("handles Timestamp instance", () => {
      const ts = new Timestamp(1718300000, 0); // ~ June 2024
      const result = toDate(ts);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(ts.toDate().getTime());
    });

    it("handles Date instance", () => {
      const date = new Date("2026-06-13T12:00:00Z");
      const result = toDate(date);
      expect(result).toBe(date);
    });

    it("handles object with toDate function", () => {
      const customObj = {
        toDate: () => new Date("2026-05-01T00:00:00Z"),
      };
      const result = toDate(customObj);
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe("2026-05-01T00:00:00.000Z");
    });

    it("handles date string", () => {
      const dateStr = "2026-01-15T08:30:00Z";
      const result = toDate(dateStr);
      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe("2026-01-15T08:30:00.000Z");
    });

    it("handles numeric timestamp", () => {
      const num = 1776510000000;
      const result = toDate(num);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(num);
    });

    it("falls back to current date for null/undefined/invalid types", () => {
      const before = Date.now();
      const result = toDate(null);
      const after = Date.now();
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe("calculateStreak", () => {
    it("returns 0 for empty or undefined activities list", () => {
      expect(calculateStreak([])).toBe(0);
      expect(calculateStreak(null as any)).toBe(0);
    });

    it("returns 0 if the latest activity was logged more than 1 day ago", () => {
      const date = new Date();
      date.setDate(date.getDate() - 2); // 2 days ago
      const activities: Partial<Activity>[] = [{ date }];
      expect(calculateStreak(activities as Activity[])).toBe(0);
    });

    it("returns 1 if the latest activity was logged yesterday and no previous activities exist", () => {
      const date = new Date();
      date.setDate(date.getDate() - 1); // Yesterday
      const activities: Partial<Activity>[] = [{ date }];
      expect(calculateStreak(activities as Activity[])).toBe(1);
    });

    it("returns 1 if the latest activity was logged today and no previous activities exist", () => {
      const date = new Date(); // Today
      const activities: Partial<Activity>[] = [{ date }];
      expect(calculateStreak(activities as Activity[])).toBe(1);
    });

    it("returns correct streak for consecutive days logged (today, yesterday, day before)", () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(today.getDate() - 2);

      const activities: Partial<Activity>[] = [
        { date: twoDaysAgo },
        { date: today },
        { date: yesterday },
      ];
      // Note: calculateStreak sorts the dates descending: today, yesterday, twoDaysAgo
      expect(calculateStreak(activities as Activity[])).toBe(3);
    });

    it("ignores duplicate logs on the same calendar day", () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const activities: Partial<Activity>[] = [
        { date: today },
        { date: today }, // Duplicate
        { date: yesterday },
      ];
      expect(calculateStreak(activities as Activity[])).toBe(2);
    });

    it("stops counting streak once a gap of 1+ days is encountered", () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(today.getDate() - 3); // Gap on day -2

      const activities: Partial<Activity>[] = [
        { date: today },
        { date: yesterday },
        { date: threeDaysAgo },
      ];
      expect(calculateStreak(activities as Activity[])).toBe(2);
    });
  });
});
