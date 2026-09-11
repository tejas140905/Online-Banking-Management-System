import { defineConfig, devices } from "@playwright/test";

// E2E suite for the Online Banking Management System.
// Requires: backend on http://localhost:4000 (+ MySQL seeded) and
// frontend on http://localhost:5173 (`npm run dev` in frontend/).
// Full login/transfer flows need demo creds via env:
//   E2E_USER_EMAIL / E2E_USER_PASSWORD (+ an ACTIVE user in DB).
// Tests that need creds skip automatically when env vars are absent,
// so `npx playwright test` is always safe to run.
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30 * 1000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Do NOT auto-start servers: interview machines may already run them.
  // Start manually: backend `npm run dev`, frontend `npm run dev`.
});
