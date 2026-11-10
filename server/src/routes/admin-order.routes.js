import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
  listOrders,
  getOrderDetails,
  changeOrderStatus,
} from "../controllers/admin-order.controller.js";

import { updateOrderStatusSchema } from "../validators/admin-order.validator.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", listOrders);

router.get("/:id", getOrderDetails);

router.patch(
  "/:id/status",
  validate(updateOrderStatusSchema),
  changeOrderStatus,
);

export default router;
