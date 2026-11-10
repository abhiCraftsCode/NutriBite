import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
  listAdminReviews,
  changeReviewStatus,
} from "../controllers/admin-review.controller.js";

import { moderateReviewSchema } from "../validators/review.validator.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", listAdminReviews);

router.patch("/:id/status", validate(moderateReviewSchema), changeReviewStatus);

export default router;
