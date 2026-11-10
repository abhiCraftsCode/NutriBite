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
import inventoryRoutes from "./routes/inventory.routes.js";
import addressRoutes from "./routes/address.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminOrderRoutes from "./routes/admin-order.routes.js";
import deliveryPartnerRoutes from "./routes/delivery-partner.routes.js";
import adminDeliveryRoutes from "./routes/admin-delivery.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import adminReviewRoutes from "./routes/admin-review.routes.js";
import suggestionRoutes from "./routes/suggestion.routes.js";
import adminSuggestionRoutes from "./routes/admin-suggestion.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import accountRoutes from "./routes/account.routes.js";

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
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/admin/orders", adminOrderRoutes);
app.use("/api/v1/admin/delivery-partners", deliveryPartnerRoutes);
app.use("/api/v1/admin", adminDeliveryRoutes);
app.use("/api/v1/delivery", deliveryRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/admin/reviews", adminReviewRoutes);
app.use("/api/v1/suggestions", suggestionRoutes);
app.use("/api/v1/admin/suggestions", adminSuggestionRoutes);
app.use("/api/v1/admin/dashboard", dashboardRoutes);
app.use("/api/v1/account", accountRoutes);
app.get("/", (req, res) => {
  res.send("The server is running successfully.");
});

// Handle unknown routes
app.use(notFound);
// Centralized error handler (must be last)
app.use(errorHandler);

export default app;
