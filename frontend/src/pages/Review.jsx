import { useEffect, useState } from "react";
import {
  getReviewTransactions,
  updateTransactionCategory,
} from "../services/api";

const CATEGORIES = [
  "REVENUE",
  "COGS",
  "PAYROLL",
  "OPERATING_EXPENSE",
  "NON_PNL",
];

const Review = () => {
  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [reason, setReason] = useState("");

  const [savingId, setSavingId] =
    useState(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getReviewTransactions();

      setTransactions(
        response.transactions || []
      );
    } catch (error) {
      console.error(error);

      setError(
        "Failed to load review transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const startEditing = (transaction) => {
    setEditingId(
      transaction.transaction_id
    );

    setSelectedCategory(
      transaction.category || ""
    );

    setReason("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setSelectedCategory("");
    setReason("");
  };

  // Once a user confirms the correct category, persist the correction and remove
  // the transaction from the review queue so the analyst can focus on the next item.
  const handleSave = async (transactionId) => {
    if (!selectedCategory) {
      alert("Please select a category.");
      return;
    }

    if (!reason.trim()) {
      alert("Please enter a reason for the correction.");
      return;
    }

    try {
      setSavingId(transactionId);

      await updateTransactionCategory(
        transactionId,
        {
          newCategory: selectedCategory,
          reason: reason.trim(),
          isPnl: selectedCategory !== "NON_PNL",
        }
      );

      setTransactions((current) =>
        current.filter(
          (transaction) =>
            transaction.transaction_id !==
            transactionId
        )
      );

      cancelEditing();
    } catch (error) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
          "Failed to update transaction category."
      );
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="review-page">
        <h1>Loading reviews...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="review-page">
        <h1>Transaction Review</h1>
        <p>{error}</p>

        <button onClick={loadReviews}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="review-page">

      <div className="review-header">
        <div>
          <p className="review-eyebrow">
            Human Review
          </p>

          <h1>Transaction Review</h1>

          <p>
            Review and correct transactions
            that need classification attention.
          </p>
        </div>

        <div className="review-count">
          <span>Needs Review</span>

          <strong>
            {transactions.length}
          </strong>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <h2>All transactions reviewed</h2>

          <p>
            There are currently no transactions
            requiring review.
          </p>
        </div>
      ) : (
        <div className="review-table-container">

          <table className="review-table">

            <thead>
              <tr>
                <th>Transaction</th>
                <th>Date</th>
                <th>Description</th>
                <th>Counterparty</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Confidence</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {transactions.map(
                (transaction) => {

                  const transactionId =
                    transaction.transaction_id;

                  const isEditing =
                    editingId === transactionId;

                  const isSaving =
                    savingId === transactionId;

                  return (
                    <tr
                      key={transactionId}
                    >

                      <td>
                        <strong>
                          {transactionId}
                        </strong>
                      </td>

                      <td>
                        {new Date(
                          transaction.transaction_date
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>

                      <td>
                        {transaction.description}
                      </td>

                      <td>
                        {transaction.counterparty}
                      </td>

                      <td>
                        ₹
                        {Number(
                          transaction.amount
                        ).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                          }
                        )}
                      </td>

                      <td>
                        {isEditing ? (
                          <select
                            value={
                              selectedCategory
                            }
                            onChange={(event) =>
                              setSelectedCategory(
                                event.target.value
                              )
                            }
                            className="category-select"
                          >
                            <option value="">
                              Select category
                            </option>

                            {CATEGORIES.map(
                              (category) => (
                                <option
                                  key={category}
                                  value={category}
                                >
                                  {category}
                                </option>
                              )
                            )}
                          </select>
                        ) : (
                          <span className="category-badge">
                            {transaction.category}
                          </span>
                        )}
                      </td>

                      <td>
                        {transaction.confidence}
                      </td>

                      <td>

                        {isEditing ? (
                          <div className="correction-actions">

                            <textarea
                              value={reason}
                              onChange={(event) =>
                                setReason(
                                  event.target.value
                                )
                              }
                              placeholder="Reason for correction..."
                              className="correction-reason"
                              rows="2"
                            />

                            <div className="action-buttons">

                              <button
                                className="save-button"
                                onClick={() =>
                                  handleSave(
                                    transactionId
                                  )
                                }
                                disabled={isSaving}
                              >
                                {isSaving
                                  ? "Saving..."
                                  : "Save"}
                              </button>

                              <button
                                className="cancel-button"
                                onClick={
                                  cancelEditing
                                }
                                disabled={isSaving}
                              >
                                Cancel
                              </button>

                            </div>

                          </div>
                        ) : (
                          <button
                            className="review-button"
                            onClick={() =>
                              startEditing(
                                transaction
                              )
                            }
                          >
                            Review
                          </button>
                        )}

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
};

export default Review;