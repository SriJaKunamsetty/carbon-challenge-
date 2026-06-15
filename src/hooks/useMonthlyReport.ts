import { useMemo } from "react";
import type { Activity } from "@/types";
import { Timestamp } from "firebase/firestore";

/**
 * Normalises a date-like value into a JavaScript Date object.
 */
function toDate(value: unknown): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return new Date();
}

/**
 * Return type for the useMonthlyReport hook.
 */
export interface MonthlyReportResult {
  /** Total carbon emissions in the current calendar month (kg CO2) */
  monthlyCarbon: number;
  /** Total carbon emissions in the previous calendar month (kg CO2) */
  prevMonthlyCarbon: number;
  /** Percentage difference compared to the previous month (negative is reduction) */
  comparisonPercent: number;
  /** Breakdown of current month's emissions by category */
  categoryBreakdown: Record<string, number>;
  /** User performance letter grade for the current month */
  grade: "A" | "B" | "C" | "D" | "F";
  /** Descriptive explanation of the letter grade */
  gradeExplanation: string;
}

/**
 * Custom hook to generate a comprehensive monthly carbon report from user activities.
 *
 * Computes monthly carbon totals, compares with the previous month, builds a category
 * breakdown, and assigns an eco-performance letter grade (A-F) with explanation.
 *
 * @param activities - The list of user activities
 * @returns The computed monthly report details
 */
export function useMonthlyReport(activities: Activity[]): MonthlyReportResult {
  return useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
    const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

    // Previous month bounds
    const startOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfPrevMonth = new Date(currentYear, currentMonth, 1);

    let monthlyCarbon = 0;
    let prevMonthlyCarbon = 0;
    const categoryBreakdown: Record<string, number> = {};

    activities.forEach((act) => {
      const actDate = toDate(act.date);
      const carbon = act.carbonEmit || 0;

      if (actDate >= startOfCurrentMonth && actDate < startOfNextMonth) {
        monthlyCarbon += carbon;
        categoryBreakdown[act.category] = (categoryBreakdown[act.category] || 0) + carbon;
      } else if (actDate >= startOfPrevMonth && actDate < endOfPrevMonth) {
        prevMonthlyCarbon += carbon;
      }
    });

    const roundedCurrent = Math.round(monthlyCarbon * 100) / 100;
    const roundedPrev = Math.round(prevMonthlyCarbon * 100) / 100;

    let comparisonPercent = 0;
    if (roundedPrev > 0) {
      comparisonPercent = Math.round(((roundedCurrent - roundedPrev) / roundedPrev) * 100);
    }

    let grade: "A" | "B" | "C" | "D" | "F" = "C";
    let gradeExplanation = "";

    if (roundedCurrent < 200) {
      grade = "A";
      gradeExplanation = "Outstanding! Your footprint is well below the target limit. Keep leading the way!";
    } else if (roundedCurrent < 350) {
      grade = "B";
      gradeExplanation = "Great job! You have maintained a highly sustainable footprint this month.";
    } else if (roundedCurrent < 500) {
      grade = "C";
      gradeExplanation = "Good effort, but there is room for improvement. Try to target your high-emission categories.";
    } else if (roundedCurrent < 650) {
      grade = "D";
      gradeExplanation = "Caution. Your monthly footprint is high. Try using the coach to plan some reductions.";
    } else {
      grade = "F";
      gradeExplanation = "Critical limit exceeded. Consider adopting transit, meatless days, and smart appliances.";
    }

    return {
      monthlyCarbon: roundedCurrent,
      prevMonthlyCarbon: roundedPrev,
      comparisonPercent,
      categoryBreakdown,
      grade,
      gradeExplanation,
    };
  }, [activities]);
}
