import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import optionalAuthenticate from "../middleware/optionalAuth.middleware.js";

import { viewRecipe, upsertRecipe } from "../controllers/recipe.controller.js";

const router = Router();

router.get("/:foodId", optionalAuthenticate, viewRecipe);

router.put("/:foodId", authenticate, authorize("ADMIN"), upsertRecipe);

export default router;
