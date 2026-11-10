import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string().trim().min(2).max(120),
  unit: z.string().trim().min(1).max(30),
  isActive: z.boolean().optional(),
});

export const updateIngredientSchema = ingredientSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
