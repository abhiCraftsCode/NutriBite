import { Router } from "express";
import * as controller from "../controllers/address.controller.js";
import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  addressSchema,
  updateAddressSchema,
} from "../validators/address.validator.js";

const router = Router();

router.use(authenticate, authorize("CUSTOMER"));

router.get("/", controller.getAddresses);
router.post("/", validate(addressSchema), controller.createAddress);
router.patch("/:id", validate(updateAddressSchema), controller.updateAddress);
router.delete("/:id", controller.deleteAddress);

export default router;
