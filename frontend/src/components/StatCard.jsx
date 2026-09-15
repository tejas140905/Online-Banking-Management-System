const StatCard = ({ label, value, hint }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="text-xs text-slate-500">{label}</div>
    <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</div>
    {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
  </div>
);

export default StatCard;
