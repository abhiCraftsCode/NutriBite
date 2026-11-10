import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

import {
  listCategories,
  addCategory,
  editCategory,
  removeCategory,
} from "../controllers/category.controller.js";

const router = Router();

router.get("/", listCategories);

router.post("/", authenticate, authorize("ADMIN"), addCategory);
router.patch("/:id", authenticate, authorize("ADMIN"), editCategory);
router.delete("/:id", authenticate, authorize("ADMIN"), removeCategory);

export default router;
