import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// ─── Connection Pool ────────────────────────────────────────────────
// Uses a connection pool (not single client) for production scalability.
// Pool automatically manages connections: reuses idle ones, creates new
// ones up to `max`, and queues requests beyond that.
// ─────────────────────────────────────────────────────────────────────

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "traveloop",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",

  // Pool tuning
  max: 20,                    // max concurrent connections
  idleTimeoutMillis: 30000,   // close idle connections after 30s
  connectionTimeoutMillis: 5000, // fail if can't connect in 5s
});

// Log pool errors (don't crash the server)
pool.on("error", (err) => {
  console.error("❌ Unexpected database pool error:", err.message);
});

// ─── Helper: run a query ────────────────────────────────────────────
export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

// ─── Helper: get a dedicated client (for transactions) ──────────────
export const getClient = () => {
  return pool.connect();
};

// ─── Test connection ────────────────────────────────────────────────
export const testConnection = async (): Promise<boolean> => {
  try {
    const result = await pool.query("SELECT NOW() AS server_time");
    console.log(
      "✅ Database connected successfully at:",
      result.rows[0].server_time
    );
    return true;
  } catch (err: any) {
    console.error("❌ Database connection failed:", err.message);
    return false;
  }
};

export default pool;
