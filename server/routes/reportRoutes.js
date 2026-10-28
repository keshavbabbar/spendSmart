import express from "express";
import Transaction from "../models/Transaction.js";

const router = express.Router();
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function monthBounds(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  return {
    start: new Date(Date.UTC(year, monthNumber - 1, 1)),
    end: new Date(Date.UTC(year, monthNumber, 1)),
  };
}

function previousMonth(month) {
  const [year, monthNumber] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 2, 1));
  return `${date.getUTCFullYear()}-${
    String(date.getUTCMonth() + 1).padStart(2, "0")
  }`;
}

async function getTotals(month) {
  const { start, end } = monthBounds(month);
  const rows = await Transaction.aggregate([
    { $match: { date: { $gte: start, $lt: end } } },
    {
      $group: {
        _id: "$type",
        amount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);
  const totals = { income: 0, expenses: 0, count: 0 };
  rows.forEach((row) => {
    totals[row._id === "income" ? "income" : "expenses"] = row.amount;
    totals.count += row.count;
  });
  return { ...totals, net: totals.income - totals.expenses };
}

router.get("/monthly", async (req, res, next) => {
  const month = req.query.month;
  if (!MONTH_PATTERN.test(month || "")) {
    return res.status(400).json({
      success: false,
      message: "Provide a valid month in YYYY-MM format.",
    });
  }

  try {
    const { start, end } = monthBounds(month);
    const trendStart = new Date(start);
    trendStart.setUTCMonth(trendStart.getUTCMonth() - 5);
    const [totals, previousTotals, categories, trend] = await Promise.all([
      getTotals(month),
      getTotals(previousMonth(month)),
      Transaction.aggregate([
        {
          $match: {
            type: "expense",
            date: { $gte: start, $lt: end },
          },
        },
        {
          $group: {
            _id: "$category",
            amount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { amount: -1 } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            type: "expense",
            date: { $gte: trendStart, $lt: end },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
            expenses: { $sum: "$amount" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);
    const trendByMonth = new Map(
      trend.map((row) => [row._id, row.expenses]),
    );
    const completeTrend = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(trendStart);
      date.setUTCMonth(date.getUTCMonth() + index);
      const key = `${date.getUTCFullYear()}-${
        String(date.getUTCMonth() + 1).padStart(2, "0")
      }`;
      return { month: key, expenses: trendByMonth.get(key) || 0 };
    });

    res.json({
      success: true,
      data: {
        month,
        previousMonth: previousMonth(month),
        totals,
        previousTotals,
        categories: categories.map((row) => ({
          name: row._id || "Other",
          amount: row.amount,
          count: row.count,
        })),
        trend: completeTrend,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
