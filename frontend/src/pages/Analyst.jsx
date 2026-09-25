import { useState } from "react";
import { askAnalyst } from "../services/api";
import "../styles/analyst.css";

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const Analyst = () => {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const exampleQuestions = [
    "What was the operating profit in March?",
    "Why did operating profit increase in March?",
    "What was the total revenue?",
    "Which transactions need review?",
    "What were the largest transactions?",
  ];

  const handleAsk = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await askAnalyst(question);

      setResult(response);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to get an answer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setQuestion(example);
  };

  const renderEvidenceValue = () => {
    const evidence = result?.evidence;

    if (!evidence) return null;

    if (evidence.value !== undefined) {
      return (
        <div className="evidence-stat">
          <span>Value</span>
          <strong>{formatCurrency(evidence.value)}</strong>
        </div>
      );
    }

    if (evidence.count !== undefined) {
      return (
        <div className="evidence-stat">
          <span>Transactions</span>
          <strong>{evidence.count}</strong>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="analyst-page">
      <div className="analyst-header">
        <div>
          <span className="analyst-eyebrow">
            AI FINANCIAL ANALYST
          </span>

          <h1>Ask your financial data</h1>

          <p>
            Ask questions about your transactions, P&amp;L,
            monthly performance, and review items.
          </p>
        </div>
      </div>

      <div className="analyst-container">
        {/* QUESTION */}
        <div className="analyst-question-card">
          <label htmlFor="analyst-question">
            What would you like to know?
          </label>

          <div className="analyst-input-wrapper">
            <textarea
              id="analyst-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAsk();
                }
              }}
              placeholder="Example: Why did operating profit increase in March?"
              rows={4}
            />

            <button
              className="analyst-ask-button"
              onClick={handleAsk}
              disabled={loading || !question.trim()}
            >
              {loading ? "Analyzing..." : "Ask Analyst"}
            </button>
          </div>

          <div className="analyst-examples">
            <span>Try asking:</span>

            <div className="example-list">
              {exampleQuestions.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="analyst-error">
            {error}
          </div>
        )}

        {/* RESULT */}
        {result && (
          <div className="analyst-result">
            {/* ANSWER */}
            <div className="answer-card">
              <div className="result-label">
                ANALYST ANSWER
              </div>

              <h2>{result.answer}</h2>
            </div>

            {/* EVIDENCE */}
            {result.evidence && (
              <div className="evidence-card">
                <div className="evidence-header">
                  <div>
                    <div className="result-label">
                      TRACEABLE EVIDENCE
                    </div>

                    <h3>
                      Source data used for this answer
                    </h3>
                  </div>
                </div>

                <div className="evidence-summary">
                  <div className="evidence-stat source-stat">
                    <span>Source</span>
                    <strong>
                      {result.evidence.source}
                    </strong>
                  </div>

                  {result.evidence.month && (
                    <div className="evidence-stat">
                      <span>Period</span>
                      <strong>
                        {result.evidence.month}
                      </strong>
                    </div>
                  )}

                  {renderEvidenceValue()}
                </div>

                {/* VARIANCE EVIDENCE */}
                {result.evidence.operatingProfit && (
                  <div className="variance-evidence">
                    <h4>Operating profit movement</h4>

                    <div className="variance-grid">
                      <div>
                        <span>February</span>
                        <strong>
                          {formatCurrency(
                            result.evidence.operatingProfit
                              .february
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>March</span>
                        <strong>
                          {formatCurrency(
                            result.evidence.operatingProfit
                              .march
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Change</span>
                        <strong>
                          {formatCurrency(
                            result.evidence.operatingProfit
                              .change
                          )}
                        </strong>
                      </div>
                    </div>

                    <div className="driver-grid">
                      <div>
                        <span>Revenue change</span>
                        <strong>
                          {formatCurrency(
                            result.evidence.revenue.change
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>COGS change</span>
                        <strong>
                          {formatCurrency(
                            result.evidence.cogs.change
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Payroll change</span>
                        <strong>
                          {formatCurrency(
                            result.evidence.payroll.change
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Operating expenses</span>
                        <strong>
                          {formatCurrency(
                            result.evidence
                              .operatingExpenses.change
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* TRANSACTION EVIDENCE */}
                {result.evidence.transactions &&
                  result.evidence.transactions.length > 0 && (
                    <div className="evidence-transactions">
                      <div className="transaction-evidence-header">
                        <div>
                          <div className="result-label">
                            UNDERLYING TRANSACTIONS
                          </div>

                          <h4>
                            Transaction-level evidence
                          </h4>
                        </div>

                        <span className="transaction-count">
                          {
                            result.evidence.transactions
                              .length
                          }{" "}
                          shown
                        </span>
                      </div>

                      <div className="evidence-table-wrapper">
                        <table>
                          <thead>
                            <tr>
                              <th>Transaction</th>
                              <th>Description</th>
                              <th>Counterparty</th>
                              <th>Amount</th>
                              <th>Category</th>
                            </tr>
                          </thead>

                          <tbody>
                            {result.evidence.transactions.map(
                              (transaction) => (
                                <tr
                                  key={
                                    transaction.transactionId
                                  }
                                >
                                  <td>
                                    <strong>
                                      {
                                        transaction.transactionId
                                      }
                                    </strong>
                                  </td>

                                  <td>
                                    {
                                      transaction.description
                                    }
                                  </td>

                                  <td>
                                    {
                                      transaction.counterparty
                                    }
                                  </td>

                                  <td>
                                    <strong>
                                      {formatCurrency(
                                        Math.abs(
                                          Number(
                                            transaction.amount
                                          )
                                        )
                                      )}
                                    </strong>
                                  </td>

                                  <td>
                                    <span className="category-badge">
                                      {
                                        transaction.category
                                      }
                                    </span>
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analyst;