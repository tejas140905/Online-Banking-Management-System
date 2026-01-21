import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import NavBar from "../components/NavBar";

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
        <div className="glass overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-secondary text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Account</th>
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
                  <td className="px-4 py-3 text-slate-200">{row.name}</td>
                  <td className="px-4 py-3 text-slate-200">{row.email}</td>
                  <td className="px-4 py-3 font-semibold text-white">${row.balance}</td>
                  <td className="px-4 py-3 text-muted">{row.status}</td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td className="px-4 py-3 text-muted" colSpan={5}>
                    No accounts found.
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

export default AdminAccounts;
