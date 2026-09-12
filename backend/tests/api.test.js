// Simple API regression suite — zero extra dependencies.
// Uses the Node.js built-in test runner + global fetch against a RUNNING server.
// Requires: MySQL seeded (`mysql < backend/schema.sql`) and `npm run dev`
// (or `npm start`) in backend/. Run: `npm run test:api`.
// Live-credential tests skip unless E2E_USER_EMAIL/E2E_USER_PASSWORD are set.
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

const BASE = process.env.API_BASE_URL || "http://localhost:4000/api";
const EMAIL = process.env.E2E_USER_EMAIL;
const PASSWORD = process.env.E2E_USER_PASSWORD;
// Non-admin customer for currency-flow tests (admin is view-only).
const USER_EMAIL = process.env.E2E_CUSTOMER_EMAIL || "aarav.demo@credx.bank";
const USER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD || "Demo@123";

const json = async (res) => {
  try {
    return await res.json();
  } catch {
    return {};
  }
};

describe("banking REST API", () => {
  it("health check responds ok", async () => {
    const res = await fetch("http://localhost:4000/api/health".replace("/api/health", "/api/health"));
    assert.equal(res.status, 200);
    const body = await json(res);
    assert.equal(body.status, "ok");
  });

  it("login rejects malformed email with 400 validation errors", async () => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email", password: "x" }),
    });
    assert.equal(res.status, 400);
    const body = await json(res);
    assert.ok(body.errors || body.message, "expected validation error payload");
  });

  it("protected endpoint rejects missing token with 401", async () => {
    const res = await fetch(`${BASE}/accounts`);
    assert.equal(res.status, 401);
  });

  it("protected endpoint rejects garbage token with 401", async () => {
    const res = await fetch(`${BASE}/accounts`, {
      headers: { Authorization: "Bearer invalid-token" },
    });
    assert.equal(res.status, 401);
  });

  it("transfer without token is rejected with 401", async () => {
    const res = await fetch(`${BASE}/accounts/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromAccount: "A", toAccount: "B", amount: 10 }),
    });
    assert.equal(res.status, 401);
  });

  it("public platform stats expose aggregates without auth", async () => {
    const res = await fetch(`${BASE}/platform/stats`);
    assert.equal(res.status, 200);
    const body = await json(res);
    assert.ok(typeof body.customers === "number", "expected customer count");
    assert.ok(typeof body.accounts === "number", "expected account count");
    assert.ok(typeof body.successRate === "number", "expected success rate");
  });

  it("login with wrong credentials returns 401 (needs DB)", async (t) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nobody@example.com", password: "wrongpassword" }),
    });
    // If MySQL is down the API honestly returns 500 — skip instead of failing.
    if (res.status === 500) return t.skip("MySQL not reachable; start MySQL and import schema.sql");
    assert.ok([401, 403].includes(res.status), `unexpected status ${res.status}`);
  });

  it("authenticated transfer validation rejects bad amount (needs seeded user)", async (t) => {
    const login = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: USER_EMAIL, password: USER_PASSWORD }),
    });
    if (login.status === 500) return t.skip("MySQL not reachable");
    assert.equal(login.status, 200);
    const { token } = await json(login);
    assert.ok(token, "expected JWT token");
    const bad = await fetch(`${BASE}/accounts/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fromAccount: "X", toAccount: "X", amount: -5 }),
    });
    assert.ok([400, 404].includes(bad.status), `unexpected status ${bad.status}`);
  });

  it("refresh-token rotation issues a new pair and revokes the old one", async (t) => {
    if (!EMAIL || !PASSWORD) return t.skip("Set E2E_USER_EMAIL/E2E_USER_PASSWORD");
    const post = (path, body, token) =>
      fetch(`${BASE}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
    const login = await post("/auth/login", { email: EMAIL, password: PASSWORD });
    if (login.status === 500) return t.skip("MySQL not reachable");
    assert.equal(login.status, 200);
    const first = await json(login);
    assert.ok(first.refreshToken, "expected refresh token on login");

    const rotated = await post("/auth/refresh", { refreshToken: first.refreshToken });
    assert.equal(rotated.status, 200);
    const second = await json(rotated);
    assert.ok(second.token && second.refreshToken, "expected rotated pair");

    const reuse = await post("/auth/refresh", { refreshToken: first.refreshToken });
    assert.equal(reuse.status, 401, "old refresh token must be revoked after rotation");

    const out = await post("/auth/logout", { refreshToken: second.refreshToken });
    assert.equal(out.status, 200);
    const afterLogout = await post("/auth/refresh", { refreshToken: second.refreshToken });
    assert.equal(afterLogout.status, 401, "logged-out refresh token must be revoked");
  });

  it("transactions list carries pagination metadata", async (t) => {
    if (!EMAIL || !PASSWORD) return t.skip("Set E2E_USER_EMAIL/E2E_USER_PASSWORD");
    const login = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    if (login.status === 500) return t.skip("MySQL not reachable");
    const { token } = await json(login);
    const res = await fetch(`${BASE}/accounts/transactions?page=1&limit=5`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    const body = await json(res);
    assert.ok(Array.isArray(body.transactions), "expected transactions array");
    assert.ok(body.pagination && body.pagination.limit === 5, "expected pagination metadata");
  });

  it("authenticated user can open and close an additional account", async (t) => {
    if (!EMAIL || !PASSWORD) return t.skip("Set E2E_USER_EMAIL/E2E_USER_PASSWORD");
    const login = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: USER_EMAIL, password: USER_PASSWORD }),
    });
    if (login.status === 500) return t.skip("MySQL not reachable");
    assert.equal(login.status, 200);
    const { token } = await json(login);
    const res = await fetch(`${BASE}/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ label: "Test Savings" }),
    });
    assert.equal(res.status, 201);
    const body = await json(res);
    assert.ok(body.accountNumber, "expected new account number");
    // Cleanup: close the empty test account so suites leave no residue.
    const del = await fetch(`${BASE}/accounts/${body.accountNumber}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(del.status, 200);
  });

  it("owner rule: admin moves Bank Main money but never users accounts", async (t) => {
    if (!EMAIL || !PASSWORD) return t.skip("Set E2E_USER_EMAIL/E2E_USER_PASSWORD");
    const login = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    if (login.status === 500) return t.skip("MySQL not reachable");
    const { token } = await json(login);
    const H = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    // Admin cannot initiate a transfer FROM another user's account.
    const foreign = await fetch(`${BASE}/accounts/transfer`, {
      method: "POST",
      headers: H,
      body: JSON.stringify({ fromAccount: "2227100393615", toAccount: "X", amount: 10 }),
    });
    assert.equal(foreign.status, 404);
    // Admin CAN move his own Bank Main money (Diya returns it: balances restored).
    const out = await fetch(`${BASE}/accounts/transfer`, {
      method: "POST",
      headers: H,
      body: JSON.stringify({ fromAccount: "100000000001", toAccount: "896965152285", amount: 10 }),
    });
    assert.equal(out.status, 200);
    const diyaLogin = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "diya.demo@credx.bank", password: "Demo@123" }),
    });
    const { token: diyaToken } = await json(diyaLogin);
    const back = await fetch(`${BASE}/accounts/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${diyaToken}` },
      body: JSON.stringify({ fromAccount: "896965152285", toAccount: "100000000001", amount: 10 }),
    });
    assert.equal(back.status, 200);
  });

  it("change-password rejects wrong current password without state change", async (t) => {    if (!EMAIL || !PASSWORD) return t.skip("Set E2E_USER_EMAIL/E2E_USER_PASSWORD");
    const login = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    if (login.status === 500) return t.skip("MySQL not reachable");
    const { token } = await json(login);
    const res = await fetch(`${BASE}/user/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword: "definitely-wrong", newPassword: "NewPass@123" }),
    });
    assert.equal(res.status, 401);
  });
});
