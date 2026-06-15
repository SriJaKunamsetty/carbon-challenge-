import { CARBON_SCORE_BASELINE } from "@/constants/app-config";

/**
 * Calculates a normalized carbon score from 0 to 100.
 * A score of 100 means 0 emissions (highly sustainable).
 * A score of 0 means emissions are at or exceed the reference baseline.
 *
 * @param monthlyCarbonKg Raw monthly carbon emissions in kg CO2
 * @param baselineKg Reference baseline in kg CO2 (default from app config)
 */
export function calculateCarbonScore(
  monthlyCarbonKg: number,
  baselineKg: number = CARBON_SCORE_BASELINE
): number {
  if (monthlyCarbonKg <= 0) return 100;
  if (monthlyCarbonKg >= baselineKg) return 0;
  
  // Linear scale between 0 and baseline, inverted so lower carbon = higher score
  const score = ((baselineKg - monthlyCarbonKg) / baselineKg) * 100;
  return Math.round(score);
}

/**
 * Returns a descriptive rating and color class for a given carbon score.
 */
export function getScoreRating(score: number): {
  label: string;
  color: string;
  bgClass: string;
} {
  if (score >= 80) {
    return { label: "Excellent (Eco-Guardian)", color: "#10B981", bgClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
  } else if (score >= 60) {
    return { label: "Good (Active Saver)", color: "#3B82F6", bgClass: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
  } else if (score >= 40) {
    return { label: "Moderate (Typical)", color: "#F59E0B", bgClass: "bg-amber-500/10 text-amber-400 border-amber-500/20" };
  } else {
    return { label: "High Impact", color: "#EF4444", bgClass: "bg-red-500/10 text-red-400 border-red-500/20" };
  }
}
