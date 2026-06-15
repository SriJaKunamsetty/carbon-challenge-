/**
 * @module Button
 * @description Premium animated button component with multiple variants and sizes.
 * Supports loading states, keyboard accessibility, and reduced motion preferences.
 * Uses Framer Motion for micro-interactions.
 */
"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";

/** Button visual variant */
type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";

/** Button size */
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Button content */
  children: React.ReactNode;
}

/** Size-specific class names */
const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-1.5 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

/** Variant-specific class names */
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-500 text-black hover:bg-emerald-400 font-semibold shadow-[0_0_20px_0_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_0_rgba(16,185,129,0.3)] border border-emerald-400/20",
  secondary:
    "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/50 hover:border-zinc-600",
  outline:
    "bg-transparent text-zinc-200 border border-white/[0.08] hover:border-white/20 hover:bg-white/5",
  ghost: "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
  danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
  success:
    "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20",
};

/** Base styles shared across all button variants */
const baseStyles =
  "relative inline-flex items-center justify-center font-medium rounded-full transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";

/**
 * Premium animated button with accessibility support.
 * Respects prefers-reduced-motion for animations.
 *
 * @example
 * ```tsx
 * <Button variant="primary" onClick={handleSubmit} loading={isSubmitting}>
 *   Save Changes
 * </Button>
 * ```
 */
export const Button = memo(function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className,
  disabled,
  "aria-label": ariaLabel,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      aria-disabled={disabled || loading || undefined}
      {...props}
    >
      {loading && (
        <Loader2
          className="mr-2 h-4 w-4 motion-safe:animate-spin text-current"
          aria-hidden="true"
        />
      )}
      {loading && <span className="sr-only">Loading, please wait...</span>}
      {children}
    </motion.button>
  );
});
