import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true, maxlength: 80 },
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Budget must be greater than zero"],
    },
  },
  { timestamps: true },
);

budgetSchema.index({ category: 1, month: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);
