/**
 * @module validators/auth
 * @description Zod schemas for authentication forms.
 */
import { z } from "zod";

/** Reusable email field validator */
const emailField = z
  .email("Please enter a valid email address")
  .max(254, "Email must be at most 254 characters");

/** Reusable password field validator with minimum length enforcement */
const passwordField = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password must be at most 128 characters");

/**
 * Schema for user login form validation.
 * Requires a valid email and a password.
 */
export const LoginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

/** Inferred TypeScript type for login form data */
export type LoginData = z.infer<typeof LoginSchema>;

/**
 * Schema for user signup / registration form validation.
 * Requires a display name, valid email, and a strong password.
 */
export const SignupSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  email: emailField,
  password: passwordField,
});

/** Inferred TypeScript type for signup form data */
export type SignupData = z.infer<typeof SignupSchema>;
