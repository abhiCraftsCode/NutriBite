import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

import {
  listIngredients,
  addIngredient,
  editIngredient,
  removeIngredient,
} from "../controllers/ingredient.controller.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", listIngredients);
router.post("/", addIngredient);
router.patch("/:id", editIngredient);
router.delete("/:id", removeIngredient);

export default router;
