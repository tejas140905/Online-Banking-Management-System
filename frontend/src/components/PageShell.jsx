import { Link } from "react-router-dom";

const PageShell = ({ title, tabs = [], actions, children }) => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">
              Secure banking workspace with real-time account insight.
            </p>
          </div>
          {actions}
        </header>
        {tabs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                to={tab.href}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  tab.active ? "bg-emerald-600 text-white" : "bg-white text-slate-600 shadow-sm"
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
