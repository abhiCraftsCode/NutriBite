import { Router } from "express";

import authenticate from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
  createPartner,
  listPartners,
} from "../controllers/delivery-partner.controller.js";

import { createDeliveryPartnerSchema } from "../validators/delivery-partner.validator.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", listPartners);

router.post("/", validate(createDeliveryPartnerSchema), createPartner);

export default router;
