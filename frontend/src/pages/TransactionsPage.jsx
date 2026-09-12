import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import NavBar from "../components/NavBar";
import { formatINR } from "../utils/currency";

const TransactionsPage = ({ auth }) => {
  const [rows, setRows] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [account, setAccount] = useState(() => localStorage.getItem("activeAccount") || "");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data } = await api.get("/accounts");
        setAccounts(data.accounts || []);
      } catch {
        // filter stays on All if accounts fail to load
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    const fetchTxns = async () => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({ page, limit, ...(account ? { account } : {}) });
        const { data } = await api.get(`/accounts/transactions?${qs}`);
        setRows(data.transactions || []);
        setPages(data.pagination?.pages || 1);
      } finally {
        setLoading(false);
      }
    };
    fetchTxns();
  }, [page, account]);

  return (
    <div data-testid="transactions-page">
      <NavBar auth={auth} />
      <PageShell
        title="Transaction History"
        tabs={[
          { label: "Overview", href: "/dashboard" },
          { label: "Transfer", href: "/transfer" },
          { label: "Transactions", href: "/transactions", active: true },
          { label: "Profile", href: "/profile" },
        ]}
      >
        <div className="mb-3 flex items-center gap-3 text-sm text-slate-200">
          <label htmlFor="txn-account-filter">Account</label>
          <select
            id="txn-account-filter"
            data-testid="transactions-account-filter"
            value={account}
            onChange={(e) => {
              setAccount(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-800 bg-secondary px-3 py-2 text-white focus:border-accent"
          >
            <option value="">All accounts</option>
            {accounts.map((acc) => (
              <option key={acc.account_number} value={acc.account_number}>
                {acc.label ? `${acc.label} — ` : ""}
                {acc.account_number}
              </option>
            ))}
          </select>
        </div>
        <div data-testid="transactions-table" className="glass overflow-x-auto rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-secondary text-slate-300">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Txn ID</th>
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
                  <td className="px-4 py-3 text-muted" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((txn) => (
                  <tr key={txn.txn_id} className="hover:bg-secondary/60">
                    <td className="px-4 py-3 text-slate-200">{txn.txn_id}</td>
                    <td className="px-4 py-3 text-slate-200">{txn.from_account}</td>
                    <td className="px-4 py-3 text-slate-200">{txn.to_account}</td>
                    <td className="px-4 py-3 font-semibold text-white">{formatINR(txn.amount)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          txn.type === "CREDIT" ? "bg-success/10 text-success" : "bg-accent/10 text-accent"
                        }`}
                      >
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          txn.status === "SUCCESS"
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {new Date(txn.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-muted" colSpan={7}>
                    No transactions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
          <span data-testid="transactions-page-info">
            Page {page} of {pages}
          </span>
          <div className="space-x-2">
            <button
              data-testid="transactions-prev"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="rounded-lg border border-slate-700 px-3 py-1 disabled:opacity-40"
            >
              Prev
            </button>
            <button
              data-testid="transactions-next"
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-700 px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </PageShell>
    </div>
  );
};

export default TransactionsPage;
