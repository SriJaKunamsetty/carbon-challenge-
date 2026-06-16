/**
 * @module GlassCard
 * @description Glassmorphism card component with frosted glass effect.
 * Provides a reusable container with customizable glow color and glass intensity.
 * Supports semantic HTML roles and accessible labeling.
 */
"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Glow accent color (CSS color value) */
  glowColor?: string;
  /** Whether to show the glow effect */
  glow?: boolean;
  /** HTML element to render as */
  as?: "div" | "section" | "article" | "aside";
  /** Accessible label for the card */
  "aria-label"?: string;
  /** Accessible description ID */
  "aria-describedby"?: string;
  /** Click handler */
  onClick?: () => void;
  /** Keyboard handler */
  onKeyDown?: (e: React.KeyboardEvent) => void;
  /** Tab index for interactive cards */
  tabIndex?: number;
  /** ARIA role */
  role?: string;
}

/**
 * Glassmorphism card component with frosted glass aesthetic.
 * Used as the primary container for dashboard widgets, modals, and content blocks.
 *
 * @example
 * ```tsx
 * <GlassCard as="section" aria-label="Carbon Score">
 *   <h2>Your Score: 85</h2>
 * </GlassCard>
 * ```
 */
export const GlassCard = memo(function GlassCard({
  children,
  className,
  glowColor,
  glow = false,
  as: Component = "div",
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  onClick,
  onKeyDown,
  tabIndex,
  role,
}: GlassCardProps) {
  return (
    <Component
      className={cn(
        "relative rounded-2xl border border-white/[0.06] bg-zinc-900/40 backdrop-blur-xl",
        glow && "shadow-[0_0_30px_-5px_var(--glow-color)]",
        onClick && "cursor-pointer hover:border-white/10 transition-colors",
        className
      )}
      style={
        glowColor
          ? ({ "--glow-color": glowColor } as React.CSSProperties)
          : undefined
      }
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      onClick={onClick}
      onKeyDown={onKeyDown}
      tabIndex={tabIndex}
      role={role}
    >
      {children}
    </Component>
  );
});
