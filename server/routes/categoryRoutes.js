import express from "express";
import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Category from "../models/Category.js";
import Transaction from "../models/Transaction.js";

const router = express.Router();
const validId = (id) => mongoose.isValidObjectId(id);
const allowedTypes = ["income", "expense"];

router.get("/", async (req, res, next) => {
  try {
    const filter = allowedTypes.includes(req.query.type)
      ? { type: req.query.type }
      : {};
    const categories = await Category.find(filter).sort({ type: 1, name: 1 });
    res.json({ success: true, count: categories.length, data: categories });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 80 || !allowedTypes.includes(body.type)) {
    return res.status(400).json({
      success: false,
      message:
        "Provide a category name (up to 80 characters) and a valid type.",
    });
  }

  try {
    const category = await Category.create({ name, type: body.type });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A category with this name and type already exists.",
      });
    }
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID.",
    });
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const updates = {};
  if (body.name !== undefined) updates.name = String(body.name).trim();
  if (body.type !== undefined) updates.type = body.type;
  if (
    (updates.name !== undefined &&
      (!updates.name || updates.name.length > 80)) ||
    (updates.type !== undefined && !allowedTypes.includes(updates.type))
  ) {
    return res.status(400).json({
      success: false,
      message: "Category name or type is invalid.",
    });
  }

  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }
    if (updates.name !== undefined || updates.type !== undefined) {
      const [transactionCount, budgetCount] = await Promise.all([
        Transaction.countDocuments({ category: category.name }),
        Budget.countDocuments({ category: category.name }),
      ]);
      if (transactionCount || budgetCount) {
        return res.status(409).json({
          success: false,
          message:
            "Move or remove this category’s linked records before changing it.",
        });
      }
    }
    if (updates.name !== undefined) category.name = updates.name;
    if (updates.type !== undefined) category.type = updates.type;
    await category.save();
    res.json({ success: true, data: category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A category with this name and type already exists.",
      });
    }
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  if (!validId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid category ID.",
    });
  }
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }
    const [transactionCount, budgetCount] = await Promise.all([
      Transaction.countDocuments({ category: category.name }),
      Budget.countDocuments({ category: category.name }),
    ]);
    if (transactionCount || budgetCount) {
      return res.status(409).json({
        success: false,
        message:
          "This category is in use by transactions or budgets and cannot be deleted.",
      });
    }
    await category.deleteOne();
    res.json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    next(error);
  }
});

export default router;
