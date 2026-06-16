/**
 * @module types/carbon
 * @description Carbon parsing, AI response, and simulation types.
 */
import type { TimestampLike } from "./common";

/** Parsed transport item from AI log parsing */
export interface ParsedTransport {
  mode: string;
  distanceKm: number;
  carbon: number;
}

/** Parsed food item from AI log parsing */
export interface ParsedFood {
  type: string;
  servings: number;
  carbon: number;
}

/** Parsed electricity usage from AI log parsing */
export interface ParsedElectricity {
  usageHours: number;
  carbon: number;
}

/** Parsed shopping item from AI log parsing */
export interface ParsedShopping {
  category: string;
  count: number;
  carbon: number;
}

/** Structured parsed items from daily log */
export interface ParsedItems {
  transport?: ParsedTransport[];
  food?: ParsedFood[];
  electricity?: ParsedElectricity;
  shopping?: ParsedShopping[];
}

/** Daily carbon log entry stored in Firestore daily_logs collection */
export interface DailyLog {
  /** Document ID */
  id: string;
  /** Owner user ID */
  userId: string;
  /** Date string in YYYY-MM-DD format */
  date: string;
  /** Original natural language input */
  rawText: string;
  /** AI-parsed structured carbon items */
  parsedItems: ParsedItems;
  /** Total carbon emissions in kg CO2 */
  totalCarbon: number;
  /** Creation timestamp */
  createdAt: TimestampLike;
}

/** Chat message in AI Coach conversation */
export interface ChatMessage {
  /** Message ID */
  id: string;
  /** Message sender role */
  role: "user" | "assistant";
  /** Message text content */
  content: string;
  /** Message timestamp */
  timestamp: TimestampLike;
}

/** API response types */
export interface AIParseResponse {
  transport: ParsedTransport[];
  food: ParsedFood[];
  electricity: ParsedElectricity | null;
  shopping: ParsedShopping[];
  totalCarbon: number;
}

export interface AIChatResponse {
  response: string;
}

/** Carbon Twin simulation parameters */
export interface TwinSimulation {
  /** Days per week using transit instead of car */
  transitSwapDays: number;
  /** Hours of AC reduction per day */
  acReductionHours: number;
  /** Vegetarian meal swaps per week */
  vegMealSwaps: number;
  /** Renewable energy offset percentage */
  renewableOffset: number;
  /** Whether user switches to EV */
  evSwitch: boolean;
}

/** Carbon Twin simulation results */
export interface TwinResults {
  /** Current monthly carbon in kg CO2 */
  currentCarbon: number;
  /** Projected monthly carbon in kg CO2 */
  projectedCarbon: number;
  /** Monthly savings in kg CO2 */
  monthlySavings: number;
  /** Estimated money saved per month */
  moneySaved: number;
  /** Trees equivalent per year */
  treesEquivalent: number;
  /** Projected carbon score improvement */
  scoreImprovement: number;
  /** Yearly carbon avoided in tonnes */
  yearlyAvoided: number;
}
