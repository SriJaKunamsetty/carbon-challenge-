/**
 * @module auth-helpers
 * @description Factory functions for default user profiles, shared
 * between AuthContext and auth-related tests.
 */
import type { UserProfile } from "@/types";
import { DEFAULT_GOAL } from "@/constants/app-config";

/** Default user preferences for new accounts */
const DEFAULT_PREFERENCES: UserProfile["preferences"] = {
  theme: "dark",
  notifications: true,
  weeklyDigest: true,
};

/**
 * Creates a default UserProfile structure for newly registered users.
 *
 * @param uid - Firebase Auth UID
 * @param email - User email address
 * @param name - Display name (falls back to "Eco Citizen")
 * @param photoURL - Profile photo URL
 * @returns A complete UserProfile object with starter values
 */
export function buildDefaultProfile(
  uid: string,
  email: string,
  name: string,
  photoURL: string | null
): UserProfile {
  return {
    uid,
    name: name || "Eco Citizen",
    email,
    photoURL: photoURL || null,
    createdAt: new Date(),
    country: "",
    age: 25,
    occupation: "",
    streak: 0,
    points: 50,
    goal: DEFAULT_GOAL,
    preferences: { ...DEFAULT_PREFERENCES },
    carbonScore: 75,
    onboarded: false,
  };
}

/**
 * Creates a fallback profile when Firestore is unreachable.
 * Same defaults as buildDefaultProfile but with onboarded = true.
 */
export function buildFallbackProfile(
  uid: string,
  email: string,
  name: string,
  photoURL: string | null
): UserProfile {
  return {
    ...buildDefaultProfile(uid, email, name, photoURL),
    onboarded: true,
  };
}
