/**
 * FinZ Financial Review backend entry point.
 *
 * This is the backend brain of the project. It starts the Express server, loads
 * the environment configuration, and connects the frontend to the financial data
 * flow.
 *
 * Interviewer-friendly flow:
 * 1. Frontend sends a request to /api/transactions
 * 2. Routes forward the request to the controller
 * 3. Controller reads or updates PostgreSQL data
 * 4. Services calculate P&L, variance, and review summaries
 * 5. Frontend displays the results in the dashboard and analyst screens
 *
 * In simple terms: this server is where the app stores transactions, calculates
 * the financial metrics, and answers business questions from the dataset.
 */
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/database");
const transactionRoutes = require("./routes/transactionRoutes");

// Create the Express application and expose the API routes used by the frontend.
const app = express();

// Default port is 5000 unless the environment file overrides it.
const PORT = process.env.PORT || 5000;

// Enable CORS for browser-based API access and parse incoming JSON requests.
app.use(cors());
app.use(express.json());

// Route all transaction-related endpoints through the dedicated controller layer.
app.use("/api/transactions", transactionRoutes);

// Simple root endpoint used as a quick startup verification.
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FinZ Financial Review API is running",
  });
});

// Health check confirms the API is alive and the database is reachable.
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      service: "FinZ Backend",
      status: "healthy",
      database: "connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      success: false,
      service: "FinZ Backend",
      status: "unhealthy",
      database: "disconnected",
    });
  }
});

// Start listening for API requests once the application is fully configured.
app.listen(PORT, () => {
  console.log(`FinZ backend running on http://localhost:${PORT}`);
});