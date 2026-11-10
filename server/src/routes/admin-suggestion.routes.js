import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
  listAdminSuggestions,
  moderateSuggestion,
} from "../controllers/admin-suggestion.controller.js";

import { reviewSuggestionSchema } from "../validators/suggestion.validator.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", listAdminSuggestions);

router.patch(
  "/:id/status",
  validate(reviewSuggestionSchema),
  moderateSuggestion,
);

export default router;
