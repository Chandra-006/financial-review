import { useEffect, useState } from "react";
import {
  getVariances,
  getVarianceDrivers,
} from "../services/api";
import "../styles/variances.css";

const formatCurrency = (value) => {
  return `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatMetric = (metric) => {
  const names = {
    revenue: "Revenue",
    cogs: "COGS",
    grossProfit: "Gross Profit",
    payroll: "Payroll",
    operatingExpenses: "Operating Expenses",
    operatingProfit: "Operating Profit",
  };

  return names[metric] || metric;
};

const Variances = () => {
  const [variances, setVariances] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadVarianceData = async () => {
      try {
        setLoading(true);

        const [
          varianceResponse,
          driverResponse,
        ] = await Promise.all([
          getVariances(),
          getVarianceDrivers(),
        ]);

        setVariances(
          varianceResponse.variances || []
        );

        setDrivers(
          driverResponse.drivers || []
        );
      } catch (error) {
        console.error(error);

        setError(
          "Failed to load variance analysis."
        );
      } finally {
        setLoading(false);
      }
    };

    loadVarianceData();
  }, []);

  if (loading) {
    return (
      <div className="variance-page">
        <h1>Loading variance analysis...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="variance-page">
        <h1>Variance Analysis</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="variance-page">

      <div className="variance-header">
        <div>
          <p className="variance-eyebrow">
            Financial Analysis
          </p>

          <h1>Variance Analysis</h1>

          <p>
            Compare monthly financial movements
            and trace them back to transactions.
          </p>
        </div>
      </div>

      <section className="variance-section">

        <div className="section-heading">
          <h2>Month-over-Month Changes</h2>

          <p>
            Deterministic calculations from
            transaction data.
          </p>
        </div>

        <div className="variance-table-container">

          <table className="variance-table">

            <thead>
              <tr>
                <th>Period</th>
                <th>Metric</th>
                <th>Previous</th>
                <th>Current</th>
                <th>Change</th>
                <th>% Change</th>
              </tr>
            </thead>

            <tbody>

              {variances.map(
                (variance, index) => {

                  const positive =
                    variance.absoluteChange >= 0;

                  return (
                    <tr key={index}>

                      <td>
                        {variance.fromMonth}
                        {" → "}
                        {variance.toMonth}
                      </td>

                      <td>
                        <strong>
                          {formatMetric(
                            variance.metric
                          )}
                        </strong>
                      </td>

                      <td>
                        {formatCurrency(
                          variance.previousValue
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          variance.currentValue
                        )}
                      </td>

                      <td
                        className={
                          positive
                            ? "variance-positive"
                            : "variance-negative"
                        }
                      >
                        {positive ? "+" : ""}
                        {formatCurrency(
                          variance.absoluteChange
                        )}
                      </td>

                      <td
                        className={
                          positive
                            ? "variance-positive"
                            : "variance-negative"
                        }
                      >
                        {variance.percentageChange ===
                        null
                          ? "N/A"
                          : `${
                              positive ? "+" : ""
                            }${
                              variance.percentageChange
                            }%`}
                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

      </section>

      <section className="variance-section">

        <div className="section-heading">
          <h2>Transaction Drivers</h2>

          <p>
            Underlying transactions associated
            with each monthly period.
          </p>
        </div>

        {drivers.map((driver) => (
          <div
            className="driver-card"
            key={`${driver.fromMonth}-${driver.toMonth}`}
          >

            <div className="driver-header">

              <div>
                <span className="driver-label">
                  Comparison
                </span>

                <h3>
                  {driver.fromMonth}
                  {" → "}
                  {driver.toMonth}
                </h3>
              </div>

            </div>

            <div className="driver-category-grid">

              {Object.entries(
                driver.categoryChanges || {}
              ).map(
                ([category, data]) => (
                  <div
                    className="driver-category"
                    key={category}
                  >

                    <span>
                      {formatMetric(category)}
                    </span>

                    <strong>
                      {formatCurrency(
                        data.change
                      )}
                    </strong>

                  </div>
                )
              )}

            </div>

            <div className="transaction-driver">

              <h4>
                Largest Transactions in Current Month
              </h4>

              <div className="driver-list">

                {driver.topTransactions.map(
                  (transaction) => (
                    <div
                      className="driver-transaction"
                      key={
                        transaction.transactionId
                      }
                    >

                      <div>
                        <strong>
                          {
                            transaction.transactionId
                          }
                        </strong>

                        <span>
                          {transaction.description}
                        </span>

                        <small>
                          {
                            transaction.counterparty
                          }
                        </small>
                      </div>

                      <div className="driver-amount">

                        <span>
                          {transaction.category}
                        </span>

                        <strong>
                          {formatCurrency(
                            Math.abs(
                              transaction.amount
                            )
                          )}
                        </strong>

                      </div>

                    </div>
                  )
                )}

              </div>

            </div>

          </div>
        ))}

      </section>

    </div>
  );
};

export default Variances;