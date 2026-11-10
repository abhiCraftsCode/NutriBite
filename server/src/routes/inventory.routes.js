import { Router } from "express";
import {
  listInventory,
  listIngredientMovements,
  createStockMovement,
} from "../controllers/inventory.controller.js";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", listInventory);
router.get("/:id/movements", listIngredientMovements);
router.post("/:id/movements", createStockMovement);

export default router;
