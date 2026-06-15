/**
 * @module SkipLink
 * @description Accessible skip navigation link component.
 * Allows keyboard users to bypass navigation and jump directly to main content.
 * Visible only on keyboard focus (Tab key).
 *
 * @see https://www.w3.org/WAI/WCAG22/Techniques/general/G1
 */
"use client";

import React, { memo } from "react";

interface SkipLinkProps {
  /** ID of the target content element to skip to */
  targetId?: string;
  /** Custom link text */
  label?: string;
}

/**
 * Skip navigation link for keyboard accessibility.
 * Hidden by default, appears on focus (Tab key press).
 *
 * @example
 * ```tsx
 * // In layout
 * <SkipLink targetId="main-content" />
 * <nav>...</nav>
 * <main id="main-content">...</main>
 * ```
 */
export const SkipLink = memo(function SkipLink({
  targetId = "main-content",
  label = "Skip to main content",
}: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:bg-emerald-600 focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-black transition-all"
    >
      {label}
    </a>
  );
});
