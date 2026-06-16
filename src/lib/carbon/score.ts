import { CARBON_SCORE_BASELINE } from "@/constants/app-config";

// ── Score rating thresholds ───────────────────────────────────────────────────

/** Minimum score for the "Excellent" / Eco-Guardian rating */
const SCORE_EXCELLENT_MIN = 80;

/** Minimum score for the "Good" / Active Saver rating */
const SCORE_GOOD_MIN = 60;

/** Minimum score for the "Moderate" / Typical rating */
const SCORE_MODERATE_MIN = 40;

// ── Score calculation ─────────────────────────────────────────────────────────

/**
 * Calculates a normalized carbon score from 0 to 100.
 * A score of 100 means zero emissions (highly sustainable).
 * A score of 0 means emissions are at or exceed the reference baseline.
 *
 * The scale is linear: each kg of CO₂ below the baseline adds one point.
 *
 * @param monthlyCarbonKg - Raw monthly carbon emissions in kg CO₂
 * @param baselineKg - Reference baseline in kg CO₂ (default from app config)
 * @returns Integer score in the range [0, 100]
 */
export function calculateCarbonScore(
  monthlyCarbonKg: number,
  baselineKg: number = CARBON_SCORE_BASELINE
): number {
  if (monthlyCarbonKg <= 0) return 100;
  if (monthlyCarbonKg >= baselineKg) return 0;

  // Linear scale: lower carbon → higher score
  const score = ((baselineKg - monthlyCarbonKg) / baselineKg) * 100;
  return Math.round(score);
}

// ── Score rating ──────────────────────────────────────────────────────────────

/** Visual and semantic rating information for a given carbon score */
export interface ScoreRating {
  /** Human-readable label */
  label: string;
  /** CSS colour value for charts and indicators */
  color: string;
  /** Tailwind CSS class string for badge styling */
  bgClass: string;
}

/**
 * Returns a descriptive rating object for a given carbon score.
 *
 * | Score range | Label               |
 * |-------------|---------------------|
 * | 80 – 100    | Excellent (Eco-Guardian) |
 * | 60 – 79     | Good (Active Saver) |
 * | 40 – 59     | Moderate (Typical)  |
 * | 0 – 39      | High Impact         |
 *
 * @param score - Carbon score in the range [0, 100]
 * @returns Rating object with label, color, and Tailwind bgClass
 */
export function getScoreRating(score: number): ScoreRating {
  if (score >= SCORE_EXCELLENT_MIN) {
    return {
      label: "Excellent (Eco-Guardian)",
      color: "#10B981",
      bgClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    };
  }
  if (score >= SCORE_GOOD_MIN) {
    return {
      label: "Good (Active Saver)",
      color: "#3B82F6",
      bgClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };
  }
  if (score >= SCORE_MODERATE_MIN) {
    return {
      label: "Moderate (Typical)",
      color: "#F59E0B",
      bgClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
  }
  return {
    label: "High Impact",
    color: "#EF4444",
    bgClass: "bg-red-500/10 text-red-400 border-red-500/20",
  };
}
