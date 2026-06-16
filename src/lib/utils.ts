import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names with Tailwind CSS conflict resolution.
 *
 * Combines `clsx` for conditional class construction with `tailwind-merge`
 * for intelligent Tailwind CSS class deduplication.
 *
 * @param inputs - Class values (strings, arrays, objects, or conditionals)
 * @returns Merged class string with Tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
