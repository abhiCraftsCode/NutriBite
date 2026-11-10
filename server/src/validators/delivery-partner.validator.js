import { z } from "zod";

export const createDeliveryPartnerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  phone: z.string().trim().max(20).optional(),
});
