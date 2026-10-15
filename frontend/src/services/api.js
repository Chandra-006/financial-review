/**
 * Shared HTTP client for the frontend.
 *
 * The app uses a single Axios instance so all pages interact with the backend in a
 * consistent way and the API base URL can be changed in one place.
 */
import axios from "axios";

// Shared API client for all frontend pages. Centralizing the base URL keeps the
// application easier to maintain when moving between local and deployed APIs.
const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Dashboard data endpoints.
export const getReviewSummary = async () => {
  const response = await api.get("/transactions/review-summary");
  return response.data;
};

export const getTransactions = async () => {
  const response = await api.get("/transactions");
  return response.data;
};

export const getPnL = async () => {
  const response = await api.get("/transactions/pnl");
  return response.data;
};

export const getMonthlyPnL = async () => {
  const response = await api.get("/transactions/pnl/monthly");
  return response.data;
};

export const getVariances = async () => {
  const response = await api.get("/transactions/variances");
  return response.data;
};

// Review workflow endpoints.
export const getReviewTransactions = async () => {
  const response = await api.get("/transactions/reviews");
  return response.data;
};

export const updateTransactionCategory = async (
  transactionId,
  { newCategory, reason, isPnl }
) => {
  const response = await api.put(
    `/transactions/categories/${transactionId}`,
    {
      newCategory,
      reason,
      isPnl,
    }
  );

  return response.data;
};

// Variance driver analysis endpoint.
export const getVarianceDrivers = async () => {
  const response = await api.get("/transactions/variances/drivers");
  return response.data;
};

// AI Analyst question endpoint.
export const askAnalyst = async (question) => {
  const response = await api.post("/transactions/analyst/ask", {
    question,
  });

  return response.data;
};