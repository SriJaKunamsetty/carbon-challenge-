/**
 * Barrel export for all custom React hooks.
 *
 * @module hooks
 */

export { useActivities } from "./useActivities";
export type { UseActivitiesOptions, UseActivitiesReturn } from "./useActivities";
export type { ActivityFilter } from "../services/activityService";

export { useCarbonScore } from "./useCarbonScore";
export type {
  CarbonRating,
  CategoryBreakdown,
  TrendDataPoint,
  UseCarbonScoreReturn,
} from "./useCarbonScore";

export { useLeaderboard } from "./useLeaderboard";
export type { UseLeaderboardOptions, UseLeaderboardReturn } from "./useLeaderboard";

export { useGoals } from "./useGoals";
export type { UseGoalsReturn } from "./useGoals";

export { useDebounce } from "./useDebounce";

export { useReducedMotion } from "./useReducedMotion";

export { useOnlineStatus } from "./useOnlineStatus";
export type { UseOnlineStatusReturn } from "./useOnlineStatus";

export { useMonthlyReport } from "./useMonthlyReport";
export type { MonthlyReportResult } from "./useMonthlyReport";
