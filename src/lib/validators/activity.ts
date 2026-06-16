/**
 * @module validators/activity
 * @description Zod schemas for onboarding, activity logging, and chat messages.
 */
import { z } from "zod";

// ── Onboarding ───────────────────────────────────────────────────────────────

const transportModes = [
  "car", "public_transit", "bicycle", "walking",
  "motorcycle", "electric_vehicle", "carpool", "remote",
] as const;

const dietTypes = [
  "omnivore", "pescatarian", "vegetarian", "vegan", "flexitarian",
] as const;

const energySources = [
  "electricity", "natural_gas", "solar", "wind", "mixed", "other",
] as const;

/**
 * Schema for the user onboarding questionnaire.
 * Captures lifestyle data used to estimate the user's initial carbon footprint.
 */
export const OnboardingSchema = z.object({
  transportMode: z.enum(transportModes, { error: "Please select a transportation mode" }),
  commuteDistance: z.number().min(0).max(500, "Commute distance seems too large — please enter km"),
  dietType: z.enum(dietTypes, { error: "Please select a diet type" }),
  electricityUsage: z.number().min(0).max(10000, "Please verify your electricity usage (kWh)"),
  energySource: z.enum(energySources, { error: "Please select an energy source" }),
  householdSize: z.number().int("Household size must be a whole number").min(1).max(20),
  recyclesRegularly: z.boolean(),
});

/** Inferred TypeScript type for onboarding form data */
export type OnboardingData = z.infer<typeof OnboardingSchema>;

// ── Activity Logging ─────────────────────────────────────────────────────────

const activityCategories = [
  "transport", "energy", "food", "shopping", "waste", "other",
] as const;

const activityUnits = [
  "km", "miles", "kWh", "kg", "lbs", "liters", "gallons", "hours", "count",
] as const;

/**
 * Schema for logging a carbon footprint activity entry.
 */
export const ActivitySchema = z.object({
  category: z.enum(activityCategories, { error: "Please select an activity category" }),
  value: z.number().positive("Value must be a positive number").max(100000),
  unit: z.enum(activityUnits, { error: "Please select a unit of measurement" }),
  note: z.string().max(500, "Note must be at most 500 characters").trim().optional(),
});

/** Inferred TypeScript type for activity log entries */
export type ActivityData = z.infer<typeof ActivitySchema>;

// ── Chat Message ─────────────────────────────────────────────────────────────

/**
 * Schema for validating chat messages sent to the AI assistant.
 */
export const ChatMessageSchema = z.object({
  text: z.string().min(1, "Message cannot be empty").max(2000).trim(),
});

/** Inferred TypeScript type for chat message payloads */
export type ChatMessageData = z.infer<typeof ChatMessageSchema>;
