const pool = require("../config/database");

const calculatePnL = async () => {
  const result = await pool.query(`
    SELECT
      category,
      COALESCE(SUM(amount), 0) AS total
    FROM transactions
    WHERE is_pnl = TRUE
    GROUP BY category
    ORDER BY category
  `);

    // Fetch one total per P&L category so the summary can be calculated in code.
  const totals = {
    REVENUE: 0,
    COGS: 0,
    PAYROLL: 0,
    OPERATING_EXPENSE: 0,
  };

  result.rows.forEach((row) => {
    const category = row.category;

    if (Object.prototype.hasOwnProperty.call(totals, category)) {
      totals[category] = Number(row.total);
    }
  });

  const revenue = totals.REVENUE;
  const cogs = Math.abs(totals.COGS);
  const payroll = Math.abs(totals.PAYROLL);
  const operatingExpenses = Math.abs(totals.OPERATING_EXPENSE);

  const grossProfit = revenue - cogs;

  const operatingProfit =
    grossProfit - payroll - operatingExpenses;

  return {
    revenue: Number(revenue.toFixed(2)),
    cogs: Number(cogs.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    payroll: Number(payroll.toFixed(2)),
    operatingExpenses: Number(operatingExpenses.toFixed(2)),
    operatingProfit: Number(operatingProfit.toFixed(2)),
  };
};


// Monthly P&L
const calculateMonthlyPnL = async () => {
  const result = await pool.query(`
    SELECT
      TO_CHAR(transaction_date, 'YYYY-MM') AS month,
      category,
      COALESCE(SUM(amount), 0) AS total
    FROM transactions
    WHERE is_pnl = TRUE
    GROUP BY
      TO_CHAR(transaction_date, 'YYYY-MM'),
      category
    ORDER BY month;
  `);

  const monthlyData = {};

  result.rows.forEach((row) => {
    const month = row.month;

    if (!monthlyData[month]) {
      monthlyData[month] = {
        revenue: 0,
        cogs: 0,
        payroll: 0,
        operatingExpenses: 0,
      };
    }

    const total = Number(row.total);

      // Keep revenue positive and represent expense categories as positive costs.
    switch (row.category) {
      case "REVENUE":
        monthlyData[month].revenue += total;
        break;

      case "COGS":
        monthlyData[month].cogs += Math.abs(total);
        break;

      case "PAYROLL":
        monthlyData[month].payroll += Math.abs(total);
        break;

      case "OPERATING_EXPENSE":
        monthlyData[month].operatingExpenses += Math.abs(total);
        break;

      default:
        break;
    }
  });

  return Object.entries(monthlyData).map(
    ([month, data]) => {
        // Derive monthly profitability from the normalized category totals.
      const grossProfit =
        data.revenue - data.cogs;

      const operatingProfit =
        grossProfit -
        data.payroll -
        data.operatingExpenses;

      return {
        month,
        revenue: Number(data.revenue.toFixed(2)),
        cogs: Number(data.cogs.toFixed(2)),
        grossProfit: Number(grossProfit.toFixed(2)),
        payroll: Number(data.payroll.toFixed(2)),
        operatingExpenses: Number(
          data.operatingExpenses.toFixed(2)
        ),
        operatingProfit: Number(
          operatingProfit.toFixed(2)
        ),
      };
    }
  );
};


module.exports = {
  calculatePnL,
  calculateMonthlyPnL,
};