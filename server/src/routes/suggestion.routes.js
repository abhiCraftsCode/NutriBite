import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
  submitSuggestion,
  listMySuggestions,
  getMySuggestion,
} from "../controllers/suggestion.controller.js";

import { createSuggestionSchema } from "../validators/suggestion.validator.js";

const router = Router();

router.use(authenticate, authorize("CUSTOMER"));

router.post("/", validate(createSuggestionSchema), submitSuggestion);

router.get("/", listMySuggestions);

router.get("/:id", getMySuggestion);

export default router;
