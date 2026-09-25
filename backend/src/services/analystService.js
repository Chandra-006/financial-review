const pool = require("../config/database");

const getTransactionEvidence = async () => {
  const result = await pool.query(`
    SELECT
      transaction_id,
      transaction_date,
      description,
      counterparty,
      amount,
      category
    FROM transactions
    WHERE is_pnl = TRUE
    ORDER BY transaction_date DESC, ABS(amount) DESC
  `);

  return result.rows.map((row) => ({
    transactionId: row.transaction_id,
    date: row.transaction_date,
    description: row.description,
    counterparty: row.counterparty,
    amount: Number(row.amount),
    category: row.category,
  }));
};
const getAnalystContext = async () => {
  // 1. Overall P&L
  const pnlResult = await pool.query(`
    SELECT
      category,
      COALESCE(SUM(amount), 0) AS total
    FROM transactions
    WHERE is_pnl = TRUE
    GROUP BY category
    ORDER BY category
  `);

  const pnl = {
    revenue: 0,
    cogs: 0,
    payroll: 0,
    operatingExpenses: 0,
  };

  pnlResult.rows.forEach((row) => {
    const total = Number(row.total);

    switch (row.category) {
      case "REVENUE":
        pnl.revenue += total;
        break;

      case "COGS":
        pnl.cogs += Math.abs(total);
        break;

      case "PAYROLL":
        pnl.payroll += Math.abs(total);
        break;

      case "OPERATING_EXPENSE":
        pnl.operatingExpenses += Math.abs(total);
        break;

      default:
        break;
    }
  });

  pnl.grossProfit =
    pnl.revenue - pnl.cogs;

  pnl.operatingProfit =
    pnl.grossProfit -
    pnl.payroll -
    pnl.operatingExpenses;

  // 2. Monthly P&L
  const monthlyResult = await pool.query(`
    SELECT
      TO_CHAR(transaction_date, 'YYYY-MM') AS month,
      category,
      COALESCE(SUM(amount), 0) AS total
    FROM transactions
    WHERE is_pnl = TRUE
    GROUP BY
      TO_CHAR(transaction_date, 'YYYY-MM'),
      category
    ORDER BY month
  `);

  const monthlyMap = {};

  monthlyResult.rows.forEach((row) => {
    const month = row.month;
    const total = Number(row.total);

    if (!monthlyMap[month]) {
      monthlyMap[month] = {
        revenue: 0,
        cogs: 0,
        payroll: 0,
        operatingExpenses: 0,
      };
    }

    switch (row.category) {
      case "REVENUE":
        monthlyMap[month].revenue += total;
        break;

      case "COGS":
        monthlyMap[month].cogs += Math.abs(total);
        break;

      case "PAYROLL":
        monthlyMap[month].payroll += Math.abs(total);
        break;

      case "OPERATING_EXPENSE":
        monthlyMap[month].operatingExpenses +=
          Math.abs(total);
        break;

      default:
        break;
    }
  });

  const monthlyPnL = Object.entries(
    monthlyMap
  ).map(([month, data]) => {
    const grossProfit =
      data.revenue - data.cogs;

    const operatingProfit =
      grossProfit -
      data.payroll -
      data.operatingExpenses;

    return {
      month,
      revenue: Number(
        data.revenue.toFixed(2)
      ),
      cogs: Number(
        data.cogs.toFixed(2)
      ),
      grossProfit: Number(
        grossProfit.toFixed(2)
      ),
      payroll: Number(
        data.payroll.toFixed(2)
      ),
      operatingExpenses: Number(
        data.operatingExpenses.toFixed(2)
      ),
      operatingProfit: Number(
        operatingProfit.toFixed(2)
      ),
    };
  });

  // 3. Review items
  const reviewResult = await pool.query(`
    SELECT
      transaction_id,
      transaction_date,
      description,
      counterparty,
      amount,
      category,
      confidence,
      is_review_required
    FROM transactions
    WHERE is_review_required = TRUE
    ORDER BY transaction_date DESC
  `);

  // 4. Category totals
  const categoryResult = await pool.query(`
    SELECT
      COALESCE(category, 'UNCATEGORIZED') AS category,
      COUNT(*) AS transaction_count,
      COALESCE(SUM(amount), 0) AS total_amount
    FROM transactions
    GROUP BY category
    ORDER BY transaction_count DESC
  `);

  return {
    pnl: {
      revenue: Number(pnl.revenue.toFixed(2)),
      cogs: Number(pnl.cogs.toFixed(2)),
      grossProfit: Number(
        pnl.grossProfit.toFixed(2)
      ),
      payroll: Number(
        pnl.payroll.toFixed(2)
      ),
      operatingExpenses: Number(
        pnl.operatingExpenses.toFixed(2)
      ),
      operatingProfit: Number(
        pnl.operatingProfit.toFixed(2)
      ),
    },

    monthlyPnL,

    reviewTransactions:
      reviewResult.rows.map((transaction) => ({
        transactionId:
          transaction.transaction_id,
        date: transaction.transaction_date,
        description:
          transaction.description,
        counterparty:
          transaction.counterparty,
        amount: Number(transaction.amount),
        category: transaction.category,
        confidence: Number(
          transaction.confidence
        ),
      })),

        categories:
      categoryResult.rows.map((row) => ({
        category: row.category,
        transactionCount: Number(
          row.transaction_count
        ),
        totalAmount: Number(
          row.total_amount
        ),
      })),

    transactions: await getTransactionEvidence(),
  };
};

module.exports = {
  getAnalystContext,
};