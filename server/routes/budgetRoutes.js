import express from "express";
import mongoose from "mongoose";
import Budget from "../models/Budget.js";

const router = express.Router();
const isValidId = (id) => mongoose.isValidObjectId(id);
const isValidMonth = (month) => /^\d{4}-(0[1-9]|1[0-2])$/.test(month || "");

router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.month) filter.month = req.query.month;

    const budgets = await Budget.find(filter).sort({ month: -1, category: 1 });
    res.json({ success: true, count: budgets.length, data: budgets });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const { category, month, amount } = body;

  if (
    typeof category !== "string" ||
    !category.trim() ||
    category.trim().length > 80 ||
    !isValidMonth(month) ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Provide a category, valid YYYY-MM month, and budget amount greater than zero.",
    });
  }

  try {
    const budget = await Budget.create({
      category: category.trim(),
      month,
      amount: Number(amount),
    });
    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A budget for this category and month already exists.",
      });
    }
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid budget ID.",
    });
  }

  const body = req.body && typeof req.body === "object" ? req.body : {};
  const updates = {};

  if (body.category !== undefined) {
    updates.category = String(body.category).trim();
  }
  if (body.month !== undefined) updates.month = body.month;
  if (body.amount !== undefined) updates.amount = Number(body.amount);

  if (
    (updates.category !== undefined &&
      (!updates.category || updates.category.length > 80)) ||
    (updates.month !== undefined && !isValidMonth(updates.month)) ||
    (updates.amount !== undefined &&
      (!Number.isFinite(updates.amount) || updates.amount <= 0))
  ) {
    return res.status(400).json({
      success: false,
      message: "Budget category, month, or amount is invalid.",
    });
  }

  try {
    const budget = await Budget.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found.",
      });
    }

    res.json({ success: true, data: budget });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A budget for this category and month already exists.",
      });
    }
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid budget ID.",
    });
  }

  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found.",
      });
    }

    res.json({ success: true, message: "Budget deleted successfully." });
  } catch (error) {
    next(error);
  }
});

export default router;
