import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Plus,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getBudgets, getTransactions } from "../services/api";
import MetricCard from "../components/MetricCard";
import PageHeader from "../components/PageHeader";
import {
  formatCurrency,
  formatDateLabel,
  formatMonthLabel,
  getCurrentMonth,
  getDateInputValue,
  getMonthKey,
} from "../utils/finance";

const colors = [
  "#7c3aed",
  "#0891b2",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#6366f1",
  "#64748b",
  "#ec4899",
];

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(getCurrentMonth());

  const loadDashboard = useCallback(async () => {
    try {
      const [transactionResult, budgetResult] = await Promise.all([
        getTransactions(),
        getBudgets(month),
      ]);
      setError("");
      setTransactions(
        Array.isArray(transactionResult)
          ? transactionResult
          : transactionResult.data || [],
      );
      setBudgets(
        Array.isArray(budgetResult) ? budgetResult : budgetResult.data || [],
      );
    } catch {
      setError(
        "We couldn’t load your dashboard data. Check that the API and MongoDB are running.",
      );
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    void Promise.resolve().then(loadDashboard);
  }, [loadDashboard]);

  const currentMonthTransactions = useMemo(
    () => transactions.filter((item) => getMonthKey(item.date) === month),
    [transactions, month],
  );
  const totals = useMemo(
    () =>
      currentMonthTransactions.reduce((result, item) => {
        const amount = Number(item.amount) || 0;
        result[item.type === "income" ? "income" : "expenses"] += amount;
        return result;
      }, { income: 0, expenses: 0 }),
    [currentMonthTransactions],
  );
  const balance = totals.income - totals.expenses;
  const budgetLimit = budgets.reduce(
    (total, budget) => total + (Number(budget.amount) || 0),
    0,
  );

  const monthlyData = useMemo(() => {
    const map = new Map();
    transactions.forEach((item) => {
      if (item.type !== "expense") return;
      const date = new Date(`${getDateInputValue(item.date)}T12:00:00`);
      if (Number.isNaN(date.getTime())) return;
      const key = getMonthKey(item.date);
      const current = map.get(key) || {
        month: date.toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        expenses: 0,
        sortKey: key,
      };
      current.expenses += Number(item.amount) || 0;
      map.set(key, current);
    });
    return [...map.values()].sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6);
  }, [transactions]);

  const categoryData = useMemo(() => {
    const map = new Map();
    currentMonthTransactions.filter((item) => item.type === "expense").forEach(
      (item) => {
        const name = item.category || "Other";
        map.set(name, (map.get(name) || 0) + (Number(item.amount) || 0));
      },
    );
    return [...map].map(([name, value]) => ({ name, value })).sort((a, b) =>
      b.value - a.value
    );
  }, [currentMonthTransactions]);

  const budgetProgress = useMemo(() => {
    const spentByCategory = new Map(
      categoryData.map(({ name, value }) => [name, value]),
    );
    return budgets
      .map((budget) => {
        const limit = Number(budget.amount) || 0;
        const spent = spentByCategory.get(budget.category) || 0;
        return {
          ...budget,
          limit,
          spent,
          percentage: limit ? Math.round((spent / limit) * 100) : 0,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [budgets, categoryData]);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <>
      <PageHeader
        eyebrow="Your money, in focus"
        title="Overview"
        description="A simple view of your financial health."
      >
        <label className="sr-only" htmlFor="dashboard-month">
          Select month
        </label>
        <input
          id="dashboard-month"
          type="month"
          value={month}
          onChange={(event) => {
            if (!event.target.value) return;
            setLoading(true);
            setMonth(event.target.value);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        />
        <Link
          to="/transactions"
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
        >
          <ArrowLeftRight size={17} /> Transactions
        </Link>
      </PageHeader>

      <main className="space-y-6 px-5 py-6 sm:px-8 lg:px-10">
        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <span>{error}</span>
            <button
              onClick={() => {
                setLoading(true);
                void loadDashboard();
              }}
              className="inline-flex items-center gap-2 font-semibold"
            >
              <RefreshCw size={15} /> Retry
            </button>
          </div>
        )}

        <section
          aria-label="Monthly financial summary"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <MetricCard
            label="Net cash flow"
            value={formatCurrency(balance, 0)}
            helper={`For ${formatMonthLabel(month)}`}
            icon={Wallet}
            tone="violet"
          />
          <MetricCard
            label="Income"
            value={formatCurrency(totals.income, 0)}
            helper="Money received this month"
            icon={TrendingUp}
            tone="green"
          />
          <MetricCard
            label="Expenses"
            value={formatCurrency(totals.expenses, 0)}
            helper="Money spent this month"
            icon={TrendingDown}
            tone="rose"
          />
          <MetricCard
            label="Budget limits"
            value={formatCurrency(budgetLimit, 0)}
            helper={`Across ${budgets.length} ${
              budgets.length === 1 ? "category" : "categories"
            }`}
            icon={WalletCards}
            tone="blue"
          />
        </section>

        {!loading && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-bold">Budget check-in</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your highest category usage for {formatMonthLabel(month)}
                </p>
              </div>
              <Link
                to="/budgets"
                className="text-sm font-semibold text-violet-700 hover:text-violet-900"
              >
                Manage budgets <ArrowRight className="ml-1 inline" size={15} />
              </Link>
            </div>
            {budgetProgress.length
              ? (
                <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {budgetProgress.slice(0, 3).map((budget) => {
                    const over = budget.percentage >= 100;
                    return (
                      <article
                        key={budget._id}
                        className="rounded-xl bg-slate-50 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-semibold">
                            {budget.category}
                          </p>
                          <span
                            className={`text-xs font-semibold ${
                              over ? "text-rose-700" : "text-slate-500"
                            }`}
                          >
                            {budget.percentage}%
                          </span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${
                              over ? "bg-rose-500" : "bg-violet-500"
                            }`}
                            style={{
                              width: `${Math.min(budget.percentage, 100)}%`,
                            }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {formatCurrency(budget.spent, 0)} of{" "}
                          {formatCurrency(budget.limit, 0)}
                          {over ? " · limit reached" : ""}
                        </p>
                      </article>
                    );
                  })}
                </div>
              )
              : (
                <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  No budgets set for this month.{" "}
                  <Link to="/budgets" className="font-semibold text-violet-700">
                    Create a category budget →
                  </Link>
                </p>
              )}
          </section>
        )}

        {loading
          ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              Loading your finances…
            </div>
          )
          : (
            <section className="grid gap-6 xl:grid-cols-5">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold">Spending trend</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Your expenses across the last six active months
                    </p>
                  </div>
                  <span className="rounded-xl bg-violet-50 p-2.5 text-violet-700">
                    <TrendingDown size={18} />
                  </span>
                </div>
                <div className="mt-5 h-64">
                  {monthlyData.length
                    ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={monthlyData}
                          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient
                              id="expenseFill"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#7c3aed"
                                stopOpacity={0.24}
                              />
                              <stop
                                offset="95%"
                                stopColor="#7c3aed"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "#64748b", fontSize: 12 }}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            width={64}
                            tickFormatter={(value) => `₹${value}`}
                            tick={{ fill: "#64748b", fontSize: 11 }}
                          />
                          <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{
                              borderRadius: 12,
                              borderColor: "#e2e8f0",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="#7c3aed"
                            strokeWidth={3}
                            fill="url(#expenseFill)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )
                    : (
                      <div className="grid h-full place-items-center text-sm text-slate-400">
                        Add expenses to see your monthly trend.
                      </div>
                    )}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
                <div>
                  <h2 className="font-bold">Where it goes</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Spending by category for the selected month
                  </p>
                </div>
                <div className="mt-2 h-48">
                  {categoryData.length
                    ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={52}
                            outerRadius={82}
                            paddingAngle={3}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={colors[index % colors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{
                              borderRadius: 12,
                              borderColor: "#e2e8f0",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )
                    : (
                      <div className="grid h-full place-items-center text-sm text-slate-400">
                        No expenses for this month yet.
                      </div>
                    )}
                </div>
                <div className="space-y-2">
                  {categoryData.slice(0, 4).map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-slate-600">
                        <i
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor: colors[index % colors.length],
                          }}
                        />{" "}
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(item.value, 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold">Recent activity</h2>
              <p className="mt-1 text-sm text-slate-500">
                Your five latest transactions
              </p>
            </div>
            <Link
              to="/transactions"
              className="inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:text-violet-900"
            >
              All transactions <ArrowRight size={15} />
            </Link>
          </div>
          {recentTransactions.length
            ? (
              <div className="divide-y divide-slate-100">
                {recentTransactions.map((item) => {
                  const income = item.type === "income";
                  const Icon = income ? ArrowDownLeft : ArrowUpRight;
                  return (
                    <div
                      key={item._id}
                      className="flex items-center gap-3 px-5 py-3.5 sm:px-6"
                    >
                      <span
                        className={`rounded-xl p-2.5 ${
                          income
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {item.category} · {formatDateLabel(item.date)}
                        </p>
                      </div>
                      <p
                        className={`shrink-0 text-sm font-bold ${
                          income ? "text-emerald-700" : "text-slate-900"
                        }`}
                      >
                        {income ? "+" : "−"}
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )
            : (
              <div className="px-5 py-10 text-center">
                <p className="font-semibold">No transactions yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Add your first transaction to start tracking your money.
                </p>
                <Link
                  to="/transactions"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  <Plus size={16} /> Add transaction
                </Link>
              </div>
            )}
        </section>
        <p className="pb-2 text-center text-xs text-slate-400">
          A clearer picture of your money, one month at a time.
        </p>
      </main>
    </>
  );
}
