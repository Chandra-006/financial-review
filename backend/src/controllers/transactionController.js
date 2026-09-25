const fs = require("fs");
const { parse } = require("csv-parse");
const { calculatePnL,calculateMonthlyPnL } = require("../services/pnlService");
const { calculateVariances,} = require("../services/varianceService");
const {
  getVarianceDrivers,
} = require("../services/driverService");
const pool = require("../config/database");



const getPnL = async (req, res) => {
  try {
    const pnl = await calculatePnL();

    res.json({
      success: true,
      pnl,
    });
  } catch (error) {
    console.error("P&L calculation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to calculate P&L",
      error: error.message,
    });
  }
};

const {
  categorizeTransaction,
} = require("../services/categorizationService");

const uploadTransactions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a CSV file",
      });
    }

    const transactions = [];

    fs.createReadStream(req.file.path)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
        })
      )
      .on("data", (row) => {
        transactions.push(row);
      })
      .on("end", async () => {
        try {
          if (transactions.length === 0) {
            return res.status(400).json({
              success: false,
              message: "CSV file contains no transactions",
            });
          }

          let insertedCount = 0;

          for (const transaction of transactions) {
            const amount = Number(
              transaction.amount.replace(/[$,]/g, "")
            );

            await pool.query(
              `
              INSERT INTO transactions (
                transaction_id,
                transaction_date,
                description,
                counterparty,
                amount,
                method
              )
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (transaction_id) DO NOTHING
              `,
              [
                transaction.transaction_id,
                transaction.date,
                transaction.description,
                transaction.counterparty,
                amount,
                transaction.method,
              ]
            );

            insertedCount++;
          }

          fs.unlinkSync(req.file.path);

          res.status(201).json({
            success: true,
            message: "Transactions imported successfully",
            totalTransactions: transactions.length,
            processedTransactions: insertedCount,
          });
        } catch (error) {
          console.error("Database insertion error:", error);

          res.status(500).json({
            success: false,
            message: "Failed to save transactions",
            error: error.message,
          });
        }
      })
      .on("error", (error) => {
        console.error("CSV parsing error:", error);

        res.status(400).json({
          success: false,
          message: "Invalid CSV file",
          error: error.message,
        });
      });
  } catch (error) {
    console.error("Upload error:", error);

    res.status(500).json({
      success: false,
      message: "File upload failed",
      error: error.message,
    });
  }
};

const getTransactions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        transaction_id,
        transaction_date,
        description,
        counterparty,
        amount,
        method,
        category,
        confidence,
        is_review_required,
        is_pnl,
        created_at,
        updated_at
      FROM transactions
      ORDER BY transaction_date DESC, id DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      transactions: result.rows,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};


const categorizeAllTransactions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        transaction_id,
        description,
        counterparty,
        amount
      FROM transactions
      WHERE category IS NULL
      ORDER BY transaction_date ASC
    `);

    let categorizedCount = 0;
    let reviewCount = 0;

    for (const transaction of result.rows) {
      const classification =
        categorizeTransaction(transaction);

      await pool.query(
        `
        UPDATE transactions
        SET
          category = $1,
          confidence = $2,
          is_review_required = $3,
          is_pnl = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE transaction_id = $5
        `,
        [
          classification.category,
          classification.confidence,
          classification.reviewRequired,
          classification.isPnl,
          transaction.transaction_id,
        ]
      );

      categorizedCount++;

      if (classification.reviewRequired) {
        reviewCount++;
      }
    }

    res.json({
      success: true,
      message: "Transactions categorized successfully",
      categorizedCount,
      reviewCount,
    });
  } catch (error) {
    console.error(
      "Categorization error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to categorize transactions",
      error: error.message,
    });
  }
};

const getReviewTransactions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        transaction_id,
        transaction_date,
        description,
        counterparty,
        amount,
        method,
        category,
        confidence,
        is_review_required,
        is_pnl
      FROM transactions
      WHERE is_review_required = TRUE
      ORDER BY transaction_date DESC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      transactions: result.rows,
    });
  } catch (error) {
    console.error("Review transactions error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch review transactions",
      error: error.message,
    });
  }
};

const updateTransactionCategory = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const {
      newCategory,
      reason,
      isPnl = true,
    } = req.body;

    if (!newCategory) {
      return res.status(400).json({
        success: false,
        message: "newCategory is required",
      });
    }

    const transactionResult = await pool.query(
      `
      SELECT
        transaction_id,
        category
      FROM transactions
      WHERE transaction_id = $1
      `,
      [transactionId]
    );

    if (transactionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const oldCategory =
      transactionResult.rows[0].category;

    await pool.query(
      `
      UPDATE transactions
      SET
        category = $1,
        confidence = 1.00,
        is_review_required = FALSE,
        is_pnl = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE transaction_id = $3
      `,
      [
        newCategory,
        isPnl,
        transactionId,
      ]
    );

    await pool.query(
      `
      INSERT INTO category_corrections (
        transaction_id,
        old_category,
        new_category,
        reason
      )
      VALUES ($1, $2, $3, $4)
      `,
      [
        transactionId,
        oldCategory,
        newCategory,
        reason || null,
      ]
    );

    res.json({
      success: true,
      message: "Transaction category updated successfully",
      transactionId,
      oldCategory,
      newCategory,
    });
  } catch (error) {
    console.error(
      "Category update error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update transaction category",
      error: error.message,
    });
  }
};

const getMonthlyPnL = async (req, res) => {
  try {
    const monthlyPnL = await calculateMonthlyPnL();

    res.json({
      success: true,
      months: monthlyPnL,
    });
  } catch (error) {
    console.error(
      "Monthly P&L calculation error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to calculate monthly P&L",
      error: error.message,
    });
  }
};

const getVariances = async (req, res) => {
  try {
    const varianceData = await calculateVariances();

    res.json({
      success: true,
      ...varianceData,
    });
  } catch (error) {
    console.error(
      "Variance calculation error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to calculate variances",
      error: error.message,
    });
  }
};

const getVarianceDriversController = async (req, res) => {
  try {
    const drivers = await getVarianceDrivers();

    res.json({
      success: true,
      drivers,
    });
  } catch (error) {
    console.error(
      "Variance drivers error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to calculate variance drivers",
      error: error.message,
    });
  }
};

const getReviewSummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) AS total_transactions,

        COUNT(*) FILTER (
          WHERE category IS NOT NULL
        ) AS categorized_transactions,

        COUNT(*) FILTER (
          WHERE category IS NULL
        ) AS uncategorized_transactions,

        COUNT(*) FILTER (
          WHERE is_review_required = TRUE
        ) AS review_required,

        COUNT(*) FILTER (
          WHERE is_pnl = TRUE
        ) AS pnl_transactions,

        COUNT(*) FILTER (
          WHERE is_pnl = FALSE
        ) AS non_pnl_transactions
      FROM transactions
    `);

    const categoryResult = await pool.query(`
      SELECT
        COALESCE(category, 'UNCATEGORIZED') AS category,
        COUNT(*) AS count
      FROM transactions
      GROUP BY category
      ORDER BY count DESC
    `);

    const summary = result.rows[0];

    res.json({
      success: true,
      summary: {
        totalTransactions: Number(
          summary.total_transactions
        ),
        categorizedTransactions: Number(
          summary.categorized_transactions
        ),
        uncategorizedTransactions: Number(
          summary.uncategorized_transactions
        ),
        reviewRequired: Number(
          summary.review_required
        ),
        pnlTransactions: Number(
          summary.pnl_transactions
        ),
        nonPnlTransactions: Number(
          summary.non_pnl_transactions
        ),
      },
      categories: categoryResult.rows.map((row) => ({
        category: row.category,
        count: Number(row.count),
      })),
    });
  } catch (error) {
    console.error(
      "Review summary error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get review summary",
      error: error.message,
    });
  }
};

module.exports = {
  uploadTransactions,
  getTransactions,
  categorizeAllTransactions,
  getReviewSummary,
  getVariances,
  getReviewTransactions,
  updateTransactionCategory,
  getPnL,
  getMonthlyPnL,
  getVarianceDriversController,
};