import { useEffect, useState } from "react";
import {
  getReviewSummary,
  getTransactions,
  getPnL,
  getMonthlyPnL,
} from "../services/api";

// Dashboard renders the high-level business health snapshot for the review workflow.
const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [pnl, setPnl] = useState(null);
  const [monthlyPnL, setMonthlyPnL] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [summaryResponse, transactionsResponse, pnlResponse, monthlyResponse] = await Promise.all([
          getReviewSummary(),
          getTransactions(),
          getPnL(),
          getMonthlyPnL(),
        ]);

        setSummary(summaryResponse.summary);
        setCategoryBreakdown(summaryResponse.categories || []);
        setTransactions(transactionsResponse.transactions || []);
        setPnl(pnlResponse.pnl);
        setMonthlyPnL(monthlyResponse.months);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800">Loading dashboard...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-3">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
          FINZ Financial Review
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">Financial Dashboard</h1>
        <p className="mt-2 text-slate-600">
          Review transactions, profitability, and financial movements.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Transactions", value: summary?.totalTransactions ?? 0 },
          { label: "Needs Review", value: summary?.reviewRequired ?? 0 },
          { label: "Revenue", value: `₹${pnl?.revenue?.toLocaleString("en-IN") ?? 0}` },
          { label: "Operating Profit", value: `₹${pnl?.operatingProfit?.toLocaleString("en-IN") ?? 0}` },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="text-sm font-medium text-slate-500">{card.label}</span>
            <strong className="mt-4 block text-3xl font-bold text-slate-900">{card.value}</strong>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Monthly P&L</h2>
          <p className="text-slate-600">Financial performance by month</p>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[700px] space-y-2">
            <div className="grid grid-cols-5 gap-4 rounded-xl bg-slate-100 p-3 text-xs font-bold uppercase tracking-wide text-slate-600">
              <span>Month</span>
              <span>Revenue</span>
              <span>COGS</span>
              <span>Gross Profit</span>
              <span>Operating Profit</span>
            </div>

            {monthlyPnL.map((month) => (
              <div key={month.month} className="grid grid-cols-5 gap-4 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                <span>{month.month}</span>
                <span>₹{month.revenue.toLocaleString("en-IN")}</span>
                <span>₹{month.cogs.toLocaleString("en-IN")}</span>
                <span>₹{month.grossProfit.toLocaleString("en-IN")}</span>
                <span>₹{month.operatingProfit.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Category Breakdown</h2>
          <p className="text-slate-600">Current transaction classification</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categoryBreakdown.map((category) => (
            <button
              key={category.category}
              type="button"
              onClick={() => setSelectedCategory(category.category)}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                selectedCategory === category.category
                  ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                  : "border-transparent bg-slate-50 hover:border-indigo-200 hover:bg-indigo-50"
              }`}
            >
              <span className="font-medium text-slate-700">{category.category}</span>
              <strong className="text-xl font-bold text-slate-900">{category.count}</strong>
            </button>
          ))}
        </div>

        {selectedCategory && (
          <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {selectedCategory} transactions
                </h3>
                <p className="text-sm text-slate-600">
                  {transactions.filter((transaction) => transaction.category === selectedCategory).length} transactions in this category
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="max-h-96 overflow-auto rounded-xl border border-indigo-100 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-3">Transaction</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Counterparty</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Review</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {transactions
                    .filter((transaction) => transaction.category === selectedCategory)
                    .map((transaction) => (
                      <tr key={transaction.transaction_id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
                          {transaction.transaction_id}
                        </td>
                        <td className="min-w-56 px-4 py-3">{transaction.description}</td>
                        <td className="min-w-44 px-4 py-3">{transaction.counterparty}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          ₹{Number(transaction.amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          {transaction.is_review_required ? "Needs review" : "Reviewed"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;