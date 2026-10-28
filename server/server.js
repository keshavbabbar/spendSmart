 import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import transactionRoutes from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.CLIENT_ORIGIN?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins?.length ? allowedOrigins : ["http://localhost:5173"],
  }),
);
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to SpendSmart API!",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "SpendSmart server is running!",
    database: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected",
  });
});

app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reports", reportRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "API endpoint not found." });
});

app.use((error, req, res, next) => {
  console.error("API request failed:", error.message);
  if (res.headersSent) return next(error);
  const isClientError = error.status === 400 ||
    error.name === "ValidationError" ||
    error.name === "CastError";
  const status = isClientError ? 400 : 500;
  res.status(status).json({
    success: false,
    message: status === 400
      ? error.message
      : "An unexpected server error occurred.",
  });
});

// Start the server only after MongoDB connects
const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from the .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`SpendSmart server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start SpendSmart:", error.message);
    process.exit(1);
  }
};

startServer();
