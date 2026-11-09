import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

import { getDashboard } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", getDashboard);

export default router;
