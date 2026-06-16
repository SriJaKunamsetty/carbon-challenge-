import { useMemo } from "react";
import { Timestamp } from "firebase/firestore";
import { CARBON_SCORE_BASELINE } from "@/constants/app-config";
import { calculateCarbonScore } from "@/lib/carbon/score";
import type { Activity } from "@/types";

/**
 * Rating label derived from the user's carbon score.
 * Lower emissions yield a better rating.
 */
export type CarbonRating = "excellent" | "good" | "average" | "poor" | "critical";

/**
 * Breakdown of carbon emissions by activity category.
 */
export interface CategoryBreakdown {
  /** The activity category */
  category: Activity["category"];
  /** Total carbon emissions in kg CO2 for this category */
  totalCarbon: number;
  /** Percentage of total emissions this category represents */
  percentage: number;
}

/**
 * Trend data point for carbon emissions over time.
 */
export interface TrendDataPoint {
  /** The date label (YYYY-MM-DD) */
  date: string;
  /** The total carbon emission for that day in kg CO2 */
  carbon: number;
}

/**
 * Return value of the useCarbonScore hook.
 */
export interface UseCarbonScoreReturn {
  /** The overall carbon score (0–100, higher is better / greener) */
  score: number;
  /** A human-readable rating label derived from the score */
  rating: CarbonRating;
  /** Total carbon emitted today in kg CO2 */
  todayCarbon: number;
  /** Total carbon emitted in the past 7 days in kg CO2 */
  weeklyCarbon: number;
  /** Total carbon emitted in the current calendar month in kg CO2 */
  monthlyCarbon: number;
  /** Projected annual carbon based on monthly average in kg CO2 */
  yearlyProjected: number;
  /** Emissions breakdown by category */
  categoryBreakdown: CategoryBreakdown[];
  /** Daily trend data for the past 30 days */
  trend: TrendDataPoint[];
}

/**
 * Converts a Firestore Timestamp, Date, or ISO string to a JS Date.
 *
 * @param value - The date-like value to normalise
 * @returns A JavaScript Date object
 */
function toDate(value: unknown): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date(value as string | number);
}

/**
 * Formats a Date to a YYYY-MM-DD string.
 *
 * @param date - The date to format
 * @returns The formatted date string
 */
/** @internal exported for unit testing */
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Derives a CarbonRating label from a numeric score.
 *
 * @param score - The carbon score (0–100)
 * @returns A descriptive rating
 */
/** @internal exported for unit testing */
export function scoreToRating(score: number): CarbonRating {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "average";
  if (score >= 20) return "poor";
  return "critical";
}

/**
 * Custom hook that computes a comprehensive carbon score and analytics from
 * a user's activity list.
 *
 * All expensive calculations are wrapped in `useMemo` to avoid recomputation
 * on every render. The score uses the shared calculator and app baseline.
 *
 * @param activities - The user's logged activities
 * @returns An object containing score, rating, time-period totals, breakdown, and trend
 *
 * @example
 * ```tsx
 * const { score, rating, todayCarbon, categoryBreakdown } = useCarbonScore(activities);
 * ```
 */
export function useCarbonScore(activities: Activity[]): UseCarbonScoreReturn {
  const result = useMemo<UseCarbonScoreReturn>(() => {
    const now = new Date();
    const todayKey = formatDateKey(now);

    // Start of current week (Monday)
    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    // Start of current month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 30 days ago for trend
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    let todayCarbon = 0;
    let weeklyCarbon = 0;
    let monthlyCarbon = 0;

    // Category accumulator
    const categoryMap = new Map<Activity["category"], number>();
    // Daily trend accumulator
    const dailyMap = new Map<string, number>();

    let totalCarbon = 0;

    for (const activity of activities) {
      const actDate = toDate(activity.date);
      const actKey = formatDateKey(actDate);
      const carbon = activity.carbonEmit;

      totalCarbon += carbon;

      // Today
      if (actKey === todayKey) {
        todayCarbon += carbon;
      }

      // Week
      if (actDate >= weekStart) {
        weeklyCarbon += carbon;
      }

      // Month
      if (actDate >= monthStart) {
        monthlyCarbon += carbon;
      }

      // Category breakdown
      categoryMap.set(activity.category, (categoryMap.get(activity.category) ?? 0) + carbon);

      // Daily trend (last 30 days)
      if (actDate >= thirtyDaysAgo) {
        dailyMap.set(actKey, (dailyMap.get(actKey) ?? 0) + carbon);
      }
    }

    // Build category breakdown with percentages
    const categoryBreakdown: CategoryBreakdown[] = [];
    for (const [category, catTotal] of categoryMap) {
      categoryBreakdown.push({
        category,
        totalCarbon: Math.round(catTotal * 100) / 100,
        percentage: totalCarbon > 0 ? Math.round((catTotal / totalCarbon) * 10000) / 100 : 0,
      });
    }
    categoryBreakdown.sort((a, b) => b.totalCarbon - a.totalCarbon);

    // Build daily trend for last 30 days
    const trend: TrendDataPoint[] = [];
    for (let i = 30; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = formatDateKey(d);
      trend.push({
        date: key,
        carbon: Math.round((dailyMap.get(key) ?? 0) * 100) / 100,
      });
    }

    // Calculate the day of month to project annual emissions
    const dayOfMonth = now.getDate();
    const projectedMonthly = dayOfMonth > 0 ? (monthlyCarbon / dayOfMonth) * 30 : 0;
    const yearlyProjected = Math.round(projectedMonthly * 12 * 100) / 100;

    const score = calculateCarbonScore(projectedMonthly, CARBON_SCORE_BASELINE);
    const rating = scoreToRating(score);

    return {
      score,
      rating,
      todayCarbon: Math.round(todayCarbon * 100) / 100,
      weeklyCarbon: Math.round(weeklyCarbon * 100) / 100,
      monthlyCarbon: Math.round(monthlyCarbon * 100) / 100,
      yearlyProjected,
      categoryBreakdown,
      trend,
    };
  }, [activities]);

  return result;
}
