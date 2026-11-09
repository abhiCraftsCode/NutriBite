import { z } from "zod";

export const updateOrderStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "PREPARING", "READY_FOR_PICKUP"]),
  note: z.string().trim().max(500).optional(),
});
