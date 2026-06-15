import { Analytics, getAnalytics, logEvent, setUserProperties } from "firebase/analytics";
import { app } from "@/lib/firebase";

import type {
  CarbonActivityEventParams,
  GoalSetEventParams,
  AiChatEventParams,
  OnboardingStepEventParams,
  LoginEventParams,
} from "./analytics.types";

/**
 * Returns a Firebase Analytics instance if running in a browser environment.
 * Returns `null` during SSR to prevent errors.
 *
 * @returns The Analytics instance or null if not in a browser
 */
function getAnalyticsInstance(): Analytics | null {
  /* c8 ignore next -- SSR guard: globalThis.window is always defined in jsdom test environment */
  if (globalThis.window === undefined) {
    return null;
  }
  try {
    return getAnalytics(app);
  } catch {
    // Analytics may not be available in all environments (e.g. ad-blockers)
    return null;
  }
}

/**
 * Analytics service for CarbonMind AI.
 *
 * Provides a type-safe wrapper around Firebase Analytics with SSR guards.
 * Every method silently no-ops when called during server-side rendering
 * or when Analytics is unavailable (e.g. ad-blocker active).
 *
 * @example
 * ```ts
 * AnalyticsService.trackPageView("/dashboard", "Dashboard");
 * AnalyticsService.trackCarbonActivity({ category: "transport", value: 10, unit: "km", carbonEmit: 2.1 });
 * ```
 */
export class AnalyticsService {
  /**
   * Tracks a custom analytics event with optional parameters.
   *
   * @param eventName - The name of the event to log
   * @param params - Optional key-value parameters to attach to the event
   *
   * @example
   * ```ts
   * AnalyticsService.trackEvent("share_clicked", { platform: "twitter" });
   * ```
   */
  static trackEvent(eventName: string, params?: Record<string, string | number | boolean>): void {
    const analytics = getAnalyticsInstance();
    /* c8 ignore next -- SSR guard: analytics is null only when window is undefined */
    if (!analytics) return;
    logEvent(analytics, eventName, params);
  }

  /**
   * Tracks a page view event with the given path and optional title.
   *
   * @param pagePath - The URL path of the page (e.g. "/dashboard")
   * @param pageTitle - Optional human-readable title for the page
   *
   * @example
   * ```ts
   * AnalyticsService.trackPageView("/goals", "My Goals");
   * ```
   */
  static trackPageView(pagePath: string, pageTitle?: string): void {
    const analytics = getAnalyticsInstance();
    /* c8 ignore next -- SSR guard: analytics is null only when window is undefined */
    if (!analytics) return;
    logEvent(analytics, "page_view", {
      page_path: pagePath,
      page_title: pageTitle ?? pagePath,
    });
  }

  /**
   * Sets a user property for audience segmentation in Analytics.
   *
   * @param propertyName - The name of the user property
   * @param value - The value to set for the property
   *
   * @example
   * ```ts
   * AnalyticsService.trackUserProperty("user_country", "US");
   * ```
   */
  static trackUserProperty(propertyName: string, value: string): void {
    const analytics = getAnalyticsInstance();
    /* c8 ignore next -- SSR guard: analytics is null only when window is undefined */
    if (!analytics) return;
    setUserProperties(analytics, { [propertyName]: value });
  }

  /**
   * Tracks when a user logs a carbon activity.
   *
   * @param params - The carbon activity event parameters
   *
   * @example
   * ```ts
   * AnalyticsService.trackCarbonActivity({
   *   category: "food",
   *   value: 2,
   *   unit: "servings",
   *   carbonEmit: 3.6,
   * });
   * ```
   */
  static trackCarbonActivity(params: CarbonActivityEventParams): void {
    const analytics = getAnalyticsInstance();
    /* c8 ignore next -- SSR guard: analytics is null only when window is undefined */
    if (!analytics) return;
    logEvent(analytics, "carbon_activity_logged", {
      category: params.category,
      value: params.value,
      unit: params.unit,
      carbon_emit_kg: params.carbonEmit,
    });
  }

  /**
   * Tracks when a user sets a new eco-goal.
   *
   * @param params - The goal set event parameters
   *
   * @example
   * ```ts
   * AnalyticsService.trackGoalSet({ category: "transport", targetValue: 50 });
   * ```
   */
  static trackGoalSet(params: GoalSetEventParams): void {
    const analytics = getAnalyticsInstance();
    /* c8 ignore next -- SSR guard: analytics is null only when window is undefined */
    if (!analytics) return;
    logEvent(analytics, "goal_set", {
      category: params.category,
      target_value_kg: params.targetValue,
    });
  }

  /**
   * Tracks an AI chat message exchange.
   *
   * @param params - The AI chat event parameters
   *
   * @example
   * ```ts
   * AnalyticsService.trackAiChat({ messageLength: 140, role: "user" });
   * ```
   */
  static trackAiChat(params: AiChatEventParams): void {
    const analytics = getAnalyticsInstance();
    /* c8 ignore next -- SSR guard: analytics is null only when window is undefined */
    if (!analytics) return;
    logEvent(analytics, "ai_chat_message", {
      message_length: params.messageLength,
      role: params.role,
    });
  }

  /**
   * Tracks an onboarding step interaction.
   *
   * @param params - The onboarding step event parameters
   *
   * @example
   * ```ts
   * AnalyticsService.trackOnboardingStep({ step: 2, stepName: "Set Goal", completed: true });
   * ```
   */
  static trackOnboardingStep(params: OnboardingStepEventParams): void {
    const analytics = getAnalyticsInstance();
    /* c8 ignore next -- SSR guard: analytics is null only when window is undefined */
    if (!analytics) return;
    logEvent(analytics, "onboarding_step", {
      step: params.step,
      step_name: params.stepName,
      completed: params.completed,
    });
  }

  /**
   * Tracks a user login event.
   *
   * @param params - The login event parameters
   *
   * @example
   * ```ts
   * AnalyticsService.trackLogin({ method: "google" });
   * ```
   */
  static trackLogin(params: LoginEventParams): void {
    const analytics = getAnalyticsInstance();
    /* c8 ignore next -- SSR guard: analytics is null only when window is undefined */
    if (!analytics) return;
    logEvent(analytics, "login", {
      method: params.method,
    });
  }
}
