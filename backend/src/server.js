const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/database");
const transactionRoutes = require("./routes/transactionRoutes");

// Create the Express application and expose the API routes used by the frontend.
const app = express();

const PORT = process.env.PORT || 5000;

// Enable CORS for browser-based API access and parse incoming JSON requests.
app.use(cors());
app.use(express.json());

// Route all transaction-related endpoints through the dedicated controller layer.
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FinZ Financial Review API is running",
  });
});

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

app.listen(PORT, () => {
  console.log(`FinZ backend running on http://localhost:${PORT}`);
});