import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import PageShell from "../components/PageShell";
import StatCard from "../components/StatCard";
import NavBar from "../components/NavBar";
import { formatINR } from "../utils/currency";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [{ data: s }, { data: p }, { data: l }] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/users/pending"),
          api.get("/admin/logs?limit=8"),
        ]);
        setStats(s);
        setPending(p.users || []);
        setActivity(l.logs || []);
      } catch {
        // dashboard shows placeholders when the API is unreachable
      }
    };
    fetchAll();
  }, []);

  return (
    <div data-testid="admin-dashboard">
      <NavBar auth={{ user: { role: "ADMIN" } }} />
      <PageShell
        title="Admin Control Center"
        tabs={[
          { label: "Overview", href: "/admin", active: true },
          { label: "Approvals", href: "/admin/approvals" },
          { label: "Accounts", href: "/admin/accounts" },
          { label: "Transactions", href: "/admin/transactions" },
        ]}
        actions={
          <Link
            to="/admin/approvals"
            className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Review Pending ({pending.length})
          </Link>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Customers" value={stats?.totalUsers ?? "..."} />
          <StatCard label="Pending Approvals" value={stats?.pendingUsers ?? pending.length} />
          <StatCard label="Accounts" value={stats?.totalAccounts ?? "..."} />
          <StatCard
            label="Total Bank Balance"
            value={stats ? formatINR(stats.totalBalance) : "..."}
          />
          <StatCard label="Transactions" value={stats?.totalTransactions ?? "..."} />
          <StatCard
            label="Volume Settled"
            value={stats ? formatINR(stats.totalVolume) : "..."}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Operational guardrails</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li>• Approve or block accounts with audit logs.</li>
              <li>• Monitor recent transfers and anomalies.</li>
              <li>• RBAC enforced through JWT middleware.</li>
              <li>• {pending.length} approval(s) awaiting review.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Recent activity</h3>
              <Link to="/admin/transactions" className="text-sm font-semibold text-emerald-600">
                View all
              </Link>
            </div>
            <div data-testid="admin-recent-activity" className="mt-3 space-y-2 text-sm">
              {activity.map((log) => (
                <div
                  key={log.log_id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <span className="text-slate-700">
                    {log.admin_name} — {log.action}
                  </span>
                  <span className="whitespace-nowrap text-xs text-slate-500">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
              {!activity.length && <div className="text-sm text-slate-500">No activity yet.</div>}
            </div>
          </div>
        </div>
      </PageShell>
    </div>
  );
};

export default AdminDashboard;
