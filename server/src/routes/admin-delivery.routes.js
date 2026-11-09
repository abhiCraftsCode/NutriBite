import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import { assignOrderDelivery } from "../controllers/delivery.controller.js";

import { assignDeliverySchema } from "../validators/delivery.validator.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.patch(
  "/orders/:orderId/delivery",
  validate(assignDeliverySchema),
  assignOrderDelivery,
);

export default router;
