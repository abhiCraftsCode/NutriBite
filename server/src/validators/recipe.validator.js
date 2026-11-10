import { z } from "zod";

export const recipeSchema = z.object({
  instructions: z.string().trim().min(10).max(10000),
  prepTimeMinutes: z.number().int().nonnegative().optional(),
  cookTimeMinutes: z.number().int().nonnegative().optional(),
});
