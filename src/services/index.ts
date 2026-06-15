/**
 * Barrel export for all application services.
 *
 * @module services
 */

export { FirestoreService, FirestoreServiceError } from "./firestore.service";
export type { WhereClause, OrderByClause, QueryConfig } from "./firestore.service";

export { AnalyticsService } from "./analytics.service";
export type {
  AnalyticsEventParams,
  CarbonActivityEventParams,
  GoalSetEventParams,
  AiChatEventParams,
  OnboardingStepEventParams,
  LoginEventParams,
} from "./analytics.types";

export { buildActivityConstraints } from "./activityService";
export type { ActivityFilter } from "./activityService";

