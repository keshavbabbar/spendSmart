import express from "express";
import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

const router = express.Router();
const isValidId = (id) => mongoose.isValidObjectId(id);

function validatePayload(body = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Transaction details must be provided as an object.";
  }
  const { title, amount, type, category } = body;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    title.trim().length > 100
  ) {
    return "Title is required and must be at most 100 characters.";
  }

  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return "Amount must be greater than zero.";
  }

  if (!["income", "expense"].includes(type)) {
    return "Type must be income or expense.";
  }

  if (
    typeof category !== "string" ||
    !category.trim() ||
    category.trim().length > 80
  ) {
    return "Category is required and must be at most 80 characters.";
  }

  if (
    body.description !== undefined &&
    String(body.description).length > 500
  ) {
    return "Description must be at most 500 characters.";
  }

  if (
    body.date !== undefined &&
    Number.isNaN(new Date(body.date).getTime())
  ) {
    return "Date is invalid.";
  }

  return null;
}

router.get("/", async (req, res, next) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1, _id: -1 });
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const invalid = validatePayload(req.body);
  if (invalid) {
    return res.status(400).json({ success: false, message: invalid });
  }

  try {
    const transaction = await Transaction.create({
      ...req.body,
      title: req.body.title.trim(),
      category: req.body.category.trim(),
      amount: Number(req.body.amount),
    });
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid transaction ID.",
    });
  }

  const invalid = validatePayload(req.body);
  if (invalid) {
    return res.status(400).json({ success: false, message: invalid });
  }

  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        title: req.body.title.trim(),
        category: req.body.category.trim(),
        amount: Number(req.body.amount),
      },
      { new: true, runValidators: true },
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  if (!isValidId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid transaction ID.",
    });
  }

  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    res.json({ success: true, message: "Transaction deleted successfully." });
  } catch (error) {
    next(error);
  }
});

export default router;
