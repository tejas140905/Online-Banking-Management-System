import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import NavBar from "../components/NavBar";
import { Card, BtnPrimary, Badge, inputCls } from "../components/ui";
import { formatINR } from "../utils/currency";

const TransferPage = ({ auth }) => {
  const [accounts, setAccounts] = useState([]);
  const [mode, setMode] = useState("self");
  const [form, setForm] = useState({
    fromAccount: sessionStorage.getItem("activeAccount") || "",
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
        fromAccount: f.fromAccount || sessionStorage.getItem("activeAccount") || list[0]?.account_number || "",
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
      setMessage(
        data.fromBalance !== undefined
          ? `${data.message} — new balance ${formatINR(data.fromBalance)}`
          : data.message,
      );
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
          <Card className="p-6">
            <form onSubmit={onSubmit} data-testid="transfer-form" className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  data-testid="transfer-mode-self"
                  onClick={() => {
                    setMode("self");
                    setForm((f) => ({ ...f, toAccount: "" }));
                  }}
                  className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
                    mode === "self" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
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
                  className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
                    mode === "another" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  Another account
                </button>
              </div>
              <label className="block text-sm font-medium text-slate-700">
                From account
                <select
                  data-testid="transfer-from"
                  value={form.fromAccount}
                  onChange={(e) => setForm({ ...form, fromAccount: e.target.value })}
                  className={inputCls}
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
                <label className="block text-sm font-medium text-slate-700">
                  To my account
                  <select
                    data-testid="transfer-to"
                    value={form.toAccount}
                    onChange={(e) => setForm({ ...form, toAccount: e.target.value })}
                    className={inputCls}
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
                <label className="block text-sm font-medium text-slate-700">
                  To account
                  <input
                    data-testid="transfer-to"
                    value={form.toAccount}
                    onChange={(e) => setForm({ ...form, toAccount: e.target.value })}
                    className={inputCls}
                    placeholder="Recipient account number"
                    required
                  />
                </label>
              )}
              <label className="block text-sm font-medium text-slate-700">
                Amount
                <input
                  type="number"
                  min="0"
                  data-testid="transfer-amount"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className={inputCls}
                  required
                />
              </label>
              {message && (
                <div data-testid="transfer-success" className="text-sm text-emerald-600">
                  {message}
                </div>
              )}
              {error && (
                <div data-testid="transfer-error" className="text-sm text-red-600">
                  {error}
                </div>
              )}
              <BtnPrimary type="submit" data-testid="transfer-submit" disabled={loading} className="w-full">
                {loading ? "Processing..." : "Send Transfer"}
              </BtnPrimary>
            </form>
          </Card>
          <Card className="h-fit p-6">
            <h3 className="text-base font-bold text-slate-900">Transfer checklist</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>
                <Badge tone="success">Atomic</Badge> Each transfer runs as a single SQL transaction.
              </li>
              <li>
                <Badge tone="info">Self</Badge> Move money between your own accounts instantly.
              </li>
              <li>
                <Badge tone="warn">Guarded</Badge> Same-account, unknown-account and
                insufficient-balance transfers are rejected.
              </li>
            </ul>
          </Card>
        </div>
      </PageShell>
    </div>
  );
};

export default TransferPage;
