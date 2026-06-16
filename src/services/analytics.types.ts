/**
 * Structured parameters for a generic analytics event.
 */
export interface AnalyticsEventParams {
  /** The event name (e.g. "button_click", "page_scroll") */
  eventName: string;
  /** Optional key-value pairs to attach to the event */
  params?: Record<string, string | number | boolean>;
}

/**
 * Parameters for tracking a carbon activity logging event.
 */
export interface CarbonActivityEventParams {
  /** The category of the activity */
  category: "transport" | "food" | "electricity" | "shopping" | "water" | "waste" | "lifestyle";
  /** The numeric value logged (distance, servings, kWh, etc.) */
  value: number;
  /** The unit of measurement */
  unit: string;
  /** The computed carbon emission in kg CO2 */
  carbonEmit: number;
}

/**
 * Parameters for tracking an eco-goal set event.
 */
export interface GoalSetEventParams {
  /** The goal's category */
  category: string;
  /** The target CO2 reduction value in kg */
  targetValue: number;
}

/**
 * Parameters for tracking an AI chat interaction event.
 */
export interface AiChatEventParams {
  /** The length of the user's message in characters */
  messageLength: number;
  /** The role that sent the message */
  role: "user" | "assistant";
}

/**
 * Parameters for tracking an onboarding step event.
 */
export interface OnboardingStepEventParams {
  /** The step number (1-based) */
  step: number;
  /** A descriptive name for the step */
  stepName: string;
  /** Whether the step was completed or skipped */
  completed: boolean;
}

/**
 * Parameters for tracking a login event.
 */
export interface LoginEventParams {
  /** The authentication method used */
  method: "google" | "email" | "github" | "anonymous";
}
