/**
 * @module ProgressRing
 * @description Animated SVG circular progress ring for displaying carbon scores.
 * Includes accessible progressbar role with aria-valuenow/min/max.
 * Supports reduced motion preferences.
 */
"use client";

import React, { useEffect, useState, useMemo, memo } from "react";
import { motion } from "framer-motion";
import { getScoreRating } from "@/lib/carbon/score";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ProgressRingProps {
  /** Score value (0-100) */
  score: number;
  /** Ring diameter in pixels */
  size?: number;
  /** Ring stroke width in pixels */
  strokeWidth?: number;
  /** Whether to show the rating label below */
  showLabels?: boolean;
  /** Accessible label */
  "aria-label"?: string;
}

/**
 * Animated circular progress ring for carbon score visualization.
 * Uses SVG with Framer Motion for smooth animations.
 *
 * @example
 * ```tsx
 * <ProgressRing score={82} aria-label="Your carbon score is 82 out of 100" />
 * ```
 */
export const ProgressRing = memo(function ProgressRing({
  score,
  size = 180,
  strokeWidth = 14,
  showLabels = true,
  "aria-label": ariaLabel,
}: ProgressRingProps) {
  const prefersReducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);

  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => radius * 2 * Math.PI, [radius]);
  const rating = useMemo(() => getScoreRating(score), [score]);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const accessibleLabel =
    ariaLabel || `Carbon score: ${score} out of 100. Rating: ${rating.label}`;

  return (
    <div
      className="flex flex-col items-center justify-center"
    >
      <progress
        value={score}
        max={100}
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={accessibleLabel}
        className="sr-only"
      />
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow behind the ring */}
        <div
          className="absolute inset-2 -z-10 rounded-full blur-xl opacity-20 transition-all duration-1000"
          style={{ backgroundColor: rating.color }}
          aria-hidden="true"
        />

        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          aria-hidden="true"
          focusable="false"
        >
          <title>{accessibleLabel}</title>
          {/* Base Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth={strokeWidth}
          />
          {/* Progress Indicator */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={rating.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: prefersReducedMotion ? 0 : 1.2, ease: [0.16, 1, 0.3, 1] }}
            strokeLinecap="round"
          />
        </svg>

        {/* Central Score Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.3 }}
            className="text-4xl font-bold font-mono text-white tracking-tight"
            aria-hidden="true"
          >
            {score}
          </motion.span>
          <span
            className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5"
            aria-hidden="true"
          >
            Carbon Rating
          </span>
        </div>
      </div>

      {showLabels && (
        <div className="mt-4 text-center">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${rating.bgClass}`}
          >
            {rating.label}
          </span>
        </div>
      )}

      {/* Screen reader accessible summary */}
      <span className="sr-only">
        Your carbon score is {score} out of 100, rated as {rating.label}.
        {score >= 80 && " Excellent work on reducing your carbon footprint!"}
        {score >= 60 && score < 80 && " You are doing well, keep improving!"}
        {score < 60 && " There is room for improvement in reducing emissions."}
      </span>
    </div>
  );
});
