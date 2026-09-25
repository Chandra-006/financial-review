const pool = require("../config/database");

const getVarianceDrivers = async () => {
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

  for (let i = 1; i < months.length; i++) {
    const previousMonth = months[i - 1];
    const currentMonth = months[i];

    const previousTransactions =
      monthlyTransactions[previousMonth];

    const currentTransactions =
      monthlyTransactions[currentMonth];

    const categoryChanges = {};

    const categories = [
      "REVENUE",
      "COGS",
      "PAYROLL",
      "OPERATING_EXPENSE",
    ];

    categories.forEach((category) => {
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