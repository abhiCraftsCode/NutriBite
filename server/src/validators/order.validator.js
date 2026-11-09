import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.number().int().positive(),
});
