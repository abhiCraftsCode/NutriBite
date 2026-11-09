import express from "express";
import cors from "cors";
import helmet from "helmet";

import { config } from "./config/config.js";
import notFound from "./middleware/notFound.middleware.js";
import errorHandler from "./middleware/error.middleware.js";

import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import foodRoutes from "./routes/food.routes.js";
import ingredientRoutes from "./routes/ingredient.routes.js";
import recipeRoutes from "./routes/recipe.routes.js";

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
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/foods", foodRoutes);
app.use("/api/v1/ingredients", ingredientRoutes);
app.use("/api/v1/recipes", recipeRoutes);

// Handle unknown routes
app.use(notFound);
// Centralized error handler (must be last)
app.use(errorHandler);

export default app;
