const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Route imports
const authRoutes = require("./routes/auth");
const applicationRoutes = require("./routes/applications");
const statsRoutes = require("./routes/stats");

const app = express();
const PORT = process.env.PORT || 5000;

console.log("authRoutes:", typeof authRoutes);
console.log("applicationRoutes:", typeof applicationRoutes);
console.log("statsRoutes:", typeof statsRoutes);

// ─── Middleware ───────────────────────────────────────────
// Set security HTTP headers
app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Routes ───────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/stats", statsRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "InternTrack Pro API is running",
    timestamp: new Date().toISOString(),
  });
});

const globalErrorHandler = require("./middleware/errorHandler");

// 404
app.use("*", (req, res, next) => {
  const AppError = require("./utils/AppError");
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handler
app.use(globalErrorHandler);

// ─── Database ─────────────────────────────────────────────
// ─── Database Connection ──────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI) // Remove the localhost fallback for production
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    // In production, you might not want to kill the server immediately 
    // so you can still see logs, but process.exit(1) is fine for now.
  });

// ─── Server Start (MOVE THIS OUTSIDE MONGODB BLOCK) ───────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});

module.exports = app;