import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.spec.ts",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
    screenshot: "only-on-failure", 
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: "npm run dev",
      port: 5173,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "cd ../back && npm run dev",
      port: 3000,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});