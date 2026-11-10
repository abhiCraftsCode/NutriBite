import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
  submitReview,
  listFoodReviews,
  listMyReviews,
} from "../controllers/review.controller.js";

import { createReviewSchema } from "../validators/review.validator.js";

const router = Router();

// Public: only approved reviews are returned.
router.get("/food/:foodId", listFoodReviews);

// Customer-only routes.
router.post(
  "/",
  authenticate,
  authorize("CUSTOMER"),
  validate(createReviewSchema),
  submitReview,
);

router.get("/my", authenticate, authorize("CUSTOMER"), listMyReviews);

export default router;
