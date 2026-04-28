import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    testTimeout: 15000,
    env: {
      COOKIE_SECRET: "test-secret-for-vitest-do-not-use-in-prod",
      NODE_ENV: "test",
    },
  },
});
