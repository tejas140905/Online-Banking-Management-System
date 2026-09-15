import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import NavBar from "../components/NavBar";
import { formatINR } from "../utils/currency";

const TABS = [
  { label: "Overview", href: "/dashboard", active: true },
  { label: "Transfer", href: "/transfer" },
  { label: "Transactions", href: "/transactions" },
  { label: "Profile", href: "/profile" },
];

const UserDashboard = ({ auth }) => {
  const [accounts, setAccounts] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(() => sessionStorage.getItem("activeAccount") || "");
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState(null);
  const [qTo, setQTo] = useState("");
  const [qAmount, setQAmount] = useState("");
  const [qMsg, setQMsg] = useState(null);
  const [qErr, setQErr] = useState(null);
  const [qLoading, setQLoading] = useState(false);
  const [pendingClosures, setPendingClosures] = useState([]);

  const fetchAccounts = async () => {
    try {
      const [{ data }, { data: closures }, { data: txns }] = await Promise.all([
        api.get("/accounts"),
        api.get("/accounts/closures/mine"),
        api.get("/accounts/transactions?limit=100"),
      ]);
      const list = data.accounts || [];
      setAccounts(list);
      setPendingClosures((closures.closures || []).filter((c) => c.status === "PENDING"));
      setRecent(txns.transactions || []);
      if (!sessionStorage.getItem("activeAccount") && list.length) {
        sessionStorage.setItem("activeAccount", list[0].account_number);
        setActive(list[0].account_number);
      }
      if (sessionStorage.getItem("activeAccount")) {
        setActive(sessionStorage.getItem("activeAccount"));
      }
    } catch (err) {
      // ignore in UI for brevity
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const select = (num) => {
    sessionStorage.setItem("activeAccount", num);
    setActive(num);
  };

  const openAccount = async (e) => {
    e.preventDefault();
    setMessage(null);
    const { data } = await api.post("/accounts", { label });
    setLabel("");
    setMessage(`Account ${data.accountNumber} opened`);
    await fetchAccounts();
    select(data.accountNumber);
  };

  // Close is a request: the account shuts only after admin approval.
  const closeAccount = async (accountNumber, balance) => {
    if (Number(balance) !== 0) return;
    if (!window.confirm(`Request closure of account ${accountNumber}? An admin must approve.`)) return;
    setMessage(null);
    try {
      const { data } = await api.delete(`/accounts/${accountNumber}`);
      setMessage(data.message);
      await fetchAccounts();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not request closure");
    }
  };

  const quickTransfer = async (e) => {
    e.preventDefault();
    setQLoading(true);
    setQMsg(null);
    setQErr(null);
    try {
      const { data } = await api.post("/accounts/transfer", {
        fromAccount: active,
        toAccount: qTo,
        amount: Number(qAmount),
      });
      setQMsg(data.message);
      setQTo("");
      setQAmount("");
      await fetchAccounts();
    } catch (err) {
      setQErr(err.response?.data?.message || "Transfer failed");
    } finally {
      setQLoading(false);
    }
  };

  const total = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  const activeAcc = accounts.find((a) => a.account_number === active) || accounts[0];
  const ownTargets = accounts.filter((a) => a.account_number !== active);
  const maxTxn = Math.max(...recent.map((t) => Number(t.amount || 0)), 1);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthTxns = recent.filter((t) => new Date(t.created_at) >= monthStart);
  const monthIn = monthTxns
    .filter((t) => accounts.some((a) => a.account_number === t.to_account))
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const monthOut = monthTxns
    .filter((t) => accounts.some((a) => a.account_number === t.from_account))
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const pendingFor = (num) => pendingClosures.some((c) => c.account_number === num);

  return (
    <div data-testid="dashboard" className="min-h-screen bg-slate-100 text-slate-800">
      <NavBar auth={auth} />
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4">
        <div className="flex flex-wrap gap-2">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              to={tab.href}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                tab.active ? "bg-emerald-600 text-white" : "bg-white text-slate-600 shadow-sm"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {/* LEFT 2/3 */}
          <div className="flex flex-col gap-3 lg:col-span-2">
            <div className="overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 text-white shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-widest text-emerald-100">Total Balance</div>
                  <div className="mt-1 text-4xl font-bold tabular-nums">
                    {loading ? "..." : formatINR(total)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white/20 px-2.5 py-1">
                      In this month {formatINR(monthIn)}
                    </span>
                    <span className="rounded-full bg-white/20 px-2.5 py-1">
                      Out this month {formatINR(monthOut)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold">
                    {auth.user?.role || "USER"}
                  </span>
                  <Link
                    to="/transfer"
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50"
                  >
                    New Transfer
                  </Link>
                </div>
              </div>
              {total > 0 && (
                <div className="mt-4">
                  <div className="flex h-2 w-full gap-1 overflow-hidden rounded-full">
                    {accounts.map((a, i) => (
                      <div
                        key={a.account_number}
                        title={`${a.label || a.account_number}: ${formatINR(a.balance)}`}
                        className={i % 2 === 0 ? "bg-white/90" : "bg-emerald-200"}
                        style={{ width: `${(Number(a.balance) / total) * 100}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-emerald-50">
                    {accounts.map((a) => (
                      <span key={a.account_number}>
                        {a.label || a.account_number.slice(-4)} •{" "}
                        {total ? Math.round((Number(a.balance) / total) * 100) : 0}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {accounts.slice(0, 2).map((acc, i) => (
                <button
                  key={acc.account_number}
                  type="button"
                  onClick={() => select(acc.account_number)}
                  className={`rounded-xl p-4 text-left text-white shadow-sm ${
                    i % 2 === 0
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                      : "bg-gradient-to-br from-cyan-500 to-sky-600"
                  } ${acc.account_number === active ? "ring-2 ring-slate-900 ring-offset-2" : ""}`}
                >
                  <div className="text-xs opacity-80">{acc.label || "Account"}</div>
                  <div className="mt-1 font-mono text-sm tracking-wider">
                    •••• {acc.account_number.slice(-4)}
                  </div>
                  <div className="mt-2 text-xl font-bold tabular-nums">{formatINR(acc.balance)}</div>
                </button>
              ))}
              {accounts.length === 0 && (
                <div className="rounded-xl bg-white p-4 text-sm text-slate-500 shadow-sm">
                  No accounts yet.
                </div>
              )}
            </div>

            <form
              onSubmit={quickTransfer}
              data-testid="quick-transfer-form"
              className="rounded-xl bg-white p-4 shadow-sm"
            >
              <div className="mb-2 text-sm font-semibold">Quick self transfer</div>
              <div className="flex flex-wrap gap-2">
                <select
                  data-testid="quick-transfer-to"
                  value={qTo}
                  onChange={(e) => setQTo(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm"
                  required
                >
                  <option value="">To my account</option>
                  {ownTargets.map((a) => (
                    <option key={a.account_number} value={a.account_number}>
                      {a.label ? `${a.label} — ` : ""}
                      {a.account_number}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  data-testid="quick-transfer-amount"
                  value={qAmount}
                  onChange={(e) => setQAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-28 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm"
                  required
                />
                <button
                  type="submit"
                  data-testid="quick-transfer-submit"
                  disabled={qLoading}
                  className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                >
                  {qLoading ? "Sending..." : "Send"}
                </button>
              </div>
              {qMsg && (
                <div data-testid="quick-transfer-success" className="mt-2 text-xs text-emerald-600">
                  {qMsg}
                </div>
              )}
              {qErr && (
                <div data-testid="quick-transfer-error" className="mt-2 text-xs text-red-600">
                  {qErr}
                </div>
              )}
            </form>
          </div>

          {/* RIGHT 1/3 */}
          <div className="flex flex-col gap-3">
            <div className="rounded-xl bg-white p-3 shadow-sm">
              <div className="mb-2 text-sm font-semibold">Accounts</div>
              <div
                data-testid="accounts-list"
                className="max-h-44 space-y-2 overflow-y-auto"
              >
                {accounts.map((acc) => {
                  const isActive = acc.account_number === active;
                  return (
                    <button
                      key={acc.account_number}
                      type="button"
                      data-testid={`account-card-${acc.account_number}`}
                      onClick={() => select(acc.account_number)}
                      className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-left text-sm ${
                        isActive ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <div className="text-xs text-slate-500">
                          {acc.label || "Account"}
                          {isActive && (
                            <span
                              data-testid="active-account-badge"
                              className="ml-1.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white"
                            >
                              Active
                            </span>
                          )}
                          {pendingFor(acc.account_number) && (
                            <span className="ml-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                              Pending approval
                            </span>
                          )}
                        </div>
                        <div className="font-semibold tabular-nums">{acc.account_number}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold tabular-nums text-emerald-700">
                          {formatINR(acc.balance)}
                        </div>
                        {Number(acc.balance) === 0 && !pendingFor(acc.account_number) && (
                          <span
                            role="button"
                            tabIndex={0}
                            data-testid={`close-account-${acc.account_number}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              closeAccount(acc.account_number, acc.balance);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") closeAccount(acc.account_number, acc.balance);
                            }}
                            className="text-[11px] text-red-500 hover:underline"
                          >
                            Close
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
                {!accounts.length && <div className="text-xs text-slate-500">No accounts yet.</div>}
              </div>
              <form onSubmit={openAccount} data-testid="open-account-form" className="mt-2 flex gap-2">
                <input
                  data-testid="open-account-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="New label, e.g. Savings"
                  maxLength={40}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs"
                />
                <button
                  type="submit"
                  data-testid="open-account-submit"
                  className="whitespace-nowrap rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Open
                </button>
              </form>
              {message && (
                <div data-testid="open-account-success" className="mt-1.5 text-xs text-emerald-600">
                  {message}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-white p-3 shadow-sm">
              <div className="mb-2 text-sm font-semibold">Activity</div>
              <div className="flex h-16 items-end gap-1.5">
                {recent.slice(0, 10).map((t) => (
                  <div
                    key={t.txn_id}
                    title={`${t.type} ${t.amount}`}
                    className={`flex-1 rounded-sm ${
                      t.to_account === activeAcc?.account_number ? "bg-emerald-500" : "bg-sky-400"
                    }`}
                    style={{ height: `${Math.max(12, (Number(t.amount) / maxTxn) * 100)}%` }}
                  />
                ))}
                {!recent.length && <div className="text-xs text-slate-400">No activity yet.</div>}
              </div>
            </div>

            <div className="rounded-xl bg-white p-3 shadow-sm">
              <div className="mb-2 text-sm font-semibold">Notifications</div>
              <div data-testid="notif-list" className="max-h-32 space-y-1.5 overflow-y-auto text-xs">
                {recent.slice(0, 5).map((t) => {
                  const incoming = t.to_account === activeAcc?.account_number;
                  return (
                    <div key={t.txn_id} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2 py-1.5">
                      <span
                        className={`h-2 w-2 shrink-0 rounded-full ${
                          incoming ? "bg-emerald-500" : "bg-sky-500"
                        }`}
                      />
                      <span className="truncate text-slate-600">
                        {incoming ? "Received" : "Sent"} {formatINR(t.amount)}
                        <span className="text-slate-400">
                          {" "}
                          • {new Date(t.created_at).toLocaleDateString()}
                        </span>
                      </span>
                    </div>
                  );
                })}
                {!recent.length && <div className="text-slate-400">You're all caught up.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
