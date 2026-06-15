import { useState, useEffect } from "react";

/**
 * Custom hook that debounces a value by the given delay.
 *
 * Returns the debounced version of the input value, which only updates
 * after the specified number of milliseconds have elapsed without the
 * input value changing. Useful for delaying expensive operations like
 * API calls or search filtering until the user has stopped typing.
 *
 * @typeParam T - The type of the value being debounced
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds
 * @returns The debounced value, updated only after `delay` ms of inactivity
 *
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState("");
 * const debouncedSearch = useDebounce(searchTerm, 300);
 *
 * useEffect(() => {
 *   // This effect only fires 300ms after the user stops typing
 *   performSearch(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
