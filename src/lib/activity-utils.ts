import { Timestamp } from "firebase/firestore";
import type { Activity } from "@/types";

/**
 * Normalises a date-like value into a JavaScript Date object.
 * Supports Firestore Timestamp, Date object, Firestore-like objects with a toDate method,
 * ISO date strings, and numeric timestamps.
 *
 * @param value - The raw date value to normalize
 * @returns A normalized JavaScript Date object
 */
export function toDate(value: unknown): Date {
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
 * Calculates the consecutive daily logging streak from a list of activities.
 * A streak continues if there is at least one activity logged per day, ending either today or yesterday.
 *
 * @param activities - The list of activities logged by the user
 * @returns The length of the current active streak in days
 */
export function calculateStreak(activities: Activity[]): number {
  if (!activities || activities.length === 0) {
    return 0;
  }

  // Get distinct dates formatted as YYYY-MM-DD in local time
  const dates = Array.from(
    new Set(
      activities.map((act) => {
        const d = toDate(act.date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
      })
    )
  ).sort((a, b) => b.localeCompare(a)); // Sort descending (newest to oldest)

  if (dates.length === 0) {
    return 0;
  }

  const today = new Date();
  const formatLocalDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;

  const todayStr = formatLocalDate(today);
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterday);

  // If the newest logged date is neither today nor yesterday, streak is broken
  const newestLogStr = dates[0];
  if (newestLogStr !== todayStr && newestLogStr !== yesterdayStr) {
    return 0;
  }

  // Count consecutive days going back
  let streak = 1;
  let currentDate = new Date(newestLogStr);

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(currentDate.getDate() - 1);
    const prevDateStr = formatLocalDate(prevDate);

    if (dates[i] === prevDateStr) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}
