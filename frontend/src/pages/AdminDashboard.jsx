import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import PageShell from "../components/PageShell";
import StatCard from "../components/StatCard";
import NavBar from "../components/NavBar";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await api.get("/admin/stats");
      setStats(data);
    };
    fetchStats();
  }, []);

  return (
    <div>
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
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-surface"
          >
            Review Pending
          </Link>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Active Users" value={stats?.totalUsers ?? "..."} />
          <StatCard label="Accounts" value={stats?.totalAccounts ?? "..."} />
          <StatCard label="Transactions" value={stats?.totalTransactions ?? "..."} />
        </div>
        <div className="glass rounded-xl border border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white">Operational guardrails</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>• Approve or block accounts with audit logs.</li>
            <li>• Monitor recent transfers and anomalies.</li>
            <li>• RBAC enforced through JWT middleware.</li>
          </ul>
        </div>
      </PageShell>
    </div>
  );
};

export default AdminDashboard;
