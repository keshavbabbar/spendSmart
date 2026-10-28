export default function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "violet",
}) {
  const tones = {
    violet: "bg-violet-50 text-violet-700",
    green: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    blue: "bg-sky-50 text-sky-700",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className={`rounded-xl p-2.5 ${tones[tone]}`}>
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-5 break-words text-2xl font-bold tracking-tight sm:text-3xl">
        {value}
      </p>
      <p className="mt-2 text-xs text-slate-500">{helper}</p>
    </article>
  );
}
