import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { testConnection, query } from "./config/database.js";
import authRoutes from "./modules/auth/auth.routes.js";
import communityRoutes from "./modules/community/community.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import { errorHandler } from "./modules/auth/auth.controller.js";
import { apiLimiter } from "./middleware/rateLimiter.middleware.js";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Global Middleware 
app.use(helmet());                                       // Security headers

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // permissive in dev
    }
  },
  credentials: true,                                     // Allow cookies
}));
app.use(express.json({ limit: "10mb" }));                // JSON body parser
app.use(cookieParser());                                 // Parse cookies
app.use("/api", apiLimiter);                             // General rate limiting

// Routes 
app.use("/api/auth", authRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);

//  Health check
app.get("/api/health", async (_req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: dbConnected ? "healthy" : "degraded",
    database: dbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// ─── Quick test: list all cities ────────────────────────────────────
app.get("/api/cities", async (_req, res) => {
  try {
    const result = await query(
      "SELECT id, name, country, popularity_score FROM cities ORDER BY popularity_score DESC"
    );
    res.json({ count: result.rowCount, cities: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Global Error Handler (must be last) ────────────────────────────
app.use(errorHandler);

// ─── Start server ───────────────────────────────────────────────────
const start = async () => {
  const connected = await testConnection();
  if (!connected) {
    console.error("⚠️  Server starting without database connection.");
    console.error("    Check your .env file and PostgreSQL service.");
  }

  app.listen(PORT, () => {
    console.log(`Traveloop API running at http://localhost:${PORT}`);
    console.log(`Health:  http://localhost:${PORT}/api/health`);
    console.log(`Cities:  http://localhost:${PORT}/api/cities`);
    console.log(`Auth:    http://localhost:${PORT}/api/auth/*`);
    console.log(`Community: http://localhost:${PORT}/api/community`);
    console.log(`Admin:   http://localhost:${PORT}/api/admin/*`);
  });
};

start();

