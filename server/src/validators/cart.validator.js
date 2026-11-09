import { z } from "zod";

export const addCartItemSchema = z.object({
  foodId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(20).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(20),
});
