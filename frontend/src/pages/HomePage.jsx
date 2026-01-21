import { Link } from "react-router-dom";
import NavBar from "../components/NavBar";

const HomePage = ({ auth }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-surface to-surface text-slate-100">
      <NavBar auth={auth} />
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-800/60 px-3 py-1 text-xs uppercase tracking-wide text-accent">
              Secure Digital Banking
            </div>
            <h1 className="text-4xl font-bold text-white md:text-5xl">
              Bank-grade experience for modern customers and operators.
            </h1>
            <p className="text-lg text-slate-300">
              Build trust with enterprise security, real-time balances, and precise controls.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-surface hover:bg-sky-400"
              >
                Open an Account
              </Link>
              <Link
                to="/login"
                className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold hover:border-accent hover:text-accent"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div className="glass rounded-2xl border border-slate-800 p-6 shadow-2xl">
            <div className="text-sm text-muted">Dashboard Preview</div>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-secondary p-4">
                  <div className="text-xs text-muted">Total Balance</div>
                  <div className="mt-2 text-2xl font-semibold text-white">$42,500.00</div>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <div className="text-xs text-muted">Accounts</div>
                  <div className="mt-2 text-2xl font-semibold text-white">3</div>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <div className="text-xs text-muted">Last Transfer</div>
                  <div className="mt-2 text-2xl font-semibold text-success">$1,250</div>
                </div>
              </div>
              <div className="rounded-xl bg-secondary p-4">
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>Today</span>
                  <span>Settled</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-slate-800">
                  <div className="h-2 w-3/4 rounded-full bg-accent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { title: "Zero-trust auth", desc: "JWT, bcrypt, RBAC, session expiry." },
            { title: "Operational controls", desc: "Admin approval, blocking, audit logs." },
            { title: "Payments-grade UX", desc: "Dashboards, cards, tables, filters." },
          ].map((item) => (
            <div key={item.title} className="glass rounded-xl border border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
