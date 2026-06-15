/**
 * @module auth-service
 * @description Firebase Authentication service for CarbonMind.
 * Provides login (Google / email), signup, logout, password reset,
 * profile creation, update, and onboarding operations.
 *
 * All Firestore writes target the `users/{uid}` document path.
 */
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { logger } from "@/lib/logger";
import { UserProfile } from "@/types";
import { DEFAULT_GOAL } from "@/constants/app-config";

const authLog = { module: "AuthService" } as const;

/**
 * Creates a default user profile and persists it to Firestore.
 *
 * @param uid - Firebase Auth user ID
 * @param email - User email address
 * @param name - Display name
 * @param photoURL - Google profile photo URL (nullable)
 * @returns The newly created UserProfile
 */
export async function createDefaultProfile(
  uid: string,
  email: string,
  name: string,
  photoURL: string | null
): Promise<UserProfile> {
  const defaultProfile: UserProfile = {
    uid,
    name: name || "Eco Citizen",
    email,
    photoURL: photoURL || null,
    createdAt: new Date(),
    country: "",
    age: 25,
    occupation: "",
    streak: 0,
    points: 50, // Starter eco points
    goal: DEFAULT_GOAL, // Target monthly carbon in kg CO2
    preferences: {
      theme: "dark",
      notifications: true,
      weeklyDigest: true,
    },
    carbonScore: 75,
    onboarded: false,
  };

  try {
    await setDoc(doc(db, "users", uid), defaultProfile);
  } catch (e) {
    logger.error(authLog, "Failed to create default profile in Firestore", e);
  }
  return defaultProfile;
}

/**
 * Builds a fallback profile using the same defaults as createDefaultProfile.
 * Used when Firestore is unreachable.
 *
 * @param uid - Firebase Auth user ID
 * @param email - User email address
 * @param displayName - Display name (nullable)
 * @param photoURL - Profile photo URL (nullable)
 * @returns A locally-constructed UserProfile
 */
export function buildFallbackProfile(
  uid: string,
  email: string,
  displayName: string | null,
  photoURL: string | null
): UserProfile {
  return {
    uid,
    name: displayName || email?.split("@")[0] || "Eco Citizen",
    email: email || "",
    photoURL: photoURL || null,
    createdAt: new Date(),
    country: "",
    age: 25,
    occupation: "",
    streak: 0,
    points: 50,
    goal: DEFAULT_GOAL,
    preferences: {
      theme: "dark",
      notifications: true,
      weeklyDigest: true,
    },
    carbonScore: 75,
    onboarded: false,
  };
}

/**
 * Signs in with Google via popup.
 */
export async function loginWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

/**
 * Signs in with email and password.
 *
 * @param email - User email address
 * @param password - User password
 */
export async function loginWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Creates a new user with email/password and initialises their profile.
 *
 * @param email - User email address
 * @param password - User password
 * @param name - Display name
 * @returns The created UserProfile (or null if user creation failed)
 */
export async function signupWithEmail(
  email: string,
  password: string,
  name: string
): Promise<UserProfile | null> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  /* c8 ignore next -- userCredential.user is always defined on successful signup */
  if (userCredential.user) {
    return createDefaultProfile(userCredential.user.uid, email, name, null);
  }
  return null;
}

/**
 * Signs the current user out.
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Sends a password reset email.
 *
 * @param email - The email address to send the reset link to
 */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Updates a user profile in Firestore.
 *
 * @param uid - The user ID whose profile to update
 * @param data - Partial profile fields to merge
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, data);
}
