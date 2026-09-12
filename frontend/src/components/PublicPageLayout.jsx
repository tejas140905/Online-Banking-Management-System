import { Link } from "react-router-dom";
import NavBar from "./NavBar";

const PublicPageLayout = ({ auth, eyebrow, title, description, actions, children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-surface to-surface text-slate-100">
      <NavBar auth={auth} />
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16">
        <section className="grid gap-10 rounded-[2rem] border border-slate-800 bg-slate-950/30 p-8 shadow-2xl md:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-full bg-slate-800/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-accent">
              {eyebrow}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-bold text-white md:text-5xl">{title}</h1>
              <p className="max-w-2xl text-lg text-slate-300">{description}</p>
            </div>
            <div className="flex flex-wrap gap-4">
              {actions}
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Workspace snapshot</span>
              <span>Live</span>
            </div>
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl bg-secondary p-4">
                <div className="text-xs text-muted">Settlement success</div>
                <div className="mt-2 text-3xl font-semibold text-white">99.98%</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-secondary p-4">
                  <div className="text-xs text-muted">Ops queues</div>
                  <div className="mt-2 text-2xl font-semibold text-white">12</div>
                </div>
                <div className="rounded-2xl bg-secondary p-4">
                  <div className="text-xs text-muted">Admin review</div>
                  <div className="mt-2 text-2xl font-semibold text-success">3 min</div>
                </div>
              </div>
              <Link
                to="/register"
                className="rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-accent hover:text-accent"
              >
                Launch onboarding workflow
              </Link>
            </div>
          </div>
        </section>
        {children}
      </main>
      <footer className="border-t border-slate-800 bg-slate-950/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <div>Credx Digital Banking Platform</div>
          <div className="flex flex-wrap gap-4">
            <Link to="/platform" className="hover:text-accent">
              Platform
            </Link>
            <Link to="/security" className="hover:text-accent">
              Security
            </Link>
            <Link to="/operations" className="hover:text-accent">
              Operations
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPageLayout;
