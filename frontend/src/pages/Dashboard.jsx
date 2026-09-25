import { useEffect, useState } from "react";
import {
  getReviewSummary,
  getPnL,
  getMonthlyPnL,
} from "../services/api";

// Dashboard renders the high-level business health snapshot for the review workflow.
const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [pnl, setPnl] = useState(null);
  const [monthlyPnL, setMonthlyPnL] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const [summaryResponse, pnlResponse, monthlyResponse] = await Promise.all([
          getReviewSummary(),
          getPnL(),
          getMonthlyPnL(),
        ]);

        setSummary(summaryResponse.summary);
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
          {summary?.categories?.map((category) => (
            <div key={category.category} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <span className="font-medium text-slate-700">{category.category}</span>
              <strong className="text-xl font-bold text-slate-900">{category.count}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;