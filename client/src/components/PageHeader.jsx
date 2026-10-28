export default function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="flex flex-col gap-5 border-b border-slate-200 bg-white px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-7">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </header>
  );
}
