/**
 * @module types/user
 * @description User-related type definitions for CarbonMind AI.
 */
import type { TimestampLike } from "./common";

/** User preference settings */
export interface UserPreferences {
  /** UI theme preference */
  theme: "dark" | "light" | "system";
  /** Whether push notifications are enabled */
  notifications: boolean;
  /** Whether weekly carbon digest emails are enabled */
  weeklyDigest: boolean;
}

/** User profile stored in Firestore users/{uid} */
export interface UserProfile {
  /** Firebase Auth UID */
  uid: string;
  /** User display name */
  name: string;
  /** User email address */
  email: string;
  /** Google profile photo URL */
  photoURL: string | null;
  /** Account creation timestamp */
  createdAt: TimestampLike;
  /** User's country of residence */
  country: string;
  /** User's age */
  age: number;
  /** User's occupation */
  occupation: string;
  /** Consecutive daily logging streak */
  streak: number;
  /** Accumulated eco points */
  points: number;
  /** Monthly carbon emission goal in kg CO2 */
  goal: number;
  /** User preferences object */
  preferences: UserPreferences;
  /** Aggregate carbon score (0-100, higher = greener) */
  carbonScore: number;
  /** Whether the user has completed onboarding */
  onboarded: boolean;
  /** Monthly carbon emissions in kg CO2 */
  monthlyCarbon?: number;
  /** Last activity timestamp */
  lastActivityAt?: TimestampLike;
}

/** Leaderboard entry for ranking display */
export interface LeaderboardEntry {
  /** User ID */
  userId: string;
  /** Display name */
  name: string;
  /** Profile photo URL */
  photoURL: string | null;
  /** Total eco points */
  points: number;
  /** Current streak */
  streak: number;
  /** Carbon score (0-100) */
  carbonScore: number;
  /** Computed level based on points */
  level: number;
}

/** User achievement / badge */
export interface Achievement {
  /** Document ID */
  id: string;
  /** Owner user ID */
  userId: string;
  /** Unique badge identifier */
  badgeId: string;
  /** Achievement title */
  title: string;
  /** Achievement description */
  description: string;
  /** When the achievement was unlocked */
  unlockedAt: TimestampLike;
}
