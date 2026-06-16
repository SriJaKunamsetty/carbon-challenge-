/**
 * @module validators
 * @description Barrel export for all CarbonMind AI Zod validation schemas.
 *
 * @example
 * ```typescript
 * import { LoginSchema, type LoginData } from "@/lib/validators";
 *
 * const result = LoginSchema.safeParse(formData);
 * if (!result.success) {
 *   logger.error({ module: "Auth" }, "Validation failed", result.error.issues);
 * }
 * ```
 */

export { LoginSchema, SignupSchema } from "./auth";
export type { LoginData, SignupData } from "./auth";

export { OnboardingSchema, ActivitySchema, ChatMessageSchema } from "./activity";
export type { OnboardingData, ActivityData, ChatMessageData } from "./activity";

export { ProfileUpdateSchema, AiRequestSchema } from "./profile";
export type { ProfileUpdateData, AiRequestData } from "./profile";
