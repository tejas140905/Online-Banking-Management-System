import { Link } from "react-router-dom";

const PageShell = ({ title, tabs = [], actions, children }) => {
  return (
    <div className="min-h-screen bg-surface text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            <p className="text-sm text-muted">
              Secure banking workspace with real-time account insight.
            </p>
          </div>
          {actions}
        </header>
        {tabs.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                to={tab.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  tab.active ? "bg-accent text-surface" : "glass border border-slate-800"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageShell;
