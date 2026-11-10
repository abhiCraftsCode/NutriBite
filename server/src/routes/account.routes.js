import { Router } from "express";
import authenticate from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
  updateProfileSchema,
  changePasswordSchema,
} from "../validators/account.validator.js";

import {
  updateMyProfile,
  changeMyPassword,
} from "../controllers/account.controller.js";

const router = Router();

router.use(authenticate);

router.patch("/profile", validate(updateProfileSchema), updateMyProfile);

router.patch("/password", validate(changePasswordSchema), changeMyPassword);

export default router;
