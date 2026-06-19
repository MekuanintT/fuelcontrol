const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

(async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to PostgreSQL successfully");
    client.release();
  } catch (err) {
    console.error("Database connection failed:", err);
    // DO NOT crash the app on Railway
  }
})();

module.exports = pool;