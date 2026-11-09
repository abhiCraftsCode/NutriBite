import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
  listMyDeliveries,
  getMyDelivery,
  changeDeliveryStatus,
} from "../controllers/delivery.controller.js";

import { updateDeliveryStatusSchema } from "../validators/delivery.validator.js";

const router = Router();

router.use(authenticate, authorize("DELIVERY_PARTNER"));

router.get("/", listMyDeliveries);

router.get("/:id", getMyDelivery);

router.patch(
  "/:id/status",
  validate(updateDeliveryStatusSchema),
  changeDeliveryStatus,
);

export default router;
