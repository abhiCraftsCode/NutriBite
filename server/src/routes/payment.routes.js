import { Router } from "express";
import * as controller from "../controllers/payment.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
  createPaymentSchema,
  verifyPaymentSchema,
  failedPaymentSchema,
} from "../validators/payment.validator.js";

const router = Router();

router.use(authenticate, authorize("CUSTOMER"));

router.post(
  "/create-order",
  validate(createPaymentSchema),
  controller.createPaymentOrder,
);

router.post("/verify", validate(verifyPaymentSchema), controller.verifyPayment);

router.post(
  "/failed",
  validate(failedPaymentSchema),
  controller.markPaymentFailed,
);

export default router;
