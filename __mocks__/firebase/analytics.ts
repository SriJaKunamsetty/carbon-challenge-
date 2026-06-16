/**
 * Manual mock for firebase/analytics.
 * Prevents Firebase Analytics from initializing in Node.js/JSDOM test environments.
 */
import { vi } from 'vitest';

export const getAnalytics = vi.fn(() => ({}));
export const logEvent = vi.fn();
export const setUserProperties = vi.fn();
export const isSupported = vi.fn(() => Promise.resolve(false));
export const setAnalyticsCollectionEnabled = vi.fn();
export const setCurrentScreen = vi.fn();
export const setUserId = vi.fn();
export const initializeAnalytics = vi.fn(() => ({}));
