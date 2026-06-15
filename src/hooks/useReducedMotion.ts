import { useState, useEffect } from "react";

/** The media query string for detecting reduced motion preference */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Custom hook that detects whether the user prefers reduced motion.
 *
 * Listens to the `prefers-reduced-motion` CSS media query via the
 * `matchMedia` API and returns a boolean that updates in real-time
 * when the user changes their OS/browser setting.
 *
 * Returns `false` during server-side rendering (when `window` is not available).
 *
 * @returns `true` if the user prefers reduced motion, `false` otherwise
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * return (
 *   <motion.div
 *     animate={{ opacity: 1 }}
 *     transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
 *   />
 * );
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    /* c8 ignore next -- this branch only executes during SSR (window undefined in Node.js) */
    if (globalThis.window === undefined) return false;
    return globalThis.window.matchMedia(REDUCED_MOTION_QUERY).matches;
  });

  useEffect(() => {
    /* c8 ignore next -- this branch only executes during SSR (window undefined in Node.js) */
    if (globalThis.window === undefined) return;

    const mediaQuery = globalThis.window.matchMedia(REDUCED_MOTION_QUERY);

    /**
     * Handler for media query change events.
     */
    const handleChange = (event: MediaQueryListEvent): void => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);



    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return prefersReducedMotion;
}
