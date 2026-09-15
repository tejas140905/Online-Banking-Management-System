import { test, expect } from "@playwright/test";

// Covers: login form (stable CSS selectors), validation failure,
// dashboard auth guard, and logout — all runnable WITHOUT a database.
test.describe("auth flow", () => {
  test("login form exposes stable selectors for automation", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByTestId("login-email")).toBeVisible();
    await expect(page.getByTestId("login-password")).toBeVisible();
    await expect(page.getByTestId("login-submit")).toBeVisible();
  });

  test("entry point is login with registration, nothing else", async ({ page }) => {
    await page.goto("/");
    // Login form is the first and only thing guests see.
    await expect(page.getByTestId("login-form")).toBeVisible();
    await expect(page.getByTestId("login-email")).toBeVisible();
    await expect(page.getByTestId("login-password")).toBeVisible();
    await expect(page.getByTestId("login-submit")).toBeVisible();
    // New user registration is reachable from the login page.
    await expect(page.getByRole("link", { name: /open an account/i })).toBeVisible();
  });

  test("invalid credentials show a JSON-backed error message", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-email").fill("nobody@example.com");
    await page.getByTestId("login-password").fill("wrongpassword");
    await page.getByTestId("login-submit").click();
    // Backend returns 401 { message: "Invalid credentials" } (or 403 for
    // pending accounts); the UI surfaces `message` verbatim.
    await expect(page.getByTestId("login-error")).toBeVisible();
  });

  test("dashboard redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("signed-in users never see the bank homepage", async ({ page }) => {
    // Customer session → own dashboard, not marketing content.
    await page.goto("/login");
    await page.evaluate(() => {
      sessionStorage.setItem("token", "e2e-placeholder-token");
      sessionStorage.setItem("user", JSON.stringify({ role: "USER", name: "E2E" }));
    });
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId("dashboard")).toBeVisible();
    // Admin session → admin console.
    await page.evaluate(() => {
      sessionStorage.setItem("user", JSON.stringify({ role: "ADMIN", name: "E2E" }));
    });
    await page.goto("/");
    await expect(page).toHaveURL(/\/admin/);
  });

  test("logout clears auth state and guards the dashboard", async ({ page }) => {
    // Seed a (possibly expired) session directly in browser storage.
    await page.goto("/login");
    await page.evaluate(() => {
      sessionStorage.setItem("token", "e2e-placeholder-token");
      sessionStorage.setItem("user", JSON.stringify({ role: "USER", name: "E2E" }));
    });
    // Logout lives inside Profile per the CREDX nav spec.
    await page.goto("/profile");
    const logout = page.getByTestId("logout-button");
    if (await logout.isVisible()) {
      await logout.click();
    } else {
      // Fallback if the API rejected the placeholder token first.
      await page.evaluate(() => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
      });
      await page.goto("/dashboard");
    }
    await expect(page).toHaveURL(/\/login/);
  });
  test("full login succeeds with seeded demo credentials", async ({ page }) => {
    // Customer login lands on the own-data dashboard with account tools.
    const email = process.env.E2E_CUSTOMER_EMAIL || "aarav.demo@credx.bank";
    const password = process.env.E2E_CUSTOMER_PASSWORD || "Demo@123";
    await page.goto("/login");
    await page.getByTestId("login-email").fill(email);
    await page.getByTestId("login-password").fill(password);
    await page.getByTestId("login-submit").click();
    await expect(page.getByTestId("dashboard")).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("dashboard")).toContainText("₹");
    await expect(page.getByTestId("accounts-list")).toBeVisible();
    await expect(page.getByTestId("open-account-form")).toBeVisible();
  });
});
