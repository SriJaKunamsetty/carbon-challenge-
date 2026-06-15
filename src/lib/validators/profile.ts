/**
 * @module validators/profile
 * @description Zod schemas for profile updates and AI API requests.
 */
import { z } from "zod";

/**
 * Schema for updating a user's profile.
 * All fields are optional — only provided fields are updated (PATCH semantics).
 */
export const ProfileUpdateSchema = z.object({
  displayName: z.string().min(1).max(100).trim().optional(),
  photoURL: z.url("Please enter a valid URL").max(2048).optional(),
  location: z.string().max(200).trim().optional(),
  bio: z.string().max(300).trim().optional(),
});

/** Inferred TypeScript type for profile update payloads */
export type ProfileUpdateData = z.infer<typeof ProfileUpdateSchema>;

/**
 * Schema for validating AI API request payloads.
 * Supports both "parser" (NL → carbon JSON) and "chat" (AI coach) modes.
 */
export const AiRequestSchema = z.object({
  text: z.string().min(1, "Text is required").max(5000).trim(),
  mode: z.enum(["parser", "chat"]).optional().default("parser"),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .optional()
    .default([]),
  profile: z.record(z.string(), z.unknown()).optional(),
});

/** Inferred TypeScript type for AI API request payloads */
export type AiRequestData = z.infer<typeof AiRequestSchema>;
