import type { UserProfile } from "@/types";

/**
 * Shared mock user profile for unit testing.
 */
export const mockProfile: UserProfile = {
  uid: "test-uid",
  name: "Alice",
  email: "alice@example.com",
  photoURL: null,
  createdAt: new Date(),
  country: "USA",
  age: 30,
  occupation: "Engineer",
  streak: 5,
  points: 100,
  goal: 350,
  preferences: {
    theme: "dark",
    notifications: true,
    weeklyDigest: true,
  },
  carbonScore: 75,
  onboarded: true,
};

export const validSignupData = {
  name: "Alice",
  email: "alice@example.com",
  password: "secure123",
};

export const validOnboardingData = {
  transportMode: "car" as const,
  commuteDistance: 20,
  dietType: "omnivore" as const,
  electricityUsage: 300,
  energySource: "electricity" as const,
  householdSize: 3,
  recyclesRegularly: true,
};

export const validActivityData = {
  category: "transport" as const,
  value: 10,
  unit: "km" as const,
  note: "Daily commute",
};
