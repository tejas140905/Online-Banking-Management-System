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
              <Link
                to="/platform"
                className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold hover:border-accent hover:text-accent"
              >
                Explore Platform
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            { value: "24/7", label: "Operator visibility" },
            { value: "3m", label: "Average review loop" },
            { value: "12+", label: "Core product surfaces" },
            { value: "99.98%", label: "Settlement success view" },
          ].map((item) => (
            <div key={item.label} className="glass rounded-xl border border-slate-800 p-5">
              <div className="text-2xl font-semibold text-white">{item.value}</div>
              <div className="mt-1 text-sm text-slate-300">{item.label}</div>
            </div>
          ))}
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass rounded-2xl border border-slate-800 p-6">
            <div className="text-sm text-accent">Software-style product map</div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Platform",
                  desc: "Customer onboarding, account management, and reporting in one flow.",
                  href: "/platform",
                },
                {
                  title: "Security",
                  desc: "Protected routes, admin review, and role-aware access design.",
                  href: "/security",
                },
                {
                  title: "Operations",
                  desc: "Approval queues, transaction monitoring, and operator workflows.",
                  href: "/operations",
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  to={item.href}
                  className="rounded-2xl bg-secondary p-5 transition hover:border-accent hover:text-accent"
                >
                  <div className="text-lg font-semibold text-white">{item.title}</div>
                  <p className="mt-2 text-sm text-slate-300">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl border border-slate-800 p-6">
            <div className="text-sm text-accent">Why it feels more like software now</div>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              <li>Dedicated public pages for platform, security, and operations</li>
              <li>Product-led navigation instead of a single-page landing experience</li>
              <li>Stronger information hierarchy with metrics and module sections</li>
              <li>Clearer story for demos, portfolios, and stakeholder previews</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
