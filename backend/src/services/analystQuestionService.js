const { getAnalystContext } = require("./analystService");
const { answerWithLLM } = require("./llmAnalystService");

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const answerQuestion = async (question) => {
  const context = await getAnalystContext();

  const q = question.toLowerCase().trim();

  // --------------------------------------------------
  // 1. OVERALL OPERATING PROFIT
  // --------------------------------------------------
  if (
    q.includes("operating profit") &&
    !q.includes("march") &&
    !q.includes("february") &&
    !q.includes("january")
  ) {
    return {
      answer: `The overall operating profit is ${formatCurrency(
        context.pnl.operatingProfit
      )}.`,
      evidence: {
        source: "P&L calculation",
        value: context.pnl.operatingProfit,
      },
    };
  }

  // --------------------------------------------------
  // 2. REVENUE
  // --------------------------------------------------
  if (
    q.includes("revenue") &&
    !q.includes("march") &&
    !q.includes("february") &&
    !q.includes("january")
  ) {
    return {
      answer: `The total revenue is ${formatCurrency(context.pnl.revenue)}.`,
      evidence: {
        source: "P&L calculation",
        value: context.pnl.revenue,
      },
    };
  }

  // --------------------------------------------------
  // 3. COGS
  // --------------------------------------------------
  if (
    q.includes("cogs") &&
    !q.includes("march") &&
    !q.includes("february") &&
    !q.includes("january")
  ) {
    return {
      answer: `The total cost of goods sold (COGS) is ${formatCurrency(
        context.pnl.cogs
      )}.`,
      evidence: {
        source: "P&L calculation",
        value: context.pnl.cogs,
      },
    };
  }

  // --------------------------------------------------
  // 4. GROSS PROFIT
  // --------------------------------------------------
  if (
    q.includes("gross profit") &&
    !q.includes("march") &&
    !q.includes("february") &&
    !q.includes("january")
  ) {
    return {
      answer: `The overall gross profit is ${formatCurrency(
        context.pnl.grossProfit
      )}.`,
      evidence: {
        source: "P&L calculation",
        value: context.pnl.grossProfit,
      },
    };
  }

  // --------------------------------------------------
  // 5. PAYROLL
  // --------------------------------------------------
  if (
    q.includes("payroll") &&
    !q.includes("march") &&
    !q.includes("february") &&
    !q.includes("january")
  ) {
    return {
      answer: `Total payroll expense is ${formatCurrency(
        context.pnl.payroll
      )}.`,
      evidence: {
        source: "P&L calculation",
        value: context.pnl.payroll,
      },
    };
  }

  // --------------------------------------------------
  // 6. OPERATING EXPENSES
  // --------------------------------------------------
  if (
    (q.includes("operating expenses") ||
      q.includes("operating expense")) &&
    !q.includes("march") &&
    !q.includes("february") &&
    !q.includes("january")
  ) {
    return {
      answer: `Total operating expenses are ${formatCurrency(
        context.pnl.operatingExpenses
      )}.`,
      evidence: {
        source: "P&L calculation",
        value: context.pnl.operatingExpenses,
      },
    };
  }

  // --------------------------------------------------
  // 6.5 OPERATING PROFIT VARIANCE EXPLANATION
  // --------------------------------------------------
  if (
    q.includes("why") &&
    q.includes("operating profit") &&
    q.includes("march")
  ) {
    const february = context.monthlyPnL.find(
      (item) => item.month === "2026-02"
    );

    const march = context.monthlyPnL.find(
      (item) => item.month === "2026-03"
    );

    if (!february || !march) {
      return {
        answer:
          "Monthly data required for the variance explanation is unavailable.",
        evidence: null,
      };
    }

    const revenueChange = march.revenue - february.revenue;
    const cogsChange = march.cogs - february.cogs;
    const payrollChange = march.payroll - february.payroll;
    const operatingExpenseChange =
      march.operatingExpenses - february.operatingExpenses;
    const operatingProfitChange =
      march.operatingProfit - february.operatingProfit;

    const direction = operatingProfitChange >= 0 ? "increased" : "decreased";

    const impacts = [
      { name: "revenue", change: revenueChange, profitImpact: revenueChange },
      { name: "COGS", change: cogsChange, profitImpact: -cogsChange },
      { name: "payroll", change: payrollChange, profitImpact: -payrollChange },
      {
        name: "operating expenses",
        change: operatingExpenseChange,
        profitImpact: -operatingExpenseChange,
      },
    ].sort((a, b) => Math.abs(b.profitImpact) - Math.abs(a.profitImpact));

    const mainDriver = impacts[0];
    const driverDirection =
      mainDriver.profitImpact >= 0
        ? "the main positive driver"
        : "the main negative driver";

    const answer =
      `Operating profit ${direction} by ${formatCurrency(
        Math.abs(operatingProfitChange)
      )} from February to March. ` +
      `Revenue ${
        revenueChange >= 0 ? "increased" : "decreased"
      } by ${formatCurrency(Math.abs(revenueChange))}, ` +
      `COGS ${
        cogsChange >= 0 ? "increased" : "decreased"
      } by ${formatCurrency(Math.abs(cogsChange))}, ` +
      `payroll ${
        payrollChange >= 0 ? "increased" : "decreased"
      } by ${formatCurrency(Math.abs(payrollChange))}, ` +
      `and operating expenses ${
        operatingExpenseChange >= 0 ? "increased" : "decreased"
      } by ${formatCurrency(Math.abs(operatingExpenseChange))}. ` +
      `The change in ${mainDriver.name} was ${driverDirection} of the movement in operating profit.`;

    return {
      answer,
      evidence: {
        source: "Monthly P&L variance - February to March 2026",
        periodFrom: "2026-02",
        periodTo: "2026-03",
        operatingProfit: {
          february: february.operatingProfit,
          march: march.operatingProfit,
          change: operatingProfitChange,
        },
        revenue: {
          february: february.revenue,
          march: march.revenue,
          change: revenueChange,
        },
        cogs: {
          february: february.cogs,
          march: march.cogs,
          change: cogsChange,
        },
        payroll: {
          february: february.payroll,
          march: march.payroll,
          change: payrollChange,
        },
        operatingExpenses: {
          february: february.operatingExpenses,
          march: march.operatingExpenses,
          change: operatingExpenseChange,
        },
      },
    };
  }

  // --------------------------------------------------
  // 7. MONTHLY P&L
  // --------------------------------------------------
  const months = {
    january: "2026-01",
    february: "2026-02",
    march: "2026-03",
  };

  for (const [monthName, monthCode] of Object.entries(months)) {
    if (q.includes(monthName)) {
      const monthData = context.monthlyPnL.find(
        (item) => item.month === monthCode
      );

      if (!monthData) {
        return {
          answer: `No P&L data was found for ${monthName}.`,
          evidence: null,
        };
      }

      if (q.includes("transactions") && monthCode === "2026-03") {
        const transactions = context.transactions
          .filter((transaction) => {
            const transactionDate = new Date(transaction.date);

            return (
              transactionDate.getUTCFullYear() === 2026 &&
              transactionDate.getUTCMonth() === 2
            );
          })
          .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
          .slice(0, 10);

        return {
          answer: `The largest P&L transactions in March 2026 are shown in the evidence below.`,
          evidence: {
            source: "March 2026 P&L transactions",
            month: "2026-03",
            transactions,
          },
        };
      }

      if (q.includes("operating profit")) {
        return {
          answer: `Operating profit in ${monthName} 2026 was ${formatCurrency(
            monthData.operatingProfit
          )}.`,
          evidence: {
            source: `Monthly P&L - ${monthCode}`,
            month: monthCode,
            value: monthData.operatingProfit,
          },
        };
      }

      if (q.includes("revenue")) {
        return {
          answer: `Revenue in ${monthName} 2026 was ${formatCurrency(
            monthData.revenue
          )}.`,
          evidence: {
            source: `Monthly P&L - ${monthCode}`,
            month: monthCode,
            value: monthData.revenue,
          },
        };
      }

      if (q.includes("gross profit")) {
        return {
          answer: `Gross profit in ${monthName} 2026 was ${formatCurrency(
            monthData.grossProfit
          )}.`,
          evidence: {
            source: `Monthly P&L - ${monthCode}`,
            month: monthCode,
            value: monthData.grossProfit,
          },
        };
      }

      if (q.includes("cogs")) {
        return {
          answer: `COGS in ${monthName} 2026 was ${formatCurrency(
            monthData.cogs
          )}.`,
          evidence: {
            source: `Monthly P&L - ${monthCode}`,
            month: monthCode,
            value: monthData.cogs,
          },
        };
      }

      return {
        answer: `${
          monthName.charAt(0).toUpperCase() + monthName.slice(1)
        } 2026 had revenue of ${formatCurrency(
          monthData.revenue
        )}, gross profit of ${formatCurrency(
          monthData.grossProfit
        )}, and operating profit of ${formatCurrency(
          monthData.operatingProfit
        )}.`,
        evidence: {
          source: `Monthly P&L - ${monthCode}`,
          month: monthCode,
          data: monthData,
        },
      };
    }
  }

  // --------------------------------------------------
  // 8. REVIEW TRANSACTIONS
  // --------------------------------------------------
  if (
    q.includes("review") ||
    q.includes("uncertain") ||
    q.includes("need attention")
  ) {
    const transactions = context.reviewTransactions;

    return {
      answer: `${transactions.length} transactions currently require review.`,
      evidence: {
        source: "Review transactions",
        count: transactions.length,
        transactions: transactions.slice(0, 10),
      },
    };
  }

  // --------------------------------------------------
  // 8.5 LARGEST TRANSACTIONS
  // --------------------------------------------------
  if (
    q.includes("largest transactions") ||
    q.includes("largest transaction") ||
    q.includes("biggest transactions") ||
    q.includes("biggest transaction")
  ) {
    const transactions = [...context.transactions]
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 10);

    return {
      answer: `The 10 largest P&L transactions by absolute amount are shown in the evidence below.`,
      evidence: {
        source: "P&L transactions",
        transactions,
      },
    };
  }

  // --------------------------------------------------
  // 9. LARGEST REVIEW TRANSACTIONS
  // --------------------------------------------------
  if (
    q.includes("largest") &&
    (q.includes("review") || q.includes("transaction"))
  ) {
    const transactions = [...context.reviewTransactions]
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .slice(0, 5);

    return {
      answer: `The largest review-required transactions are ${transactions
        .map(
          (transaction) =>
            `${transaction.transactionId} (${formatCurrency(
              Math.abs(transaction.amount)
            )})`
        )
        .join(", ")}.`,
      evidence: {
        source: "Review transactions",
        transactions,
      },
    };
  }

  // --------------------------------------------------
  // 10. CATEGORY INFORMATION
  // --------------------------------------------------
  const categoryNames = [
    "revenue",
    "cogs",
    "payroll",
    "operating expense",
    "operating expenses",
    "other",
    "non pnl",
  ];

  if (categoryNames.some((category) => q.includes(category))) {
    const category = context.categories.find((item) => {
      const normalized = item.category.toLowerCase().replace("_", " ");

      return q.includes(normalized);
    });

    if (category) {
      return {
        answer: `${category.category} contains ${
          category.transactionCount
        } transactions with a total amount of ${formatCurrency(
          Math.abs(category.totalAmount)
        )}.`,
        evidence: {
          source: "Category totals",
          category,
        },
      };
    }
  }

  // --------------------------------------------------
  // 11. FALL BACK TO LLM FOR ANYTHING THE RULES DON'T MATCH
  // --------------------------------------------------
  try {
    return await answerWithLLM(question, {
      pnl: context.pnl,
      monthlyPnL: context.monthlyPnL,
      categories: context.categories,
      reviewTransactionCount: context.reviewTransactions.length,
    });
  } catch (error) {
    console.error("LLM fallback error:", error);

    return {
      answer:
        "I could not answer that question from the available financial evidence. Try asking about revenue, COGS, gross profit, payroll, operating expenses, operating profit, monthly P&L, or transactions requiring review.",
      evidence: null,
    };
  }
};

module.exports = {
  answerQuestion,
};