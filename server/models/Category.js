import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    key: { type: String, required: true, unique: true },
    type: { type: String, enum: ["income", "expense"], required: true },
  },
  { timestamps: true },
);

categorySchema.pre("validate", function setKey() {
  if (this.name && this.type) {
    this.key = `${this.type}:${this.name.trim().toLocaleLowerCase()}`;
  }
});

export default mongoose.model("Category", categorySchema);
