/**
 * API route definitions for the financial review workflow.
 *
 * Each route is mapped to a controller function so the request/response layer
 * stays thin and the database and business logic live in the service layer.
 */
const express = require("express");
const multer = require("multer");

const {
  uploadTransactions,
  getTransactions,
  categorizeAllTransactions,
  getAnalystContextController,
  getReviewTransactions,
  updateTransactionCategory,
  getPnL,
  getMonthlyPnL,
  getVariances,
  getVarianceDriversController,
  getReviewSummary,
  askAnalyst,
} = require("../controllers/transactionController");

const router = express.Router();

// Temporary storage for uploaded CSV files before they are parsed and inserted.
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Get all transactions in the database.
router.get("/", getTransactions);

// Get transactions that need manual review or correction.
router.get("/reviews", getReviewTransactions);

// Upload a CSV file for transaction import.
router.post(
  "/upload",
  upload.single("file"),
  uploadTransactions
);

// Batch-categorize transactions using the rules service.
router.post(
  "/categorize",
  categorizeAllTransactions
);

// Update an individual transaction category after review.
router.put(
  "/categories/:transactionId",
  updateTransactionCategory
);

// Read the current P&L summary.
router.get("/pnl", getPnL);

// Read month-by-month P&L totals for charts and summaries.
router.get("/pnl/monthly", getMonthlyPnL);

// Read variance differences between months.
router.get("/variances", getVariances);

// Read the transactions driving month-to-month change.
router.get(
  "/variances/drivers",
  getVarianceDriversController
);

// Read aggregate metrics used on the dashboard.
router.get("/review-summary", getReviewSummary);

// Build the intelligence context used by the AI analyst.
router.get(
  "/analyst/context",
  getAnalystContextController
);

// Ask the analyst a natural-language question about the dataset.
router.post("/analyst/ask", askAnalyst);

module.exports = router;