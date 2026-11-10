import { z } from "zod";

export const assignDeliverySchema = z.object({
  partnerId: z.number().int().positive(),
});

export const updateDeliveryStatusSchema = z.object({
  status: z.enum(["ACCEPTED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"]),
  note: z.string().trim().max(500).optional(),
});
