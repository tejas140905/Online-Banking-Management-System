// Shared light-premium primitives: one visual language for every page.
export const Card = ({ children, className = "", testid }) => (
  <div
    data-testid={testid}
    className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
  >
    {children}
  </div>
);

export const BtnPrimary = ({ children, ...props }) => (
  <button
    {...props}
    className={`rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 ${props.className || ""}`}
  >
    {children}
  </button>
);

export const Badge = ({ tone = "neutral", children, testid }) => {
  const tones = {
    neutral: "bg-slate-100 text-slate-600",
    success: "bg-emerald-100 text-emerald-700",
    info: "bg-sky-100 text-sky-700",
    danger: "bg-red-100 text-red-600",
    warn: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      data-testid={testid}
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

export const inputCls =
  "mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500";

export const Stat = ({ label, value, hint }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</div>
    {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
  </div>
);
