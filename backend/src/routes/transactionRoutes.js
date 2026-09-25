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

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

// Get all transactions
router.get("/", getTransactions);

// Get transactions that need review
router.get("/reviews", getReviewTransactions);

// Upload CSV
router.post(
  "/upload",
  upload.single("file"),
  uploadTransactions
);

// Categorize transactions
router.post(
  "/categorize",
  categorizeAllTransactions
);

// Update transaction category
router.put(
  "/categories/:transactionId",
  updateTransactionCategory
);

// Get P&L
router.get("/pnl", getPnL);

// Get monthly P&L
router.get("/pnl/monthly", getMonthlyPnL);

// Get variances
router.get("/variances", getVariances);

// Get variance drivers
router.get(
  "/variances/drivers",
  getVarianceDriversController
);

router.get("/review-summary", getReviewSummary);
router.get("/reviews", getReviewTransactions);

router.get(
  "/analyst/context",
  getAnalystContextController
);

router.post("/analyst/ask", askAnalyst);

module.exports = router;