import { useState, useEffect } from "react";

/**
 * Return value of the useOnlineStatus hook.
 */
export interface UseOnlineStatusReturn {
  /** Whether the browser currently has an internet connection */
  isOnline: boolean;
}

/**
 * Custom hook that tracks the browser's online/offline connectivity status.
 *
 * Uses `navigator.onLine` for the initial value and listens to the
 * `online` and `offline` window events for real-time updates.
 *
 * Returns `{ isOnline: true }` during server-side rendering.
 *
 * @returns An object containing the current online status
 *
 * @example
 * ```tsx
 * const { isOnline } = useOnlineStatus();
 *
 * if (!isOnline) {
 *   return <OfflineBanner />;
 * }
 * ```
 */
export function useOnlineStatus(): UseOnlineStatusReturn {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    /* c8 ignore next -- this branch only executes during SSR (window undefined in Node.js) */
    if (globalThis.window === undefined) return true;
    return navigator.onLine;
  });

  useEffect(() => {
    /* c8 ignore next -- this branch only executes during SSR (window undefined in Node.js) */
    if (globalThis.window === undefined) return;

    /**
     * Handler for the browser "online" event.
     */
    const handleOnline = (): void => {
      setIsOnline(true);
    };

    /**
     * Handler for the browser "offline" event.
     */
    const handleOffline = (): void => {
      setIsOnline(false);
    };

    globalThis.window.addEventListener("online", handleOnline);
    globalThis.window.addEventListener("offline", handleOffline);

    return () => {
      globalThis.window.removeEventListener("online", handleOnline);
      globalThis.window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline };
}
