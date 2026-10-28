import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import MetricCard from "../components/MetricCard";
import PageHeader from "../components/PageHeader";
import { getMonthlyReport } from "../services/api";
import {
  formatCurrency,
  formatMonthLabel,
  getCurrentMonth,
} from "../utils/finance";

const chartColors = [
  "#7c3aed",
  "#0891b2",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#6366f1",
  "#64748b",
  "#ec4899",
];

function monthChange(current, previous) {
  const change = current - previous;
  if (previous === 0) {
    return current === 0
      ? "No change from last month"
      : "New activity this month";
  }
  const percent = Math.round((change / previous) * 100);
  return `${change >= 0 ? "+" : ""}${percent}% from last month`;
}

export default function Reports() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReport = useCallback(async () => {
    try {
      const result = await getMonthlyReport(month);
      setReport(result.data);
      setError("");
    } catch {
      setError(
        "Could not load this report. Check that the API and MongoDB are running.",
      );
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    void Promise.resolve().then(loadReport);
  }, [loadReport]);

  const totals = report?.totals || { income: 0, expenses: 0, net: 0, count: 0 };
  const previous = report?.previousTotals ||
    { income: 0, expenses: 0, net: 0, count: 0 };

  return (
    <>
      <PageHeader
        eyebrow="Understand the patterns"
        title="Reports"
        description="Compare months, see where expenses go, and review activity over time."
      >
        <label htmlFor="reports-month" className="sr-only">
          Choose report month
        </label>
        <input
          id="reports-month"
          type="month"
          value={month}
          onChange={(event) => {
            if (!event.target.value) return;
            setLoading(true);
            setMonth(event.target.value);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        />
      </PageHeader>

      <main className="space-y-6 px-5 py-6 sm:px-8 lg:px-10">
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <span>{error}</span>
            <button
              onClick={() => {
                setLoading(true);
                void loadReport();
              }}
              className="inline-flex items-center gap-1 font-semibold"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-slate-500">
          <BarChart3 size={16} className="text-violet-600" /> Monthly report for
          {" "}
          <span className="font-semibold text-slate-700">
            {formatMonthLabel(month)}
          </span>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Income"
            value={formatCurrency(totals.income, 0)}
            helper={monthChange(totals.income, previous.income)}
            icon={TrendingUp}
            tone="green"
          />
          <MetricCard
            label="Expenses"
            value={formatCurrency(totals.expenses, 0)}
            helper={monthChange(totals.expenses, previous.expenses)}
            icon={TrendingDown}
            tone="rose"
          />
          <MetricCard
            label="Net cash flow"
            value={formatCurrency(totals.net, 0)}
            helper={monthChange(totals.net, previous.net)}
            icon={Wallet}
            tone="violet"
          />
          <MetricCard
            label="Transactions"
            value={totals.count}
            helper={`Compared with ${previous.count} last month`}
            icon={BarChart3}
            tone="blue"
          />
        </section>

        {loading
          ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              Building your report…
            </div>
          )
          : (
            <section className="grid gap-6 xl:grid-cols-5">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-3">
                <div>
                  <h2 className="font-bold">Expense trend</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Monthly totals for the selected month and five months before
                    it
                  </p>
                </div>
                <div className="mt-5 h-72">
                  {report?.trend?.length
                    ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={report.trend}
                          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                        >
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
                          <Bar
                            dataKey="expenses"
                            name="Expenses"
                            fill="#7c3aed"
                            radius={[7, 7, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )
                    : (
                      <div className="grid h-full place-items-center text-sm text-slate-400">
                        No expense history for this period.
                      </div>
                    )}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
                <div>
                  <h2 className="font-bold">Expense categories</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Category share for {formatMonthLabel(month)}
                  </p>
                </div>
                <div className="mt-2 h-52">
                  {report?.categories?.length
                    ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={report.categories}
                            dataKey="amount"
                            nameKey="name"
                            innerRadius={54}
                            outerRadius={88}
                            paddingAngle={3}
                          >
                            {report.categories.map((category, index) => (
                              <Cell
                                key={category.name}
                                fill={chartColors[index % chartColors.length]}
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
                        No expenses recorded this month.
                      </div>
                    )}
                </div>
                <div className="space-y-2.5">
                  {report?.categories?.slice(0, 5).map((category, index) => (
                    <div
                      key={category.name}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2 text-slate-600">
                        <i
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              chartColors[index % chartColors.length],
                          }}
                        />
                        <span className="truncate">{category.name}</span>
                      </span>
                      <span className="font-semibold">
                        {formatCurrency(category.amount, 0)}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          )}
        <p className="text-center text-xs text-slate-400">
          Report totals are calculated from saved transactions for each calendar
          month.
        </p>
      </main>
    </>
  );
}
