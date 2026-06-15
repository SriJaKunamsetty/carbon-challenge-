import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "tailwind-merge": path.resolve(__dirname, "./__mocks__/tailwind-merge.ts"),
    },
  },
});
