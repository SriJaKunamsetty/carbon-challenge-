/**
 * @module Skeleton
 * @description Skeleton loading components for content placeholder animations.
 * Provides visual feedback during data loading states, improving perceived performance.
 * Supports reduced motion preferences.
 */
"use client";

import React, { memo } from "react";

interface SkeletonProps {
  /** CSS class name for customization */
  className?: string;
  /** Accessible label for screen readers */
  "aria-label"?: string;
  /** Custom inline styles */
  style?: React.CSSProperties;
}

/**
 * Base skeleton element with pulse animation.
 * Respects prefers-reduced-motion.
 */
export const Skeleton = memo(function Skeleton({
  className = "",
  "aria-label": ariaLabel = "Loading content",
  ...props
}: SkeletonProps) {
  return (
    <output
      aria-label={ariaLabel}
      className={`motion-safe:animate-pulse rounded-xl bg-zinc-800/50 ${className}`}
      style={props.style}
    />
  );
});

/**
 * Skeleton card matching the GlassCard dimensions.
 * Used as a placeholder while dashboard cards load.
 */
export const SkeletonCard = memo(function SkeletonCard() {
  return (
    <output
      aria-label="Loading card"
      className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" aria-label="Loading title" />
        <Skeleton className="h-8 w-8 rounded-lg" aria-label="Loading icon" />
      </div>
      <Skeleton className="h-8 w-32" aria-label="Loading value" />
      <Skeleton className="h-3 w-20" aria-label="Loading label" />
    </output>
  );
});

/**
 * Skeleton chart matching the analytics chart dimensions.
 * Used as a placeholder while chart data loads.
 */
export const SkeletonChart = memo(function SkeletonChart() {
  const [heights, setHeights] = React.useState<{ id: string; height: number }[]>([]);

  React.useEffect(() => {
    // Generate secure random heights on client mount
    const randomVals = new Uint32Array(7);
    crypto.getRandomValues(randomVals);
    setHeights(Array.from(randomVals).map((val, idx) => ({
      id: `bar-${idx}-${val}`,
      height: 30 + (val / (0xffffffff + 1)) * 70
    })));
  }, []);

  return (
    <output
      aria-label="Loading chart"
      className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-6 space-y-4"
    >
      <Skeleton className="h-4 w-32" aria-label="Loading chart title" />
      <div className="flex items-end gap-2 h-40">
        {heights.length > 0 ? (
          heights.map((item) => (
            <Skeleton
              key={item.id}
              className="flex-1 rounded-t-md"
              style={{ height: `${item.height}%` } as React.CSSProperties}
              aria-label="Loading bar"
            />
          ))
        ) : (
          [
            { id: "fallback-0" },
            { id: "fallback-1" },
            { id: "fallback-2" },
            { id: "fallback-3" },
            { id: "fallback-4" },
            { id: "fallback-5" },
            { id: "fallback-6" }
          ].map((item) => (
            <Skeleton
              key={item.id}
              className="flex-1 rounded-t-md"
              style={{ height: "50%" }}
              aria-label="Loading bar"
            />
          ))
        )}
      </div>
    </output>
  );
});

/**
 * Skeleton row for list/table loading states.
 */
export const SkeletonRow = memo(function SkeletonRow() {
  return (
    <output
      aria-label="Loading row"
      className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.04] bg-zinc-900/20"
    >
      <Skeleton className="h-10 w-10 rounded-full" aria-label="Loading avatar" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" aria-label="Loading name" />
        <Skeleton className="h-3 w-20" aria-label="Loading detail" />
      </div>
      <Skeleton className="h-6 w-16" aria-label="Loading value" />
    </output>
  );
});

/**
 * Full dashboard skeleton with multiple cards and charts.
 */
export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <output aria-label="Loading dashboard" className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: "card-0" },
          { id: "card-1" },
          { id: "card-2" },
          { id: "card-3" }
        ].map((item) => (
          <SkeletonCard key={item.id} />
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkeletonChart />
        <SkeletonChart />
      </div>
      {/* Activity list */}
      <div className="space-y-3">
        {[
          { id: "row-0" },
          { id: "row-1" },
          { id: "row-2" }
        ].map((item) => (
          <SkeletonRow key={item.id} />
        ))}
      </div>
      <span className="sr-only">Loading dashboard data, please wait...</span>
    </output>
  );
});
