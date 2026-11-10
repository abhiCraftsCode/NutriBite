import { Router } from "express";
import * as controller from "../controllers/cart.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  addCartItemSchema,
  updateCartItemSchema,
} from "../validators/cart.validator.js";

const router = Router();

router.use(authenticate, authorize("CUSTOMER"));

router.get("/", controller.getCart);
router.post("/items", validate(addCartItemSchema), controller.addCartItem);
router.patch(
  "/items/:id",
  validate(updateCartItemSchema),
  controller.updateCartItem,
);
router.delete("/items/:id", controller.removeCartItem);
router.delete("/", controller.clearCart);

export default router;
