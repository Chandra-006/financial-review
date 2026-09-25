import { useEffect, useState } from "react";
import {
  getReviewSummary,
  getPnL,
  getMonthlyPnL,
} from "../services/api";

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

        const [
          summaryResponse,
          pnlResponse,
          monthlyResponse,
        ] = await Promise.all([
          getReviewSummary(),
          getPnL(),
          getMonthlyPnL(),
        ]);

        setSummary(summaryResponse.summary);
        setPnl(pnlResponse.pnl);
        setMonthlyPnL(monthlyResponse.months);
      } catch (error) {
        console.error(error);
        setError(
          "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1>Loading dashboard...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <h1>Dashboard</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            FINZ Financial Review
          </p>

          <h1>Financial Dashboard</h1>

          <p>
            Review transactions, profitability,
            and financial movements.
          </p>
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <span>Total Transactions</span>
          <strong>
            {summary?.totalTransactions ?? 0}
          </strong>
        </div>

        <div className="metric-card">
          <span>Needs Review</span>
          <strong>
            {summary?.reviewRequired ?? 0}
          </strong>
        </div>

        <div className="metric-card">
          <span>Revenue</span>
          <strong>
            ₹{pnl?.revenue?.toLocaleString("en-IN") ?? 0}
          </strong>
        </div>

        <div className="metric-card">
          <span>Operating Profit</span>
          <strong>
            ₹
            {pnl?.operatingProfit?.toLocaleString(
              "en-IN"
            ) ?? 0}
          </strong>
        </div>
      </div>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Monthly P&L</h2>
            <p>
              Financial performance by month
            </p>
          </div>
        </div>

        <div className="monthly-table">
          <div className="table-row table-header">
            <span>Month</span>
            <span>Revenue</span>
            <span>COGS</span>
            <span>Gross Profit</span>
            <span>Operating Profit</span>
          </div>

          {monthlyPnL.map((month) => (
            <div
              className="table-row"
              key={month.month}
            >
              <span>{month.month}</span>

              <span>
                ₹
                {month.revenue.toLocaleString(
                  "en-IN"
                )}
              </span>

              <span>
                ₹
                {month.cogs.toLocaleString(
                  "en-IN"
                )}
              </span>

              <span>
                ₹
                {month.grossProfit.toLocaleString(
                  "en-IN"
                )}
              </span>

              <span>
                ₹
                {month.operatingProfit.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Category Breakdown</h2>
            <p>
              Current transaction classification
            </p>
          </div>
        </div>

        <div className="category-grid">
          {summary?.categories?.map(
            (category) => (
              <div
                className="category-card"
                key={category.category}
              >
                <span>
                  {category.category}
                </span>

                <strong>
                  {category.count}
                </strong>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;