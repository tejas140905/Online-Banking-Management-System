import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import NavBar from "../components/NavBar";

const AdminTransactions = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await api.get("/admin/transactions");
      setRows(data.transactions || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div>
      <NavBar auth={{ user: { role: "ADMIN" } }} />
      <PageShell
        title="Transaction Monitoring"
        tabs={[
          { label: "Overview", href: "/admin" },
          { label: "Approvals", href: "/admin/approvals" },
          { label: "Accounts", href: "/admin/accounts" },
          { label: "Transactions", href: "/admin/transactions", active: true },
        ]}
      >
        <div className="glass overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-secondary text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Txn</th>
                <th className="px-4 py-3 text-left font-medium">From</th>
                <th className="px-4 py-3 text-left font-medium">To</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-muted">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((row) => (
                  <tr key={row.txn_id} className="hover:bg-secondary/60">
                    <td className="px-4 py-3 text-slate-200">{row.txn_id}</td>
                    <td className="px-4 py-3 text-slate-200">{row.from_account}</td>
                    <td className="px-4 py-3 text-slate-200">{row.to_account}</td>
                    <td className="px-4 py-3 font-semibold text-white">${row.amount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          row.status === "SUCCESS"
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-muted">
                    No transactions recorded.
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

export default AdminTransactions;
