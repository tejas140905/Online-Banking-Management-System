import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import PageShell from "../components/PageShell";
import StatCard from "../components/StatCard";
import NavBar from "../components/NavBar";

const UserDashboard = ({ auth }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data } = await api.get("/accounts");
        setAccounts(data.accounts || []);
      } catch (err) {
        // ignore in UI for brevity
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

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
          <StatCard label="Total Balance" value={loading ? "..." : `$${total.toFixed(2)}`} />
          <StatCard label="Accounts" value={accounts.length} />
          <StatCard label="Status" value={auth.user?.role || "USER"} hint="RBAC protected" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="glass rounded-xl border border-slate-800 p-4">
            <div className="mb-3 text-sm font-semibold text-white">Accounts</div>
            <div data-testid="accounts-list" className="space-y-3">
              {accounts.map((acc) => (
                <div
                  key={acc.account_number}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-secondary px-3 py-2"
                >
                  <div>
                    <div className="text-xs text-muted">Account</div>
                    <div className="font-semibold text-white">{acc.account_number}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted">Balance</div>
                    <div className="font-semibold text-success">${Number(acc.balance).toFixed(2)}</div>
                  </div>
                </div>
              ))}
              {!accounts.length && <div className="text-sm text-muted">No accounts yet.</div>}
            </div>
          </div>
          <div className="glass rounded-xl border border-slate-800 p-4">
            <div className="mb-3 text-sm font-semibold text-white">Next actions</div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>• Initiate a transfer between verified accounts.</li>
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
