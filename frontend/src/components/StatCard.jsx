const StatCard = ({ label, value, hint }) => (
  <div className="glass rounded-xl border border-slate-800 p-4 shadow-lg">
    <div className="text-sm text-muted">{label}</div>
    <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    {hint && <div className="mt-1 text-xs text-slate-400">{hint}</div>}
  </div>
);

export default StatCard;
