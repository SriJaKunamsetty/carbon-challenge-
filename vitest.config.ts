/**
 * @fileoverview Vitest configuration for CarbonMind AI.
 * Configures test environment, coverage thresholds, path aliases,
 * and setup files for comprehensive testing.
 */
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    /** Use jsdom for React component testing */
    environment: "jsdom",
    /** Enable global test utilities (describe, it, expect, vi) */
    globals: true,
    /** Path aliases matching tsconfig */
    alias: {
      "@": path.resolve(__dirname, "./src"),
      /**
       * Redirect tailwind-merge to our mock during tests.
       * tailwind-merge v3 requires Tailwind CSS v4 config at import time,
       * which is not available in the JSDOM test environment.
       */
      "tailwind-merge": path.resolve(__dirname, "./__mocks__/tailwind-merge.ts"),
      /**
       * Redirect firebase/auth to our manual mock to prevent
       * auth/operation-not-supported-in-this-environment errors in Node.js.
       * Individual test files can still override specific mock behaviors via vi.mock().
       */
      "firebase/auth": path.resolve(__dirname, "./__mocks__/firebase/auth.ts"),
      /**
       * Redirect firebase/firestore to our manual mock to prevent
       * real Firestore validation errors in Node.js test environment.
       */
      "firebase/firestore": path.resolve(__dirname, "./__mocks__/firebase/firestore.ts"),
      /**
       * Redirect firebase/analytics to our manual mock to prevent
       * real Analytics initialization in Node.js test environment.
       */
      "firebase/analytics": path.resolve(__dirname, "./__mocks__/firebase/analytics.ts"),
      /**
       * Redirect js-cookie to our manual mock to prevent native ESM
       * interop issues with vi.mock() in Vitest's Node.js environment.
       */
      "js-cookie": path.resolve(__dirname, "./__mocks__/js-cookie.ts"),
    },
    /** Global test setup file */
    setupFiles: ["./src/tests/setup.tsx"],
    /** Include patterns for test discovery */
    include: [
      "src/**/*.test.{ts,tsx}",
      "src/**/*.spec.{ts,tsx}",
    ],
    /** Exclude patterns */
    exclude: [
      "node_modules",
      ".next",
      "functions",
      "e2e",
    ],
    /** Coverage configuration */
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: [
        "src/lib/**/*.ts",
        "src/components/**/*.tsx",
        "src/hooks/**/*.ts",
        "src/services/**/*.ts",
        "src/context/**/*.tsx",
        "src/app/api/**/*.ts",
      ],
      exclude: [
        "src/tests/**",
        "src/**/*.test.*",
        "src/**/*.spec.*",
        "src/types/**",
        "src/**/index.ts",
      ],
      thresholds: {
        lines: 85,
        branches: 80,
        functions: 85,
        statements: 85,
      },
    },
    /** Test timeout */
    testTimeout: 10000,
  },
});
