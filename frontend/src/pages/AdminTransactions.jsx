import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import NavBar from "../components/NavBar";
import { formatINR } from "../utils/currency";

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

  const success = rows.length
    ? Math.round((rows.filter((r) => r.status === "SUCCESS").length / rows.length) * 10000) / 100
    : 100;
  const volume = rows
    .filter((r) => r.status === "SUCCESS")
    .reduce((s, r) => s + Number(r.amount || 0), 0);

  return (
    <div data-testid="admin-transactions-page">
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
        <div
          data-testid="admin-txns-summary"
          className="mb-3 flex flex-wrap gap-4 text-sm text-slate-300"
        >
          <span>
            Monitored: <strong className="text-white">{rows.length}</strong>
          </span>
          <span>
            Success rate: <strong className="text-white">{success}%</strong>
          </span>
          <span>
            Volume: <strong className="text-white">{formatINR(volume)}</strong>
          </span>
        </div>
        <div className="glass overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-secondary text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Txn</th>
                <th className="px-4 py-3 text-left font-medium">From</th>
                <th className="px-4 py-3 text-left font-medium">To</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-3 text-muted">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((row) => (
                  <tr key={row.txn_id} className="hover:bg-secondary/60">
                    <td className="px-4 py-3 text-slate-200">{row.txn_id}</td>
                    <td className="px-4 py-3 text-slate-200">
                      <div>{row.from_account}</div>
                      <div className="text-xs text-muted">{row.from_name || "CREDX Bank"}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      <div>{row.to_account}</div>
                      <div className="text-xs text-muted">{row.to_name || "CREDX Bank"}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">{formatINR(row.amount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          row.type === "CREDIT" ? "bg-success/10 text-success" : "bg-accent/10 text-accent"
                        }`}
                      >
                        {row.type}
                      </span>
                    </td>
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
                  <td colSpan={7} className="px-4 py-3 text-muted">
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
