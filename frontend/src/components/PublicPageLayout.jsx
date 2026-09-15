import { Link } from "react-router-dom";
import NavBar from "./NavBar";

const PublicPageLayout = ({ auth, eyebrow, title, description, actions, children }) => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <NavBar auth={auth} />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12">
        <section className="grid gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              {eyebrow}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-bold text-slate-900 md:text-5xl">{title}</h1>
              <p className="max-w-2xl text-lg text-slate-500">{description}</p>
            </div>
            <div className="flex flex-wrap gap-3">{actions}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Workspace snapshot</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Live
              </span>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="text-xs text-slate-500">Settlement success</div>
                <div className="mt-2 text-3xl font-bold tabular-nums text-slate-900">99.98%</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-xs text-slate-500">Ops queues</div>
                  <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">12</div>
                </div>
                <div className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-xs text-slate-500">Admin review</div>
                  <div className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">3 min</div>
                </div>
              </div>
              <Link
                to="/register"
                className="rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-700"
              >
                Launch onboarding workflow
              </Link>
            </div>
          </div>
        </section>
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <div>Credx Digital Banking Platform</div>
          <div className="flex flex-wrap gap-4">
            <Link to="/platform" className="hover:text-emerald-600">
              Platform
            </Link>
            <Link to="/security" className="hover:text-emerald-600">
              Security
            </Link>
            <Link to="/operations" className="hover:text-emerald-600">
              Operations
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPageLayout;
