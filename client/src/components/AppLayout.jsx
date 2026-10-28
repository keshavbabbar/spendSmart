import {
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  Tags,
  Wallet,
  WalletCards,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { to: "/budgets", label: "Budgets", icon: WalletCards },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/reports", label: "Reports", icon: BarChart3 },
];

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:pl-64">
      <aside className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col lg:border-b-0 lg:border-r">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-5 py-4 lg:px-6 lg:py-7"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 shadow-lg shadow-violet-950/30">
            <Wallet size={21} />
          </span>
          <span>
            <span className="block text-lg font-bold tracking-tight">
              SpendSmart
            </span>
            <span className="block text-xs text-slate-400">
              Personal finance
            </span>
          </span>
        </NavLink>

        <div className="px-3 pb-3 lg:px-4 lg:py-5">
          <p className="mb-3 hidden px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 lg:block">
            Workspace
          </p>
          <nav
            aria-label="Main navigation"
            className="grid grid-cols-4 gap-1 sm:flex sm:flex-wrap lg:flex-col"
          >
            {navigation.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-w-0 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors sm:flex-row sm:gap-3 sm:px-3 sm:text-sm lg:w-full ${
                    isActive
                      ? "bg-violet-500/15 text-violet-200"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
              >
                <Icon size={18} />
                <span className="truncate">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mx-5 mt-auto mb-6 hidden rounded-2xl border border-slate-800 bg-slate-900 p-4 lg:block">
          <p className="text-sm font-semibold">Spend with purpose.</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Small steps today lead to better financial habits tomorrow.
          </p>
        </div>
      </aside>

      <div className="mx-auto min-h-screen w-full max-w-[1440px]">
        <Outlet />
      </div>
    </div>
  );
}
