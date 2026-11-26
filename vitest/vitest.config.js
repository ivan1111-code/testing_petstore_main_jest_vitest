import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    setupFiles: ["./tests/support/setup.js"],
    testTimeout: 15000,
    hookTimeout: 15000,
    fileParallelism: false,
    sequence: { concurrent: false },
    reporters: ["default"],
  },
});