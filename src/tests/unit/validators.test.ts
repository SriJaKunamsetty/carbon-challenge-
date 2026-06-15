import {
  LoginSchema,
  SignupSchema,
  ChatMessageSchema,
  ActivitySchema,
  OnboardingSchema,
  ProfileUpdateSchema,
} from "@/lib/validators";
import { validSignupData, validActivityData, validOnboardingData } from "../test-utils";

describe("LoginSchema", () => {
  it("accepts valid email and password", () => {
    const result = LoginSchema.safeParse({
      email: "user@example.com",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = LoginSchema.safeParse({ password: "secret" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = LoginSchema.safeParse({
      email: "not-an-email",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("rejects email without domain", () => {
    const result = LoginSchema.safeParse({
      email: "user@",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = LoginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts minimum-length password (1 char)", () => {
    const result = LoginSchema.safeParse({
      email: "user@example.com",
      password: "a",
    });
    expect(result.success).toBe(true);
  });
});

describe("SignupSchema", () => {
  const validData = validSignupData;

  it("accepts valid signup data", () => {
    const result = SignupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = SignupSchema.safeParse({ ...validData, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 characters", () => {
    const result = SignupSchema.safeParse({
      ...validData,
      name: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("trims whitespace from name", () => {
    const result = SignupSchema.safeParse({
      ...validData,
      name: "  Alice  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Alice");
    }
  });

  it("rejects password shorter than 6 characters", () => {
    const result = SignupSchema.safeParse({ ...validData, password: "12345" });
    expect(result.success).toBe(false);
  });

  it("accepts 6-character password (minimum)", () => {
    const result = SignupSchema.safeParse({
      ...validData,
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("rejects password over 128 characters", () => {
    const result = SignupSchema.safeParse({
      ...validData,
      password: "a".repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email in signup", () => {
    const result = SignupSchema.safeParse({
      ...validData,
      email: "bad-email",
    });
    expect(result.success).toBe(false);
  });
});

describe("ChatMessageSchema", () => {
  it("accepts a valid message", () => {
    const result = ChatMessageSchema.safeParse({ text: "Hello coach!" });
    expect(result.success).toBe(true);
  });

  it("rejects empty text", () => {
    const result = ChatMessageSchema.safeParse({ text: "" });
    expect(result.success).toBe(false);
  });

  it("rejects message over 2000 characters", () => {
    const result = ChatMessageSchema.safeParse({
      text: "x".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("accepts message at exactly 2000 characters", () => {
    const result = ChatMessageSchema.safeParse({
      text: "x".repeat(2000),
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from message", () => {
    const result = ChatMessageSchema.safeParse({ text: "  Hello  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.text).toBe("Hello");
    }
  });
});

describe("ActivitySchema", () => {
  const validActivity = validActivityData;

  it("accepts valid activity data", () => {
    const result = ActivitySchema.safeParse(validActivity);
    expect(result.success).toBe(true);
  });

  it("accepts all valid categories", () => {
    const categories = [
      "transport",
      "energy",
      "food",
      "shopping",
      "waste",
      "other",
    ] as const;
    for (const category of categories) {
      const result = ActivitySchema.safeParse({
        ...validActivity,
        category,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid category", () => {
    const result = ActivitySchema.safeParse({
      ...validActivity,
      category: "invalid_category",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero value", () => {
    const result = ActivitySchema.safeParse({ ...validActivity, value: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative value", () => {
    const result = ActivitySchema.safeParse({ ...validActivity, value: -5 });
    expect(result.success).toBe(false);
  });

  it("rejects value over 100000", () => {
    const result = ActivitySchema.safeParse({
      ...validActivity,
      value: 100001,
    });
    expect(result.success).toBe(false);
  });

  it("accepts value at 100000 (boundary)", () => {
    const result = ActivitySchema.safeParse({
      ...validActivity,
      value: 100000,
    });
    expect(result.success).toBe(true);
  });

  it("accepts all valid units", () => {
    const units = [
      "km",
      "miles",
      "kWh",
      "kg",
      "lbs",
      "liters",
      "gallons",
      "hours",
      "count",
    ] as const;
    for (const unit of units) {
      const result = ActivitySchema.safeParse({ ...validActivity, unit });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid unit", () => {
    const result = ActivitySchema.safeParse({
      ...validActivity,
      unit: "invalid_unit",
    });
    expect(result.success).toBe(false);
  });

  it("accepts missing note (optional)", () => {
    const { note: _note, ...withoutNote } = validActivity;
    const result = ActivitySchema.safeParse(withoutNote);
    expect(result.success).toBe(true);
  });

  it("rejects note over 500 characters", () => {
    const result = ActivitySchema.safeParse({
      ...validActivity,
      note: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("OnboardingSchema", () => {
  const validOnboarding = validOnboardingData;

  it("accepts valid onboarding data", () => {
    const result = OnboardingSchema.safeParse(validOnboarding);
    expect(result.success).toBe(true);
  });

  it("rejects negative commute distance", () => {
    const result = OnboardingSchema.safeParse({
      ...validOnboarding,
      commuteDistance: -1,
    });
    expect(result.success).toBe(false);
  });

  it("rejects commute distance over 500", () => {
    const result = OnboardingSchema.safeParse({
      ...validOnboarding,
      commuteDistance: 501,
    });
    expect(result.success).toBe(false);
  });

  it("rejects household size of 0", () => {
    const result = OnboardingSchema.safeParse({
      ...validOnboarding,
      householdSize: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid transport mode", () => {
    const result = OnboardingSchema.safeParse({
      ...validOnboarding,
      transportMode: "spaceship",
    });
    expect(result.success).toBe(false);
  });
});

describe("ProfileUpdateSchema", () => {
  it("accepts all-optional empty object", () => {
    const result = ProfileUpdateSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts valid display name", () => {
    const result = ProfileUpdateSchema.safeParse({
      displayName: "Alice",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty display name", () => {
    const result = ProfileUpdateSchema.safeParse({
      displayName: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid photo URL", () => {
    const result = ProfileUpdateSchema.safeParse({
      photoURL: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid photo URL", () => {
    const result = ProfileUpdateSchema.safeParse({
      photoURL: "https://example.com/photo.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("rejects bio over 300 characters", () => {
    const result = ProfileUpdateSchema.safeParse({
      bio: "x".repeat(301),
    });
    expect(result.success).toBe(false);
  });
});
