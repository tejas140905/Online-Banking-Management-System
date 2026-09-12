import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import PageShell from "../components/PageShell";
import StatCard from "../components/StatCard";
import NavBar from "../components/NavBar";
import { formatINR } from "../utils/currency";

const UserDashboard = ({ auth }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(() => localStorage.getItem("activeAccount") || "");
  const [label, setLabel] = useState("");
  const [message, setMessage] = useState(null);

  const fetchAccounts = async () => {
    try {
      const { data } = await api.get("/accounts");
      const list = data.accounts || [];
      setAccounts(list);
      if (!localStorage.getItem("activeAccount") && list.length) {
        localStorage.setItem("activeAccount", list[0].account_number);
        setActive(list[0].account_number);
      }
      if (localStorage.getItem("activeAccount")) {
        setActive(localStorage.getItem("activeAccount"));
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
    localStorage.setItem("activeAccount", num);
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

  const total = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);

  return (
    <div data-testid="dashboard">
      <NavBar auth={auth} />
      <PageShell
        title="Customer Workspace"
        tabs={[
          { label: "Overview", href: "/dashboard", active: true },
          { label: "Transfer", href: "/transfer" },
          { label: "Transactions", href: "/transactions" },
          { label: "Profile", href: "/profile" },
        ]}
        actions={
          <Link
            to="/transfer"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface"
          >
            New Transfer
          </Link>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Total Balance" value={loading ? "..." : formatINR(total)} />
          <StatCard label="Accounts" value={accounts.length} />
          <StatCard label="Status" value={auth.user?.role || "USER"} hint="RBAC protected" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="glass rounded-xl border border-slate-800 p-4">
            <div className="mb-3 text-sm font-semibold text-white">
              My Accounts — tap to switch active account
            </div>
            <div data-testid="accounts-list" className="space-y-3">
              {accounts.map((acc) => {
                const isActive = acc.account_number === active;
                return (
                  <button
                    key={acc.account_number}
                    type="button"
                    data-testid={`account-card-${acc.account_number}`}
                    onClick={() => select(acc.account_number)}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left ${
                      isActive
                        ? "border-accent bg-secondary"
                        : "border-slate-800 bg-secondary hover:border-slate-600"
                    }`}
                  >
                    <div>
                      <div className="text-xs text-muted">
                        {acc.label || "Account"}
                        {isActive && (
                          <span
                            data-testid="active-account-badge"
                            className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-accent"
                          >
                            Active
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-white">{acc.account_number}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted">Balance</div>
                      <div className="font-semibold text-success">{formatINR(acc.balance)}</div>
                    </div>
                  </button>
                );
              })}
              {!accounts.length && <div className="text-sm text-muted">No accounts yet.</div>}
            </div>
            <form onSubmit={openAccount} data-testid="open-account-form" className="mt-4 flex gap-2">
              <input
                data-testid="open-account-label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="New account label (e.g. Savings)"
                maxLength={40}
                className="w-full rounded-lg border border-slate-800 bg-secondary px-3 py-2 text-sm text-white focus:border-accent"
              />
              <button
                type="submit"
                data-testid="open-account-submit"
                className="whitespace-nowrap rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface"
              >
                Open account
              </button>
            </form>
            {message && (
              <div data-testid="open-account-success" className="mt-2 text-sm text-success">
                {message}
              </div>
            )}
          </div>
          <div className="glass rounded-xl border border-slate-800 p-4">
            <div className="mb-3 text-sm font-semibold text-white">Next actions</div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>• Initiate a self transfer between your own accounts.</li>
              <li>• Send money to another account holder.</li>
              <li>• Review history to confirm settlement.</li>
              <li>• Update your profile for KYC accuracy.</li>
            </ul>
          </div>
        </div>
      </PageShell>
    </div>
  );
};

export default UserDashboard;
