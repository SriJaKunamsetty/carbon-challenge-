/**
 * Barrel export for all application constants.
 *
 * @module constants
 */

export {
  APP_NAME,
  APP_DESCRIPTION,
  DEFAULT_GOAL,
  MAX_ACTIVITIES_PER_PAGE,
  CARBON_SCORE_BASELINE,
  MIN_STREAK_DAYS,
  MAX_ACTIVE_GOALS,
  DEFAULT_LEADERBOARD_SIZE,
  SEARCH_DEBOUNCE_MS,
  POINTS_PER_ACTIVITY,
  POINTS_PER_STREAK_DAY,
  ACTIVITY_CATEGORIES,
} from "./app-config";
export type { ActivityCategory } from "./app-config";

export { ACHIEVEMENTS } from "./achievements";
export type { AchievementDefinition, AchievementContext } from "./achievements";
