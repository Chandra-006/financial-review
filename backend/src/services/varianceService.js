const pool = require("../config/database");

const calculateVariances = async () => {
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
    const total = Number(row.total);

    if (!monthlyData[month]) {
      monthlyData[month] = {
        revenue: 0,
        cogs: 0,
        payroll: 0,
        operatingExpenses: 0,
      };
    }

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

  const months = Object.keys(monthlyData);

  const monthlyPnL = months.map((month) => {
    const data = monthlyData[month];

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
  });

  const variances = [];

  for (let i = 1; i < monthlyPnL.length; i++) {
    const previous = monthlyPnL[i - 1];
    const current = monthlyPnL[i];

    const metrics = [
      "revenue",
      "cogs",
      "grossProfit",
      "payroll",
      "operatingExpenses",
      "operatingProfit",
    ];

    metrics.forEach((metric) => {
      const previousValue = previous[metric];
      const currentValue = current[metric];

      const absoluteChange =
        currentValue - previousValue;

      const percentageChange =
        previousValue !== 0
          ? (absoluteChange / Math.abs(previousValue)) * 100
          : null;

      variances.push({
        fromMonth: previous.month,
        toMonth: current.month,
        metric,
        previousValue: Number(
          previousValue.toFixed(2)
        ),
        currentValue: Number(
          currentValue.toFixed(2)
        ),
        absoluteChange: Number(
          absoluteChange.toFixed(2)
        ),
        percentageChange:
          percentageChange === null
            ? null
            : Number(percentageChange.toFixed(2)),
      });
    });
  }

  return {
    monthlyPnL,
    variances,
  };
};

module.exports = {
  calculateVariances,
};