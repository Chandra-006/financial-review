/**
 * PostgreSQL connection configuration.
 *
 * All database access in the app is centralized here so the rest of the code can
 * call a shared pool without repeating connection details in every service.
 */
const { Pool } = require("pg");

// Load the database settings from the backend .env file.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Log successful database connections for quick troubleshooting during startup.
pool.on("connect", () => {
  console.log("PostgreSQL database connected");
});

// Surface database-level issues without crashing the application process.
pool.on("error", (error) => {
  console.error("PostgreSQL error:", error);
});

module.exports = pool;