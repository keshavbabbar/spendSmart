import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Layers3,
  Plus,
  RefreshCw,
  Tag,
  Trash2,
} from "lucide-react";
import MetricCard from "../components/MetricCard";
import PageHeader from "../components/PageHeader";
import { addCategory, deleteCategory, getCategories } from "../services/api";
import { transactionCategories } from "../utils/finance";

const emptyForm = { name: "", type: "expense" };

export default function Categories() {
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [typeFilter, setTypeFilter] = useState("all");

  const loadCategories = useCallback(async () => {
    try {
      const result = await getCategories();
      setCustomCategories(result.data || []);
      setError("");
    } catch {
      setError(
        "Could not load custom categories. Check that the API and MongoDB are running.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(loadCategories);
  }, [loadCategories]);

  const allCategories = useMemo(() => [
    ...transactionCategories.income.map((name) => ({
      name,
      type: "income",
      builtIn: true,
    })),
    ...transactionCategories.expense.map((name) => ({
      name,
      type: "expense",
      builtIn: true,
    })),
    ...customCategories.map((category) => ({ ...category, builtIn: false })),
  ], [customCategories]);
  const visibleCategories = typeFilter === "all"
    ? allCategories
    : allCategories.filter((category) => category.type === typeFilter);
  const incomeCount =
    allCategories.filter((category) => category.type === "income").length;
  const expenseCount =
    allCategories.filter((category) => category.type === "expense").length;

  const submit = async (event) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) {
      setError("Enter a category name.");
      return;
    }
    const exists = allCategories.some((category) =>
      category.type === form.type &&
      category.name.toLocaleLowerCase() === name.toLocaleLowerCase()
    );
    if (exists) {
      setError("A category with that name already exists for this type.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await addCategory({ name, type: form.type });
      setForm(emptyForm);
      setShowForm(false);
      await loadCategories();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not create this category.",
      );
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (category) => {
    if (!window.confirm(`Delete the custom ${category.name} category?`)) return;
    try {
      setError("");
      await deleteCategory(category._id);
      await loadCategories();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Could not delete this category.",
      );
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Make it yours"
        title="Categories"
        description="Use the built-in categories or add your own labels for income and spending."
      >
        <button
          onClick={() => {
            setForm(emptyForm);
            setShowForm(true);
            setError("");
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
        >
          <Plus size={17} /> Add category
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
                  void loadCategories();
                }}
                className="inline-flex items-center gap-1 font-semibold"
              >
                <RefreshCw size={14} /> Retry
              </button>
            )}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            label="All categories"
            value={allCategories.length}
            helper="Built-in and custom labels"
            icon={Layers3}
            tone="violet"
          />
          <MetricCard
            label="Income categories"
            value={incomeCount}
            helper="For money coming in"
            icon={Tag}
            tone="green"
          />
          <MetricCard
            label="Expense categories"
            value={expenseCount}
            helper="For purchases and bills"
            icon={Tag}
            tone="rose"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold">Category library</h2>
              <p className="mt-1 text-sm text-slate-500">
                Custom categories appear in transaction and budget forms.
              </p>
            </div>
            <div
              className="flex gap-1 rounded-xl bg-slate-100 p-1"
              role="group"
              aria-label="Filter categories"
            >
              {["all", "income", "expense"].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize ${
                    typeFilter === type
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {type === "all" ? "All" : type}
                </button>
              ))}
            </div>
          </div>
          {loading
            ? (
              <p className="p-12 text-center text-sm text-slate-500">
                Loading categories…
              </p>
            )
            : (
              <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3 sm:p-6">
                {visibleCategories.map((category) => (
                  <article
                    key={`${category.type}-${category.name}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`rounded-lg p-2 ${
                          category.type === "income"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        <Tag size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {category.name}
                        </p>
                        <p className="mt-0.5 text-xs capitalize text-slate-500">
                          {category.type}
                          {category.builtIn ? " · built in" : " · custom"}
                        </p>
                      </div>
                    </div>
                    {!category.builtIn && (
                      <button
                        onClick={() => removeCategory(category)}
                        aria-label={`Delete ${category.name} category`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
        </section>
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
            aria-labelledby="category-form-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 id="category-form-title" className="text-lg font-bold">
              Add a category
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose whether this label is for income or expenses.
            </p>
            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block text-sm font-medium">
                Name<input
                  autoFocus
                  required
                  maxLength={80}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })}
                  placeholder="e.g. Books and supplies"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                />
              </label>
              <label className="block text-sm font-medium">
                Type<select
                  value={form.type}
                  onChange={(event) =>
                    setForm({ ...form, type: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </label>
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
                  {saving ? "Saving…" : "Create category"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
