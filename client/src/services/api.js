import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Fetch all transactions
export const getTransactions = async () => {
  const response = await API.get("/transactions");
  return response.data;
};

// Add a transaction
export const addTransaction = async (transaction) => {
  const response = await API.post("/transactions", transaction);
  return response.data;
};

// Update a transaction
export const updateTransaction = async (id, transaction) => {
  const response = await API.put(`/transactions/${id}`, transaction);
  return response.data;
};

// Delete a transaction
export const deleteTransaction = async (id) => {
  const response = await API.delete(`/transactions/${id}`);
  return response.data;
};

export default API;

export const getBudgets = async (month) => {
  const response = await API.get("/budgets", {
    params: month ? { month } : {},
  });
  return response.data;
};

export const addBudget = async (budget) => {
  const response = await API.post("/budgets", budget);
  return response.data;
};

export const updateBudget = async (id, budget) => {
  const response = await API.put(`/budgets/${id}`, budget);
  return response.data;
};

export const deleteBudget = async (id) => {
  const response = await API.delete(`/budgets/${id}`);
  return response.data;
};

export const getCategories = async (type) => {
  const response = await API.get("/categories", {
    params: type ? { type } : {},
  });
  return response.data;
};

export const addCategory = async (category) => {
  const response = await API.post("/categories", category);
  return response.data;
};

export const updateCategory = async (id, category) => {
  const response = await API.put(`/categories/${id}`, category);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await API.delete(`/categories/${id}`);
  return response.data;
};

export const getMonthlyReport = async (month) => {
  const response = await API.get("/reports/monthly", { params: { month } });
  return response.data;
};
