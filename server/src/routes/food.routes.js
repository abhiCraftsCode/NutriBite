import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import optionalAuthenticate from "../middleware/optionalAuth.middleware.js";

import {
  listFoods,
  getFood,
  addFood,
  editFood,
  removeFood,
  updateFoodIngredients,
} from "../controllers/food.controller.js";

const router = Router();

// Public browsing; authenticated admins can see unpublished foods.
router.get("/", optionalAuthenticate, listFoods);
router.get("/:id", optionalAuthenticate, getFood);

// Admin operations
router.post("/", authenticate, authorize("ADMIN"), addFood);
router.patch("/:id", authenticate, authorize("ADMIN"), editFood);
router.delete("/:id", authenticate, authorize("ADMIN"), removeFood);

router.put(
  "/:id/ingredients",
  authenticate,
  authorize("ADMIN"),
  updateFoodIngredients,
);

export default router;
