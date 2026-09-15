import { useEffect, useState } from "react";
import api from "../api/client";
import PageShell from "../components/PageShell";
import NavBar from "../components/NavBar";
import { formatINR } from "../utils/currency";

const TransactionsPage = ({ auth }) => {
  const [accounts, setAccounts] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [{ data: accData }, { data: txnData }] = await Promise.all([
          api.get("/accounts"),
          api.get("/accounts/transactions?limit=100"),
        ]);
        setAccounts(accData.accounts || []);
        setRows(txnData.transactions || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const forAccount = (num) => rows.filter((t) => t.from_account === num || t.to_account === num);

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
        {loading && <div className="text-sm text-slate-500">Loading...</div>}
        {!loading && accounts.length === 0 && (
          <div className="text-sm text-slate-500">No accounts yet.</div>
        )}
        <div data-testid="transactions-accounts" className="space-y-6">
          {accounts.map((acc) => {
            const txns = forAccount(acc.account_number);
            const received = txns
              .filter((t) => t.to_account === acc.account_number)
              .reduce((s, t) => s + Number(t.amount || 0), 0);
            const sent = txns
              .filter((t) => t.from_account === acc.account_number)
              .reduce((s, t) => s + Number(t.amount || 0), 0);
            return (
              <section
                key={acc.account_number}
                data-testid={`transactions-account-${acc.account_number}`}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {acc.label || "Account"} — {acc.account_number}
                    </div>
                    <div className="text-xs text-slate-500">
                      Balance {formatINR(acc.balance)} • {txns.length} transaction(s)
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="text-success">In {formatINR(received)}</span>
                    <span className="text-danger">Out {formatINR(sent)}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">Txn ID</th>
                        <th className="px-4 py-3 text-left font-medium">Name</th>
                        <th className="px-4 py-3 text-left font-medium">Counterparty</th>
                        <th className="px-4 py-3 text-left font-medium">Flow</th>
                        <th className="px-4 py-3 text-left font-medium">Amount</th>
                        <th className="px-4 py-3 text-left font-medium">Status</th>
                        <th className="px-4 py-3 text-left font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {txns.map((txn) => {
                        const incoming = txn.to_account === acc.account_number;
                        const name = incoming
                          ? txn.from_name || "CREDX Bank"
                          : txn.to_name || "CREDX Bank";
                        return (
                          <tr key={`${acc.account_number}-${txn.txn_id}`} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-slate-700">{txn.txn_id}</td>
                            <td className="px-4 py-3 font-medium text-slate-900">{name}</td>
                            <td className="px-4 py-3 text-slate-700">
                              {incoming ? txn.from_account : txn.to_account}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`rounded-full px-2 py-1 text-xs ${
                                  incoming
                                    ? "bg-success/10 text-success"
                                    : "bg-sky-100 text-sky-700"
                                }`}
                              >
                                {incoming ? "Received" : "Sent"}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {formatINR(txn.amount)}
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
                            <td className="px-4 py-3 text-slate-500">
                              {new Date(txn.created_at).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                      {txns.length === 0 && (
                        <tr>
                          <td className="px-4 py-3 text-slate-500" colSpan={7}>
                            No transactions for this account yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>
      </PageShell>
    </div>
  );
};

export default TransactionsPage;
