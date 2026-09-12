import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import NavBar from "../components/NavBar";

const AdminApprovals = () => {
  const [users, setUsers] = useState([]);
  const [closures, setClosures] = useState([]);

  const fetchData = async () => {
    const [{ data: u }, { data: c }] = await Promise.all([
      api.get("/admin/users/pending"),
      api.get("/admin/closures/pending"),
    ]);
    setUsers(u.users || []);
    setClosures(c.closures || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const act = async (userId, action) => {
    await api.post(`/admin/users/${userId}/${action}`);
    fetchData();
  };

  const decideClosure = async (id, decision) => {
    try {
      await api.post(`/admin/closures/${id}/${decision}`);
    } catch {
      // rejection reason surfaces on refresh
    }
    fetchData();
  };

  return (
    <div data-testid="admin-approvals">
      <NavBar auth={{ user: { role: "ADMIN" } }} />
      <PageShell
        title="User Approvals"
        tabs={[
          { label: "Overview", href: "/admin" },
          { label: "Approvals", href: "/admin/approvals", active: true },
          { label: "Accounts", href: "/admin/accounts" },
          { label: "Transactions", href: "/admin/transactions" },
        ]}
      >
        <div data-testid="admin-closures" className="glass mb-4 overflow-x-auto rounded-xl border border-slate-800">
          <div className="border-b border-slate-800 px-4 py-3 text-sm font-semibold text-white">
            Account closure requests
          </div>
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-secondary text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Account</th>
                <th className="px-4 py-3 text-left font-medium">Holder</th>
                <th className="px-4 py-3 text-left font-medium">Balance</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {closures.map((c) => (
                <tr key={c.id} className="hover:bg-secondary/60">
                  <td className="px-4 py-3 text-slate-200">{c.account_number}</td>
                  <td className="px-4 py-3 text-slate-200">
                    {c.name} ({c.email})
                  </td>
                  <td className="px-4 py-3 text-slate-200">{c.balance ?? "—"}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => decideClosure(c.id, "approve")}
                      data-testid={`approve-closure-${c.id}`}
                      className="rounded-lg bg-success/20 px-3 py-1 text-xs font-semibold text-success hover:bg-success/30"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => decideClosure(c.id, "reject")}
                      data-testid={`reject-closure-${c.id}`}
                      className="rounded-lg bg-danger/20 px-3 py-1 text-xs font-semibold text-danger hover:bg-danger/30"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {!closures.length && (
                <tr>
                  <td className="px-4 py-3 text-muted" colSpan={4}>
                    No closure requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="glass overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-secondary text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/60">
                  <td className="px-4 py-3 text-slate-200">{user.name}</td>
                  <td className="px-4 py-3 text-slate-200">{user.email}</td>
                  <td className="px-4 py-3 text-muted">{user.status}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => act(user.id, "approve")}
                      data-testid={`approve-user-${user.id}`}
                      className="rounded-lg bg-success/20 px-3 py-1 text-xs font-semibold text-success hover:bg-success/30"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => act(user.id, "block")}
                      data-testid={`block-user-${user.id}`}
                      className="rounded-lg bg-danger/20 px-3 py-1 text-xs font-semibold text-danger hover:bg-danger/30"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td className="px-4 py-3 text-muted" colSpan={4}>
                    No pending approvals.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </PageShell>
    </div>
  );
};

export default AdminApprovals;
