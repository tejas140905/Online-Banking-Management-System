import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import NavBar from "../components/NavBar";
import { formatINR } from "../utils/currency";

const TransferPage = ({ auth }) => {
  const [accounts, setAccounts] = useState([]);
  const [mode, setMode] = useState("self");
  const [form, setForm] = useState({
    fromAccount: localStorage.getItem("activeAccount") || "",
    toAccount: "",
    amount: "",
  });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      const { data } = await api.get("/accounts");
      const list = data.accounts || [];
      setAccounts(list);
      setForm((f) => ({
        ...f,
        fromAccount: f.fromAccount || localStorage.getItem("activeAccount") || list[0]?.account_number || "",
      }));
    };
    fetchAccounts();
  }, []);

  const ownTargets = accounts.filter((a) => a.account_number !== form.fromAccount);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      const { data } = await api.post("/accounts/transfer", payload);
      setMessage(data.message);
      setForm((f) => ({ ...f, amount: "" }));
      // Balances changed on the server — refetch so every figure on this
      // page (dropdown balances) matches the backend exactly.
      const { data: accData } = await api.get("/accounts");
      setAccounts(accData.accounts || []);
    } catch (err) {
      setError(err.response?.data?.message || "Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <NavBar auth={auth} />
      <PageShell
        title="Transfer Funds"
        tabs={[
          { label: "Overview", href: "/dashboard" },
          { label: "Transfer", href: "/transfer", active: true },
          { label: "Transactions", href: "/transactions" },
          { label: "Profile", href: "/profile" },
        ]}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {auth.user?.role === "ADMIN" ? (
            <div
              data-testid="transfer-view-only"
              className="glass rounded-xl border border-slate-800 p-6"
            >
              <h3 className="text-lg font-semibold text-white">View-only access</h3>
              <p className="mt-2 text-sm text-slate-300">
                Admin accounts cannot move currency. Monitor all transfers under Admin →
                Transactions.
              </p>
            </div>
          ) : (
          <form onSubmit={onSubmit} data-testid="transfer-form" className="glass rounded-xl border border-slate-800 p-6">
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                data-testid="transfer-mode-self"
                onClick={() => {
                  setMode("self");
                  setForm((f) => ({ ...f, toAccount: "" }));
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                  mode === "self" ? "bg-accent text-surface" : "border border-slate-700 text-slate-300"
                }`}
              >
                Self transfer
              </button>
              <button
                type="button"
                data-testid="transfer-mode-another"
                onClick={() => {
                  setMode("another");
                  setForm((f) => ({ ...f, toAccount: "" }));
                }}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${
                  mode === "another" ? "bg-accent text-surface" : "border border-slate-700 text-slate-300"
                }`}
              >
                Another account
              </button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm text-slate-200">
                From account
                <select
                  data-testid="transfer-from"
                  value={form.fromAccount}
                  onChange={(e) => setForm({ ...form, fromAccount: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-secondary px-3 py-2 text-white focus:border-accent"
                  required
                >
                  <option value="">Select account</option>
                  {accounts.map((acc) => (
                    <option key={acc.account_number} value={acc.account_number}>
                      {acc.label ? `${acc.label} — ` : ""}
                      {acc.account_number} — {formatINR(acc.balance)}
                    </option>
                  ))}
                </select>
              </label>
              {mode === "self" ? (
                <label className="block text-sm text-slate-200">
                  To my account
                  <select
                    data-testid="transfer-to"
                    value={form.toAccount}
                    onChange={(e) => setForm({ ...form, toAccount: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-secondary px-3 py-2 text-white focus:border-accent"
                    required
                  >
                    <option value="">Select account</option>
                    {ownTargets.map((acc) => (
                      <option key={acc.account_number} value={acc.account_number}>
                        {acc.label ? `${acc.label} — ` : ""}
                        {acc.account_number} — {formatINR(acc.balance)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="block text-sm text-slate-200">
                  To account
                  <input
                    data-testid="transfer-to"
                    value={form.toAccount}
                    onChange={(e) => setForm({ ...form, toAccount: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-800 bg-secondary px-3 py-2 text-white focus:border-accent"
                    placeholder="Recipient account number"
                    required
                  />
                </label>
              )}
              <label className="block text-sm text-slate-200">
                Amount
                <input
                  type="number"
                  min="0"
                  data-testid="transfer-amount"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-800 bg-secondary px-3 py-2 text-white focus:border-accent"
                  required
                />
              </label>
              {message && <div data-testid="transfer-success" className="text-sm text-success">{message}</div>}
              {error && <div data-testid="transfer-error" className="text-sm text-danger">{error}</div>}
              <button
                type="submit"
                data-testid="transfer-submit"
                disabled={loading}
                className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface hover:bg-sky-400 disabled:opacity-70"
              >
                {loading ? "Processing..." : "Send Transfer"}
              </button>
            </div>
          </form>
          )}
          <div className="glass rounded-xl border border-slate-800 p-6">
            <h3 className="text-lg font-semibold text-white">Transfer checklist</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              <li>• Self transfer moves money between your own accounts.</li>
              <li>• Validate destination account for external transfers.</li>
              <li>• Prevent self-transfer to the same account and insufficient balance.</li>
              <li>• Each transfer runs as an atomic SQL transaction.</li>
            </ul>
          </div>
        </div>
      </PageShell>
    </div>
  );
};

export default TransferPage;
