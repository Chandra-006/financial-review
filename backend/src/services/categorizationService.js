const CATEGORY = {
  REVENUE: "REVENUE",
  COGS: "COGS",
  PAYROLL: "PAYROLL",
  OPERATING_EXPENSE: "OPERATING_EXPENSE",
  NON_PNL: "NON_PNL",
  OTHER: "OTHER",
};

const categorizeTransaction = (transaction) => {
  const description = (
    transaction.description || ""
  ).toLowerCase();

  const counterparty = (
    transaction.counterparty || ""
  ).toLowerCase();

  const text = `${description} ${counterparty}`;
  // Matching both fields allows a transaction to be recognized from either
  // its description or the company/person involved in the transaction.

  // -------------------------
  // REVENUE
  // -------------------------

  if (
    text.includes("food sales") ||
    text.includes("beverage sales") ||
    text.includes("catering invoice") ||
    text.includes("delivery marketplace payout") ||
    text.includes("gift card sales")
  ) {
    return {
      category: CATEGORY.REVENUE,
      confidence: 0.99,
      reviewRequired: false,
      isPnl: true,
    };
  }

  // -------------------------
  // COGS
  // -------------------------

  if (
    text.includes("food inventory") ||
    text.includes("beverage inventory") ||
    text.includes("large catering event food purchase")
  ) {
    return {
      category: CATEGORY.COGS,
      confidence: 0.98,
      reviewRequired: false,
      isPnl: true,
    };
  }

  // -------------------------
  // PAYROLL
  // -------------------------

  if (
    text.includes("payroll") ||
    text.includes("wages") ||
    text.includes("manager salary")
  ) {
    return {
      category: CATEGORY.PAYROLL,
      confidence: 0.99,
      reviewRequired: false,
      isPnl: true,
    };
  }

  // -------------------------
  // NON-P&L
  // -------------------------

  if (
    text.includes("owner distribution") ||
    text.includes("loan principal repayment")
  ) {
    return {
      category: CATEGORY.NON_PNL,
      confidence: 0.97,
      reviewRequired: false,
      isPnl: false,
    };
  }

  // -------------------------
  // OPERATING EXPENSE
  // -------------------------

  if (
    text.includes("rent") ||
    text.includes("insurance") ||
    text.includes("accounting") ||
    text.includes("bookkeeping") ||
    text.includes("internet") ||
    text.includes("phone") ||
    text.includes("utilities") ||
    text.includes("cleaning") ||
    text.includes("linen") ||
    text.includes("marketing") ||
    text.includes("office") ||
    text.includes("administrative") ||
    text.includes("repair") ||
    text.includes("maintenance") ||
    text.includes("packaging") ||
    text.includes("disposables") ||
    text.includes("subscription") ||
    text.includes("license renewal") ||
    text.includes("sales tax")
  ) {
    return {
      category: CATEGORY.OPERATING_EXPENSE,
      confidence: 0.95,
      reviewRequired: false,
      isPnl: true,
    };
  }

  // -------------------------
  // OTHER / REVIEW
  // -------------------------

  // Unknown transactions are kept visible for manual review instead of being
  // silently assigned to a potentially incorrect financial category.
  return {
    category: CATEGORY.OTHER,
    confidence: 0.50,
    reviewRequired: true,
    isPnl: true,
  };
};

module.exports = {
  CATEGORY,
  categorizeTransaction,
};