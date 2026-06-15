/**
 * @module types
 * @description Barrel export for all CarbonMind AI type definitions.
 *
 * Types are organized into domain-specific modules:
 * - `common` — Shared primitives (timestamps, audit)
 * - `user` — User profiles, preferences, achievements, leaderboard
 * - `activity` — Activities, goals, analytics, reports
 * - `carbon` — Carbon parsing, AI responses, twin simulation
 */

export type {
  FirestoreTimestamp,
  TimestampLike,
  AuditLogEntry,
} from "./common";

export type {
  UserPreferences,
  UserProfile,
  LeaderboardEntry,
  Achievement,
} from "./user";

export type {
  ActivityCategory,
  Activity,
  GoalStatus,
  GoalCategory,
  EcoGoal,
  CategoryBreakdown,
  WeeklyReport,
} from "./activity";

export type {
  ParsedTransport,
  ParsedFood,
  ParsedElectricity,
  ParsedShopping,
  ParsedItems,
  DailyLog,
  ChatMessage,
  AIParseResponse,
  AIChatResponse,
  TwinSimulation,
  TwinResults,
} from "./carbon";
