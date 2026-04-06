import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      BASE_URL: "http://localhost:3001",
    },
  },
});
