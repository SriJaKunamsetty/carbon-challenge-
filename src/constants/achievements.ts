import type { Activity, EcoGoal, UserProfile } from "@/types";

/**
 * Contextual data passed to an achievement's unlock-condition function.
 * Provides all the information needed to evaluate whether a badge should be unlocked.
 */
export interface AchievementContext {
  /** The user's profile data */
  profile: UserProfile;
  /** All of the user's logged activities */
  activities: Activity[];
  /** All of the user's goals */
  goals: EcoGoal[];
  /** Total carbon emitted this month in kg CO2 */
  monthlyCarbon: number;
  /** The computed carbon score (0–100) */
  carbonScore: number;
}

/**
 * Defines a single achievement / badge that users can unlock.
 */
export interface AchievementDefinition {
  /** Unique identifier for the achievement */
  id: string;
  /** Display title */
  title: string;
  /** Human-readable description of how to unlock */
  description: string;
  /** Emoji or icon identifier to display */
  icon: string;
  /**
   * Pure function that evaluates whether this achievement is unlocked.
   *
   * @param ctx - The current achievement context containing user data
   * @returns `true` if the achievement condition is met
   */
  unlockCondition: (ctx: AchievementContext) => boolean;
}

/**
 * The full list of achievements available in CarbonMind AI.
 *
 * Each achievement has a unique ID, display metadata, and a pure
 * `unlockCondition` function that determines whether the user
 * qualifies. Conditions are evaluated client-side whenever the
 * user's data changes.
 *
 * @example
 * ```ts
 * const unlockedBadges = ACHIEVEMENTS.filter((a) =>
 *   a.unlockCondition({ profile, activities, goals, monthlyCarbon, carbonScore })
 * );
 * ```
 */
/**
 * Converts a date value (Date object, string, or unknown) to a YYYY-MM-DD string key.
 */
function getDateKey(date: unknown): string {
  if (date instanceof Date) return date.toISOString().split("T")[0];
  if (typeof date === "string") return date;
  return "";
}

export const ACHIEVEMENTS: ReadonlyArray<AchievementDefinition> = [
  {
    id: "first_log",
    title: "First Step",
    description: "Log your first carbon activity",
    icon: "🌱",
    unlockCondition: (ctx) => ctx.activities.length >= 1,
  },
  {
    id: "week_streak",
    title: "Consistency Champion",
    description: "Maintain a 7-day logging streak",
    icon: "🔥",
    unlockCondition: (ctx) => ctx.profile.streak >= 7,
  },
  {
    id: "month_streak",
    title: "Unstoppable",
    description: "Maintain a 30-day logging streak",
    icon: "💎",
    unlockCondition: (ctx) => ctx.profile.streak >= 30,
  },
  {
    id: "carbon_ninja",
    title: "Carbon Ninja",
    description: "Achieve a carbon score of 80 or higher",
    icon: "🥷",
    unlockCondition: (ctx) => ctx.carbonScore >= 80,
  },
  {
    id: "goal_crusher",
    title: "Goal Crusher",
    description: "Complete your first eco-goal",
    icon: "🏆",
    unlockCondition: (ctx) =>
      ctx.goals.some((goal) => goal.status === "completed"),
  },
  {
    id: "five_goals",
    title: "Ambitious Planner",
    description: "Complete 5 eco-goals",
    icon: "📋",
    unlockCondition: (ctx) =>
      ctx.goals.filter((goal) => goal.status === "completed").length >= 5,
  },
  {
    id: "low_carbon_month",
    title: "Green Month",
    description: "Keep monthly carbon below 200 kg CO2",
    icon: "🌍",
    unlockCondition: (ctx) => ctx.monthlyCarbon > 0 && ctx.monthlyCarbon < 200,
  },
  {
    id: "century_club",
    title: "Century Club",
    description: "Log 100 activities",
    icon: "💯",
    unlockCondition: (ctx) => ctx.activities.length >= 100,
  },
  {
    id: "transport_hero",
    title: "Transport Hero",
    description: "Log 20 green transport activities (bike or walking)",
    icon: "🚲",
    unlockCondition: (ctx) => {
      const greenTransport = ctx.activities.filter(
        (a) =>
          a.category === "transport" &&
          (a.unit === "bicycle" || a.unit === "walking" || a.carbonEmit === 0)
      );
      return greenTransport.length >= 20;
    },
  },
  {
    id: "zero_waste_day",
    title: "Zero Waste Day",
    description: "Log a day with zero carbon emissions",
    icon: "♻️",
    unlockCondition: (ctx) => {
      // Group activities by date and check if any day has 0 total carbon
      const dailyMap = new Map<string, number>();
      for (const activity of ctx.activities) {
        const dateKey = getDateKey(activity.date);
        if (dateKey) {
          dailyMap.set(dateKey, (dailyMap.get(dateKey) ?? 0) + activity.carbonEmit);
        }
      }
      return Array.from(dailyMap.values()).includes(0);
    },
  },
  {
    id: "social_butterfly",
    title: "Social Butterfly",
    description: "Earn 500 points from activities and streaks",
    icon: "🦋",
    unlockCondition: (ctx) => ctx.profile.points >= 500,
  },
  {
    id: "eco_warrior",
    title: "Eco Warrior",
    description: "Achieve a perfect carbon score of 100",
    icon: "⚔️",
    unlockCondition: (ctx) => ctx.carbonScore >= 100,
  },
] as const;
