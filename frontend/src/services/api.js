import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getReviewSummary = async () => {
  const response = await API.get(
    "/transactions/review-summary"
  );

  return response.data;
};

export const getPnL = async () => {
  const response = await API.get(
    "/transactions/pnl"
  );

  return response.data;
};

export const getMonthlyPnL = async () => {
  const response = await API.get(
    "/transactions/pnl/monthly"
  );

  return response.data;
};

export const getVariances = async () => {
  const response = await API.get(
    "/transactions/variances"
  );

  return response.data;
};

export const getReviewTransactions = async () => {
  const response = await API.get(
    "/transactions/reviews"
  );

  return response.data;
};

export const updateTransactionCategory = async (
  transactionId,
  data
) => {
  const response = await API.put(
    `/transactions/categories/${transactionId}`,
    data
  );

  return response.data;
};

export const getVarianceDrivers = async () => {
  const response = await API.get(
    "/transactions/variances/drivers"
  );

  return response.data;
};

export default API;