const pool = require("../config/database");

const getVarianceDrivers = async () => {
  // Only P&L transactions can explain changes in monthly financial results.
  const result = await pool.query(`
    SELECT
      TO_CHAR(transaction_date, 'YYYY-MM') AS month,
      category,
      transaction_id,
      transaction_date,
      description,
      counterparty,
      amount
    FROM transactions
    WHERE is_pnl = TRUE
    ORDER BY transaction_date ASC, id ASC;
  `);

  const monthlyTransactions = {};

  // Build a month-indexed collection so each month can be compared as a unit.
  result.rows.forEach((transaction) => {
    const month = transaction.month;

    if (!monthlyTransactions[month]) {
      monthlyTransactions[month] = [];
    }

    monthlyTransactions[month].push({
      transactionId: transaction.transaction_id,
      date: transaction.transaction_date,
      category: transaction.category,
      description: transaction.description,
      counterparty: transaction.counterparty,
      amount: Number(transaction.amount),
    });
  });

  const months = Object.keys(monthlyTransactions).sort();

  const drivers = [];

  // Compare each month with the immediately preceding month.
  for (let i = 1; i < months.length; i++) {
    const previousMonth = months[i - 1];
    const currentMonth = months[i];

    const previousTransactions =
      monthlyTransactions[previousMonth];

    const currentTransactions =
      monthlyTransactions[currentMonth];

    const categoryChanges = {};

    // These categories match the financial measures shown in the variance view.
    const categories = [
      "REVENUE",
      "COGS",
      "PAYROLL",
      "OPERATING_EXPENSE",
    ];

    categories.forEach((category) => {
      // Summing the absolute values keeps expense changes readable as costs,
      // even when expenses are stored as negative ledger amounts.
      const previousTotal = previousTransactions
        .filter((transaction) => transaction.category === category)
        .reduce(
          (sum, transaction) =>
            sum + Number(transaction.amount),
          0
        );

      const currentTotal = currentTransactions
        .filter((transaction) => transaction.category === category)
        .reduce(
          (sum, transaction) =>
            sum + Number(transaction.amount),
          0
        );

      categoryChanges[category] = {
        previousTotal: Number(previousTotal.toFixed(2)),
        currentTotal: Number(currentTotal.toFixed(2)),
        change: Number(
          (currentTotal - previousTotal).toFixed(2)
        ),
      };
    });

    const transactionMovements = [
      ...currentTransactions.map((transaction) => ({
        ...transaction,
        signedAmount: Number(transaction.amount),
      })),
    ];

    // Large transactions are the most useful starting points when explaining
    // why a month changed, so rank them by magnitude and keep the top ten.
    transactionMovements.sort(
      (a, b) =>
        Math.abs(b.signedAmount) -
        Math.abs(a.signedAmount)
    );

    drivers.push({
      fromMonth: previousMonth,
      toMonth: currentMonth,
      categoryChanges,
      topTransactions: transactionMovements.slice(0, 10),
    });
  }

  return drivers;
};

module.exports = {
  getVarianceDrivers,
};