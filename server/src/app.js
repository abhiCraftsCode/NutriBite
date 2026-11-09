import express from "express";
import cors from "cors";
import helmet from "helmet";

import { config } from "./config/config.js";
import healthRoutes from "./routes/health.routes.js";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  }),
);

// Request body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/v1/health", healthRoutes);

// Handle unknown routes
app.use(notFound);

// Centralized error handler (must be last)
app.use(errorHandler);

export default app;
