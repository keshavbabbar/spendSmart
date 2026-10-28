export const transactionCategories = {
  income: ["Salary", "Freelance", "Business", "Gift", "Other"],
  expense: [
    "Food",
    "Travel",
    "Shopping",
    "Education",
    "Bills",
    "Entertainment",
    "Health",
    "Other",
  ],
};

export function formatCurrency(amount, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits,
  }).format(Number(amount) || 0);
}

export function getMonthKey(value = new Date()) {
  if (typeof value === "string" && /^\d{4}-\d{2}/.test(value)) {
    return value.slice(0, 7);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${
    String(date.getMonth() + 1).padStart(2, "0")
  }`;
}

export function getCurrentDateInputValue() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export function getDateInputValue(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return getCurrentDateInputValue();
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );
  return localDate.toISOString().slice(0, 10);
}

export function getCurrentMonth() {
  return getMonthKey(new Date());
}

export function formatMonthLabel(month) {
  if (!month) return "";
  return new Date(`${month}-01T12:00:00`).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function formatDateLabel(value, options = {}) {
  const dateValue =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)
      ? `${value.slice(0, 10)}T12:00:00`
      : value;
  return new Date(dateValue).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  });
}

export function createInitialTransactionForm() {
  return {
    title: "",
    amount: "",
    type: "expense",
    category: "Food",
    date: getCurrentDateInputValue(),
    description: "",
  };
}
