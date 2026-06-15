/**
 * Application-wide configuration constants for CarbonMind AI.
 *
 * These values define core defaults and limits used throughout the
 * application. Centralising them here prevents magic numbers and
 * makes tuning easy.
 *
 * @module app-config
 */

/** The display name of the application */
export const APP_NAME = "CarbonMind AI" as const;

/** A short tagline describing the application's purpose */
export const APP_DESCRIPTION =
  "Track, reduce, and offset your carbon footprint with AI-powered insights" as const;

/**
 * The default monthly carbon goal in kg CO2 for new users.
 * Based on the global average ÷ 2 as an aspirational target.
 */
export const DEFAULT_GOAL = 200 as const;

/**
 * Maximum number of activity entries to display per page
 * in paginated lists.
 */
export const MAX_ACTIVITIES_PER_PAGE = 20 as const;

/**
 * The baseline monthly carbon footprint in kg CO2 used to
 * calculate the carbon score. Represents the global per-capita
 * average monthly CO2 emissions.
 */
export const CARBON_SCORE_BASELINE = 400 as const;

/**
 * The number of consecutive logging days required to count
 * as an active streak.
 */
export const MIN_STREAK_DAYS = 1 as const;

/**
 * Maximum number of goals a user can have active simultaneously.
 */
export const MAX_ACTIVE_GOALS = 10 as const;

/**
 * The number of top users shown on the leaderboard by default.
 */
export const DEFAULT_LEADERBOARD_SIZE = 50 as const;

/**
 * Debounce delay in milliseconds for search inputs.
 */
export const SEARCH_DEBOUNCE_MS = 300 as const;

/**
 * Points awarded per activity logged.
 */
export const POINTS_PER_ACTIVITY = 10 as const;

/**
 * Bonus points awarded per day of streak maintained.
 */
export const POINTS_PER_STREAK_DAY = 5 as const;

/**
 * All activity categories supported by the application.
 */
export const ACTIVITY_CATEGORIES = [
  "transport",
  "food",
  "electricity",
  "shopping",
  "water",
  "waste",
  "lifestyle",
] as const;

/**
 * Type derived from the ACTIVITY_CATEGORIES constant.
 */
export type ActivityCategory = (typeof ACTIVITY_CATEGORIES)[number];
