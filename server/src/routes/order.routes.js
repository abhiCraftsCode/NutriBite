import { Router } from "express";
import * as controller from "../controllers/order.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createOrderSchema } from "../validators/order.validator.js";

const router = Router();

router.use(authenticate, authorize("CUSTOMER"));

router.post("/", validate(createOrderSchema), controller.createOrder);
router.get("/", controller.getMyOrders);
router.get("/:id", controller.getMyOrderById);

export default router;
