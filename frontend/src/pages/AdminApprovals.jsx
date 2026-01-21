import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import NavBar from "../components/NavBar";

const AdminApprovals = () => {
  const [users, setUsers] = useState([]);

  const fetchData = async () => {
    const { data } = await api.get("/admin/users/pending");
    setUsers(data.users || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const act = async (userId, action) => {
    await api.post(`/admin/users/${userId}/${action}`);
    fetchData();
  };

  return (
    <div>
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
                      className="rounded-lg bg-success/20 px-3 py-1 text-xs font-semibold text-success hover:bg-success/30"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => act(user.id, "block")}
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
