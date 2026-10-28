import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Plus,
  RefreshCw,
  Target,
  Trash2,
  WalletCards,
} from "lucide-react";
import MetricCard from "../components/MetricCard";
import PageHeader from "../components/PageHeader";
import {
  addBudget,
  deleteBudget,
  getBudgets,
  getCategories,
  getTransactions,
  updateBudget,
} from "../services/api";
import {
  formatCurrency,
  formatMonthLabel,
  getCurrentMonth,
  getMonthKey,
  transactionCategories,
} from "../utils/finance";

const blankForm = (month) => ({ category: "Food", amount: "", month });

export default function Budgets() {
  const [month, setMonth] = useState(getCurrentMonth);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => blankForm(getCurrentMonth()));
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [budgetResult, transactionResult, categoryResult] = await Promise
        .all([
          getBudgets(month),
          getTransactions(),
          getCategories("expense"),
        ]);
      setError("");
      setBudgets(
        Array.isArray(budgetResult) ? budgetResult : budgetResult.data || [],
      );
      setTransactions(
        Array.isArray(transactionResult)
          ? transactionResult
          : transactionResult.data || [],
      );
      setCustomCategories(categoryResult.data || []);
    } catch {
      setError(
        "We couldn’t load your budgets. Check that the API and MongoDB are running.",
      );
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    void Promise.resolve().then(loadData);
  }, [loadData]);

  const spentByCategory = useMemo(() => {
    const totals = new Map();
    transactions.forEach((transaction) => {
      if (transaction.type !== "expense") return;
      const transactionMonth = getMonthKey(transaction.date);
      if (!transactionMonth) return;
      if (transactionMonth !== month) return;
      const category = transaction.category || "Other";
      totals.set(
        category,
        (totals.get(category) || 0) + (Number(transaction.amount) || 0),
      );
    });
    return totals;
  }, [transactions, month]);

  const totals = budgets.reduce((result, budget) => {
    result.planned += Number(budget.amount) || 0;
    result.spent += spentByCategory.get(budget.category) || 0;
    return result;
  }, { planned: 0, spent: 0 });

  const openCreate = () => {
    setEditingId(null);
    setForm(blankForm(month));
    setError("");
    setShowForm(true);
  };

  const openEdit = (budget) => {
    setEditingId(budget._id);
    setForm({
      category: budget.category,
      amount: String(budget.amount),
      month: budget.month,
    });
    setError("");
    setShowForm(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a budget amount greater than zero.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, amount };
      if (editingId) await updateBudget(editingId, payload);
      else await addBudget(payload);
      setShowForm(false);
      setEditingId(null);
      await loadData();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "Could not save this budget.",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeBudget = async (budget) => {
    if (
      !window.confirm(
        `Delete the ${budget.category} budget for ${
          formatMonthLabel(budget.month)
        }?`,
      )
    ) return;
    try {
      setError("");
      await deleteBudget(budget._id);
      await loadData();
    } catch {
      setError("Could not delete this budget.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Plan ahead"
        title="Monthly budgets"
        description="Set a limit for each category and keep spending on track."
      >
        <label className="sr-only" htmlFor="budget-month">
          Select budget month
        </label>
        <input
          id="budget-month"
          type="month"
          value={month}
          onChange={(event) => {
            if (!event.target.value) return;
            setLoading(true);
            setMonth(event.target.value);
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
        />
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Plus size={17} /> Add budget
        </button>
      </PageHeader>

      <main className="space-y-6 px-5 py-6 sm:px-8 lg:px-10">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
          >
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <p className="flex-1">{error}</p>
            {!showForm && (
              <button
                onClick={() => {
                  setLoading(true);
                  void loadData();
                }}
                className="inline-flex shrink-0 items-center gap-1 font-semibold"
              >
                <RefreshCw size={14} /> Retry
              </button>
            )}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Planned budget"
            value={formatCurrency(totals.planned, 0)}
            helper={`Across ${budgets.length} ${
              budgets.length === 1 ? "category" : "categories"
            }`}
            icon={WalletCards}
            tone="violet"
          />
          <MetricCard
            label="Spent so far"
            value={formatCurrency(totals.spent, 0)}
            helper={`Against budgets for ${formatMonthLabel(month)}`}
            icon={Target}
            tone="blue"
          />
          <MetricCard
            label="Budget remaining"
            value={formatCurrency(totals.planned - totals.spent, 0)}
            helper={totals.planned - totals.spent < 0
              ? "You are over the combined limit"
              : "Combined planned amount minus spending"}
            icon={totals.planned - totals.spent < 0 ? AlertCircle : Target}
            tone={totals.planned - totals.spent < 0 ? "rose" : "green"}
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 className="font-bold">Category limits</h2>
            <p className="mt-1 text-sm text-slate-500">
              Actual spending updates automatically from your transactions.
            </p>
          </div>
          {loading
            ? (
              <div className="p-12 text-center text-sm text-slate-500">
                Loading budgets…
              </div>
            )
            : budgets.length
            ? (
              <div className="divide-y divide-slate-100">
                {budgets.map((budget) => {
                  const planned = Number(budget.amount) || 0;
                  const spent = spentByCategory.get(budget.category) || 0;
                  const percentage = planned
                    ? Math.round((spent / planned) * 100)
                    : 0;
                  const over = percentage >= 100;
                  return (
                    <article key={budget._id} className="px-5 py-5 sm:px-6">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">
                            {budget.category}
                          </h3>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatCurrency(spent, 0)} spent of{" "}
                            {formatCurrency(planned, 0)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              over
                                ? "bg-rose-50 text-rose-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {percentage}% used
                          </span>
                          <button
                            onClick={() =>
                              openEdit(budget)}
                            className="rounded-lg px-2.5 py-2 text-xs font-semibold text-violet-700 hover:bg-violet-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              removeBudget(budget)}
                            aria-label={`Delete ${budget.category} budget`}
                            className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all ${
                            over ? "bg-rose-500" : "bg-violet-500"
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      {over && (
                        <p className="mt-2 text-xs font-medium text-rose-600">
                          You’re {formatCurrency(spent - planned, 0)}{" "}
                          over this category limit.
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )
            : (
              <div className="px-5 py-12 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-50 text-violet-700">
                  <WalletCards size={22} />
                </span>
                <h3 className="mt-4 font-semibold">
                  No budgets for {formatMonthLabel(month)}
                </h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                  Create category limits to compare your spending with the plan
                  you set.
                </p>
                <button
                  onClick={openCreate}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  <Plus size={16} /> Create your first budget
                </button>
              </div>
            )}
        </section>
        <p className="text-center text-xs text-slate-400">
          Budget progress uses expense transactions in each category and month.
        </p>
      </main>

      {showForm && (
        <div
          className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="budget-form-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="budget-form-title" className="text-lg font-bold">
                  {editingId ? "Edit budget" : "Create a budget"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Choose a monthly limit for one spending category.
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                aria-label="Close budget form"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>
            </div>
            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-700">
                Category<select
                  required
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                >
                  {[
                    ...transactionCategories.expense,
                    ...customCategories.map((category) => category.name),
                  ].map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Month<input
                  required
                  type="month"
                  value={form.month}
                  onChange={(event) =>
                    setForm({ ...form, month: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Budget limit<input
                  required
                  min="0.01"
                  step="0.01"
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 5000"
                  value={form.amount}
                  onChange={(event) =>
                    setForm({ ...form, amount: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                />
              </label>
              <p className="text-xs text-slate-500">
                One budget per category and month. Saving an existing pair will
                be rejected by the API.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {saving
                    ? "Saving…"
                    : editingId
                    ? "Save changes"
                    : "Create budget"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
