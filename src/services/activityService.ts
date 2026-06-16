import { where, orderBy, Timestamp, type QueryConstraint } from "firebase/firestore";
import type { Activity } from "@/types";

/**
 * Filter configuration for querying activities.
 */
export interface ActivityFilter {
  /** Filter activities on or after this date */
  startDate?: Date;
  /** Filter activities on or before this date */
  endDate?: Date;
  /** Filter by activity category */
  category?: Activity["category"];
}

/**
 * Builds query constraints for fetching user activities from Firestore.
 * This helper avoids logic duplication across the useActivities hook's functions.
 *
 * @param userId - The authenticated user's ID
 * @param filter - Optional filters to apply
 * @returns Array of QueryConstraints to pass to Firestore query
 */
export function buildActivityConstraints(
  userId: string,
  filter?: ActivityFilter
): QueryConstraint[] {
  const constraints: QueryConstraint[] = [
    where("userId", "==", userId),
    orderBy("date", "desc"),
  ];

  if (filter?.category) {
    constraints.push(where("category", "==", filter.category));
  }

  if (filter?.startDate) {
    constraints.push(where("date", ">=", Timestamp.fromDate(filter.startDate)));
  }

  if (filter?.endDate) {
    constraints.push(where("date", "<=", Timestamp.fromDate(filter.endDate)));
  }

  return constraints;
}
