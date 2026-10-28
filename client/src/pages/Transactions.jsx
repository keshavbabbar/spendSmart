import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  CalendarDays,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import MetricCard from "../components/MetricCard";
import PageHeader from "../components/PageHeader";
import {
  addTransaction,
  deleteTransaction,
  getCategories,
  getTransactions,
  updateTransaction,
} from "../services/api";
import {
  createInitialTransactionForm,
  formatCurrency,
  formatDateLabel,
  getDateInputValue,
  getMonthKey,
  transactionCategories,
} from "../utils/finance";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(createInitialTransactionForm);
  const [saving, setSaving] = useState(false);

  const categoryOptions = useMemo(() => ({
    income: [
      ...transactionCategories.income,
      ...customCategories.filter((item) => item.type === "income").map((item) =>
        item.name
      ),
    ],
    expense: [
      ...transactionCategories.expense,
      ...customCategories.filter((item) => item.type === "expense").map((
        item,
      ) => item.name),
    ],
  }), [customCategories]);

  const loadTransactions = async () => {
    try {
      setError("");
      const [result, categoryResult] = await Promise.all([
        getTransactions(),
        getCategories(),
      ]);
      setTransactions(
        Array.isArray(result) ? result : result.data || [],
      );
      setCustomCategories(categoryResult.data || []);
    } catch {
      setError(
        "Could not load transactions. Check that the backend and MongoDB are running.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(loadTransactions);
  }, []);

  const filteredTransactions = useMemo(() => {
    const term = search.toLowerCase();

    return transactions.filter((transaction) => {
      const matchesType = filter === "all" || transaction.type === filter;
      const matchesMonth = !monthFilter ||
        getMonthKey(transaction.date) === monthFilter;

      const matchesSearch = transaction.title?.toLowerCase().includes(term) ||
        transaction.category?.toLowerCase().includes(term) ||
        transaction.description?.toLowerCase().includes(term);

      return matchesType && matchesMonth && matchesSearch;
    });
  }, [transactions, search, filter, monthFilter]);

  const totals = useMemo(
    () =>
      filteredTransactions.reduce(
        (acc, transaction) => {
          const amount = Number(transaction.amount) || 0;

          if (transaction.type === "income") {
            acc.income += amount;
          } else {
            acc.expenses += amount;
          }

          return acc;
        },
        { income: 0, expenses: 0 },
      ),
    [filteredTransactions],
  );

  const openAddForm = () => {
    setEditingId(null);
    setForm(createInitialTransactionForm());
    setShowForm(true);
  };

  const openEditForm = (transaction) => {
    setEditingId(transaction._id);

    setForm({
      title: transaction.title || "",
      amount: String(transaction.amount ?? ""),
      type: transaction.type || "expense",
      category: transaction.category || "Other",
      date: getDateInputValue(transaction.date),
      description: transaction.description || "",
    });

    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const amount = Number(form.amount);

    if (
      !form.title.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      setError("Enter a title and an amount greater than zero.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        title: form.title.trim(),
        amount,
      };

      if (editingId) {
        await updateTransaction(editingId, payload);
      } else {
        await addTransaction(payload);
      }

      setShowForm(false);
      setEditingId(null);
      setForm(createInitialTransactionForm());

      await loadTransactions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not save the transaction.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;

    try {
      setError("");
      await deleteTransaction(id);
      await loadTransactions();
    } catch {
      setError("Could not delete the transaction.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Your activity"
        title="Transactions"
        description="Search, filter, and manage your income and expenses."
      >
        <button
          onClick={openAddForm}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
        >
          <Plus size={18} />
          Add transaction
        </button>
      </PageHeader>

      <main className="space-y-6 px-5 py-7 sm:px-8 lg:px-10">
        {error && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p>{error}</p>
            <button
              onClick={() => setError("")}
              aria-label="Dismiss error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="Matching transactions"
            value={filteredTransactions.length}
            helper="Records matching your filters"
            icon={ArrowLeftRight}
            tone="violet"
          />
          <MetricCard
            label="Income in results"
            value={formatCurrency(totals.income)}
            helper="Income in the current view"
            icon={TrendingUp}
            tone="green"
          />
          <MetricCard
            label="Expenses in results"
            value={formatCurrency(totals.expenses)}
            helper="Expenses in the current view"
            icon={TrendingDown}
            tone="rose"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold">All transactions</h2>
              <p className="mt-1 text-sm text-slate-500">
                Search, filter, edit, or delete your records.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  aria-label="Search transactions"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search transactions"
                  className={`${inputClass} pl-9 sm:w-56`}
                />
              </div>

              <select
                aria-label="Filter transactions"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className={inputClass}
              >
                <option value="all">All transactions</option>
                <option value="income">Income only</option>
                <option value="expense">Expenses only</option>
              </select>

              <label className="sr-only" htmlFor="transaction-month-filter">
                Filter by month
              </label>
              <input
                id="transaction-month-filter"
                type="month"
                aria-label="Filter by month"
                value={monthFilter}
                onChange={(event) => setMonthFilter(event.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {loading
            ? (
              <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500">
                <LoaderCircle size={20} className="animate-spin" />
                Loading transactions...
              </div>
            )
            : filteredTransactions.length === 0
            ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <ArrowLeftRight
                  size={32}
                  className="text-slate-300"
                />
                <p className="mt-3 font-semibold">
                  No transactions found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Try another search or add a transaction.
                </p>
                <button
                  onClick={openAddForm}
                  className="mt-5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  Add transaction
                </button>
              </div>
            )
            : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Transaction</th>
                      <th className="px-5 py-4">Category</th>
                      <th className="px-5 py-4">Date</th>
                      <th className="px-5 py-4 text-right">Amount</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction._id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`rounded-xl p-2 ${
                                transaction.type === "income"
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-rose-50 text-rose-600"
                              }`}
                            >
                              {transaction.type === "income"
                                ? <ArrowDownLeft size={19} />
                                : <ArrowUpRight size={19} />}
                            </div>

                            <div>
                              <p className="text-sm font-semibold">
                                {transaction.title}
                              </p>
                              <p className="mt-1 max-w-48 truncate text-xs text-slate-500">
                                {transaction.description ||
                                  transaction.type}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium">
                            {transaction.category}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays size={15} />
                            {formatDateLabel(transaction.date, {
                              day: "2-digit",
                            })}
                          </span>
                        </td>

                        <td
                          className={`whitespace-nowrap px-5 py-4 text-right text-sm font-bold ${
                            transaction.type === "income"
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "−"}
                          {formatCurrency(transaction.amount)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditForm(transaction)}
                              aria-label={`Edit ${transaction.title}`}
                              className="rounded-lg p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-600"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(transaction._id)}
                              aria-label={`Delete ${transaction.title}`}
                              className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </section>
      </main>

      {/* Add/Edit modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              setShowForm(false);
            }
          }}
        >
          <div className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId ? "Edit transaction" : "Add transaction"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the transaction details.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-2 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="transaction-title"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Transaction title
                </label>
                <input
                  id="transaction-title"
                  required
                  maxLength={100}
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })}
                  placeholder="e.g. Hostel mess"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="transaction-amount"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Amount (₹)
                  </label>
                  <input
                    id="transaction-amount"
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(event) =>
                      setForm({ ...form, amount: event.target.value })}
                    placeholder="500"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="transaction-type"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Type
                  </label>
                  <select
                    id="transaction-type"
                    value={form.type}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        type: event.target.value,
                        category: categoryOptions[event.target.value][0],
                      })}
                    className={inputClass}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="transaction-category"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Category
                  </label>
                  <select
                    id="transaction-category"
                    value={form.category}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        category: event.target.value,
                      })}
                    className={inputClass}
                  >
                    {categoryOptions[form.type].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="transaction-date"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Date
                  </label>
                  <input
                    id="transaction-date"
                    required
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm({ ...form, date: event.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="transaction-description"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Description (optional)
                </label>
                <textarea
                  id="transaction-description"
                  rows={3}
                  maxLength={500}
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })}
                  placeholder="Add a short note..."
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {saving && (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Save changes"
                    : "Add transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
