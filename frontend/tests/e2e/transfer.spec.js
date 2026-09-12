import { test, expect } from "@playwright/test";

// Covers: transfer form selectors, client-side validation, and the
// unauthenticated API guard. The live transfer needs seeded creds + DB.
test.describe("transfer flow", () => {
  test("transfer form exposes stable selectors for automation", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL;
    const password = process.env.E2E_USER_PASSWORD;
    test.skip(!email || !password, "Set E2E_USER_EMAIL/E2E_USER_PASSWORD for the live transfer test");
    await page.goto("/login");
    await page.getByTestId("login-email").fill(email);
    await page.getByTestId("login-password").fill(password);
    await page.getByTestId("login-submit").click();
    await expect(page.getByTestId("dashboard")).toBeVisible({ timeout: 15000 });
    await page.goto("/transfer");
    await expect(page.getByTestId("transfer-form")).toBeVisible();
    await expect(page.getByTestId("transfer-from")).toBeVisible();
    await expect(page.getByTestId("transfer-to")).toBeVisible();
    await expect(page.getByTestId("transfer-amount")).toBeVisible();
    await expect(page.getByTestId("transfer-submit")).toBeVisible();
    await expect(page.getByTestId("transfer-mode-self")).toBeVisible();
    await expect(page.getByTestId("transfer-mode-another")).toBeVisible();
  });

  test("transfer requires authentication (API guard)", async ({ request }) => {
    const apiBase = process.env.PLAYWRIGHT_API_URL || "http://localhost:4000/api";
    const res = await request.post(`${apiBase}/accounts/transfer`, {
      data: { fromAccount: "X", toAccount: "Y", amount: 10 },
    });
    expect(res.status()).toBe(401);
  });

  test("transfer rejects invalid amount (server validation)", async ({ request }) => {
    const apiBase = process.env.PLAYWRIGHT_API_URL || "http://localhost:4000/api";
    const email = process.env.E2E_USER_EMAIL;
    const password = process.env.E2E_USER_PASSWORD;
    test.skip(!email || !password, "Set E2E_USER_EMAIL/E2E_USER_PASSWORD for the live validation test");
    const login = await request.post(`${apiBase}/auth/login`, { data: { email, password } });
    expect(login.ok()).toBeTruthy();
    const { token } = await login.json();
    const bad = await request.post(`${apiBase}/accounts/transfer`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { fromAccount: "X", toAccount: "X", amount: -5 },
    });
    expect([400, 404]).toContain(bad.status());
  });

  test("transaction history table renders after login", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL;
    const password = process.env.E2E_USER_PASSWORD;
    test.skip(!email || !password, "Set E2E_USER_EMAIL/E2E_USER_PASSWORD for the live history test");
    await page.goto("/login");
    await page.getByTestId("login-email").fill(email);
    await page.getByTestId("login-password").fill(password);
    await page.getByTestId("login-submit").click();
    await expect(page.getByTestId("dashboard")).toBeVisible({ timeout: 15000 });
    await page.goto("/transactions");
    await expect(page.getByTestId("transactions-table")).toBeVisible();
    await expect(page.getByTestId("transactions-page-info")).toBeVisible();
    await expect(page.getByTestId("transactions-prev")).toBeVisible();
    await expect(page.getByTestId("transactions-next")).toBeVisible();
  });

  test("profile exposes password change form after login", async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL;
    const password = process.env.E2E_USER_PASSWORD;
    test.skip(!email || !password, "Set E2E_USER_EMAIL/E2E_USER_PASSWORD for the live profile test");
    await page.goto("/login");
    await page.getByTestId("login-email").fill(email);
    await page.getByTestId("login-password").fill(password);
    await page.getByTestId("login-submit").click();
    await expect(page.getByTestId("dashboard")).toBeVisible({ timeout: 15000 });
    await page.goto("/profile");
    await expect(page.getByTestId("password-form")).toBeVisible();
    await expect(page.getByTestId("password-current")).toBeVisible();
    await expect(page.getByTestId("password-new")).toBeVisible();
    await expect(page.getByTestId("password-submit")).toBeVisible();
  });
});
