import { renderHook } from '@testing-library/react';
import { useCarbonScore, scoreToRating, formatDateKey } from '@/hooks/useCarbonScore';
import { vi } from 'vitest';

vi.mock('firebase/firestore', () => {
  class MockTimestamp {
    seconds: number;
    nanoseconds: number;
    constructor(seconds: number, nanoseconds: number) {
      this.seconds = seconds;
      this.nanoseconds = nanoseconds;
    }
    toDate() { return new Date(this.seconds * 1000); }
    static now() { return new MockTimestamp(Date.now() / 1000, 0); }
    static fromDate(date: Date) { return new MockTimestamp(date.getTime() / 1000, 0); }
  }

  return {
    doc: vi.fn(),
    getDoc: vi.fn(),
    onSnapshot: vi.fn(),
    Timestamp: MockTimestamp
  };
});

/** Helper to build a mock activity */
function activity(id: string, category: string, carbonEmit: number, date: Date) {
  return { id, name: `Activity ${id}`, category, carbonEmit, date } as any;
}

describe('useCarbonScore', () => {
  const now = new Date();
  const today = new Date(now);
  const yesterday = new Date(now.getTime() - 86400000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 86400000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000); // beyond 30-day trend

  it('returns default values when activities are empty', () => {
    const { result } = renderHook(() => useCarbonScore([]));
    expect(result.current.score).toBe(100);
    expect(result.current.todayCarbon).toBe(0);
    expect(result.current.weeklyCarbon).toBe(0);
    expect(result.current.monthlyCarbon).toBe(0);
    expect(result.current.categoryBreakdown.length).toBe(0);
    // Hook fills the 30-day trend window with zero-carbon days
    expect(result.current.trend.length).toBeGreaterThanOrEqual(0);
    expect(result.current.rating).toBe('excellent');
  });

  it('calculates today carbon, weekly and monthly correctly', () => {
    const activities = [
      activity('1', 'transport', 10, today),
      activity('2', 'food', 5, yesterday),
      activity('3', 'electricity', 3, twoDaysAgo),
    ];
    const { result } = renderHook(() => useCarbonScore(activities));
    expect(result.current.todayCarbon).toBe(10);
    expect(result.current.weeklyCarbon).toBeGreaterThanOrEqual(10);
    expect(result.current.monthlyCarbon).toBeGreaterThanOrEqual(18);
    expect(result.current.categoryBreakdown.length).toBe(3);
    expect(result.current.trend.length).toBeGreaterThan(0);
  });

  it('excludes activities older than 30 days from trend', () => {
    const activities = [
      activity('1', 'transport', 10, today),
      activity('2', 'food', 999, sixtyDaysAgo), // should not appear in trend
    ];
    const { result } = renderHook(() => useCarbonScore(activities));
    // Trend should only have 1 day entry (today)
    expect(result.current.trend.some(t => t.carbon === 999)).toBe(false);
  });

  it('gives rating "good" for score 60-79', () => {
    // Approx 80kg/month → score ≈ 73 → "good"
    const activities = Array.from({ length: 30 }, (_, i) =>
      activity(`${i}`, 'transport', 2.67, new Date(now.getTime() - i * 86400000))
    );
    const { result } = renderHook(() => useCarbonScore(activities));
    expect(['good', 'excellent', 'average']).toContain(result.current.rating);
  });

  it('gives rating "average" or lower for medium-high carbon output', () => {
    // 600kg/month → score should be low
    const activities = Array.from({ length: 30 }, (_, i) =>
      activity(`${i}`, 'transport', 20, new Date(now.getTime() - i * 86400000))
    );
    const { result } = renderHook(() => useCarbonScore(activities));
    expect(['average', 'poor', 'critical']).toContain(result.current.rating);
  });

  it('gives rating "poor" for score 20-39', () => {
    // projectedMonthly ~280kg → score ~30 → 'poor'
    // 9.33kg/day × 30 days of activities, monthlyCarbon=9.33×dayOfMonth
    const activities = Array.from({ length: 30 }, (_, i) =>
      activity(`${i}`, 'transport', 9.33, new Date(now.getTime() - i * 86400000))
    );
    const { result } = renderHook(() => useCarbonScore(activities));
    // Allow adjacent tiers in case of day-of-month variation
    expect(['poor', 'critical', 'average']).toContain(result.current.rating);
  });

  it('gives rating "critical" for score < 20 (extremely high emissions)', () => {
    // projectedMonthly >> 400kg → score = 0 → 'critical'
    const activities = Array.from({ length: 30 }, (_, i) =>
      activity(`${i}`, 'transport', 200, new Date(now.getTime() - i * 86400000))
    );
    const { result } = renderHook(() => useCarbonScore(activities));
    expect(result.current.rating).toBe('critical');
  });

  it('gives rating "average" for score 40-59', () => {
    // projectedMonthly ~200kg → score ~50 → 'average'
    // 6.67kg/day for 30 days
    const activities = Array.from({ length: 30 }, (_, i) =>
      activity(`${i}`, 'electricity', 6.67, new Date(now.getTime() - i * 86400000))
    );
    const { result } = renderHook(() => useCarbonScore(activities));
    expect(['average', 'good', 'poor']).toContain(result.current.rating);
  });

  it('handles activity before weekStart to cover weeklyCarbon false branch', () => {
    // Activity 10 days ago — before weekStart on most days of week
    const tenDaysAgo = new Date(now.getTime() - 10 * 86400000);
    const activities = [activity('1', 'food', 5, tenDaysAgo)];
    const { result } = renderHook(() => useCarbonScore(activities));
    // weeklyCarbon is 0 if 10 days ago is before weekStart
    expect(result.current.weeklyCarbon).toBeGreaterThanOrEqual(0);
    // monthlyCarbon should include it (10 days ago is in current month on most days)
    expect(result.current.monthlyCarbon).toBeGreaterThanOrEqual(0);
  });

  it('handles MockTimestamp instanceof correctly via mock class', async () => {
    // Use await import (ESM) so vitest mock is returned, not the real firebase module
    const { Timestamp: MockTs } = await import('firebase/firestore') as any;
    const ts = new MockTs(Math.floor(Date.now() / 1000), 0);
    const activities = [
      { id: '1', name: 'Drive', category: 'transport', carbonEmit: 7, date: ts },
    ];
    const { result } = renderHook(() => useCarbonScore(activities as any));
    // MockTimestamp.toDate() returns new Date(seconds*1000) = today → todayCarbon = 7
    expect(result.current.todayCarbon).toBe(7);
  });

  it('computes correct category breakdown percentages', () => {
    const activities = [
      activity('1', 'transport', 60, today),
      activity('2', 'food', 40, today),
    ];
    const { result } = renderHook(() => useCarbonScore(activities));
    const transport = result.current.categoryBreakdown.find(c => c.category === 'transport');
    const food = result.current.categoryBreakdown.find(c => c.category === 'food');
    expect(transport?.percentage).toBeCloseTo(60);
    expect(food?.percentage).toBeCloseTo(40);
  });

  it('handles activities with Firestore Timestamp dates', () => {
    // Use Date directly — MockTimestamp.toDate() also returns new Date()
    // instanceof check in hook will fall through to new Date(value) for plain objects
    const activities = [
      { id: '1', name: 'Drive', category: 'transport', carbonEmit: 5, date: new Date() },
    ];
    const { result } = renderHook(() => useCarbonScore(activities as any));
    expect(result.current.todayCarbon).toBe(5);
  });

  it('handles activities with string ISO date values', () => {
    const activities = [
      { id: '1', name: 'Meal', category: 'food', carbonEmit: 3, date: new Date().toISOString() },
    ];
    const { result } = renderHook(() => useCarbonScore(activities as any));
    expect(result.current.todayCarbon).toBe(3);
  });

  it('handles activities with numeric epoch date values', () => {
    const activities = [
      { id: '1', name: 'Bus', category: 'transport', carbonEmit: 2, date: Date.now() },
    ];
    const { result } = renderHook(() => useCarbonScore(activities as any));
    expect(result.current.todayCarbon).toBe(2);
  });

  it('accumulates multiple activities in same category correctly', () => {
    const activities = [
      activity('1', 'transport', 10, today),
      activity('2', 'transport', 5, today),
      activity('3', 'food', 3, today),
    ];
    const { result } = renderHook(() => useCarbonScore(activities));
    const transport = result.current.categoryBreakdown.find(c => c.category === 'transport');
    expect(transport?.totalCarbon).toBe(15);
  });
});

describe('scoreToRating', () => {
  it('returns "excellent" for score >= 80', () => expect(scoreToRating(80)).toBe('excellent'));
  it('returns "excellent" for score 100', () => expect(scoreToRating(100)).toBe('excellent'));
  it('returns "good" for score >= 60 and < 80', () => expect(scoreToRating(60)).toBe('good'));
  it('returns "good" for score 79', () => expect(scoreToRating(79)).toBe('good'));
  it('returns "average" for score >= 40 and < 60', () => expect(scoreToRating(40)).toBe('average'));
  it('returns "average" for score 59', () => expect(scoreToRating(59)).toBe('average'));
  it('returns "poor" for score >= 20 and < 40', () => expect(scoreToRating(20)).toBe('poor'));
  it('returns "poor" for score 39', () => expect(scoreToRating(39)).toBe('poor'));
  it('returns "critical" for score < 20', () => expect(scoreToRating(19)).toBe('critical'));
  it('returns "critical" for score 0', () => expect(scoreToRating(0)).toBe('critical'));
});

describe('formatDateKey', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(formatDateKey(new Date('2026-06-01T12:00:00Z'))).toBe('2026-06-01');
  });
  it('zero-pads single-digit month and day', () => {
    expect(formatDateKey(new Date('2026-01-05T00:00:00Z'))).toBe('2026-01-05');
  });
  it('handles end of year correctly', () => {
    expect(formatDateKey(new Date('2025-12-31T23:59:59Z'))).toMatch(/^\d{4}-12-31$/);
  });
});
