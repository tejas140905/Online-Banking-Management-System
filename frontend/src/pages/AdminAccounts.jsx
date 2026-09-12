import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import NavBar from "../components/NavBar";
import { formatINR } from "../utils/currency";

const AdminAccounts = () => {
  const [rows, setRows] = useState([]);

  const fetchData = async () => {
    const { data } = await api.get("/admin/accounts");
    setRows(data.accounts || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <NavBar auth={{ user: { role: "ADMIN" } }} />
      <PageShell
        title="Account Directory"
        tabs={[
          { label: "Overview", href: "/admin" },
          { label: "Approvals", href: "/admin/approvals" },
          { label: "Accounts", href: "/admin/accounts", active: true },
          { label: "Transactions", href: "/admin/transactions" },
        ]}
      >
        <div data-testid="admin-accounts-table" className="glass overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-secondary text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Account</th>
                <th className="px-4 py-3 text-left font-medium">Label</th>
                <th className="px-4 py-3 text-left font-medium">Holder</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">Balance</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map((row) => (
                <tr key={row.account_number} className="hover:bg-secondary/60">
                  <td className="px-4 py-3 text-slate-200">{row.account_number}</td>
                  <td className="px-4 py-3 text-slate-200">{row.label || "—"}</td>
                  <td className="px-4 py-3 text-slate-200">{row.name}</td>
                  <td className="px-4 py-3 text-slate-200">{row.email}</td>
                  <td className="px-4 py-3 font-semibold text-white">{formatINR(row.balance)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        row.status === "ACTIVE"
                          ? "bg-success/10 text-success"
                          : row.status === "PENDING"
                            ? "bg-accent/10 text-accent"
                            : "bg-danger/10 text-danger"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td className="px-4 py-3 text-muted" colSpan={6}>
                    No accounts found.
                  </td>
                </tr>
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="bg-secondary">
                <tr>
                  <td className="px-4 py-3 text-slate-300" colSpan={4}>
                    {rows.length} account(s)
                  </td>
                  <td data-testid="admin-accounts-total" className="px-4 py-3 font-semibold text-white">
                    {formatINR(rows.reduce((s, r) => s + Number(r.balance || 0), 0))}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </PageShell>
    </div>
  );
};

export default AdminAccounts;
