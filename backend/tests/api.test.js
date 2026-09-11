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
    if (!EMAIL || !PASSWORD) return t.skip("Set E2E_USER_EMAIL/E2E_USER_PASSWORD");
    const login = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
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
});
