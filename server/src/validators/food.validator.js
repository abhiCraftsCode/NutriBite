import { z } from "zod";

export const foodSchema = z.object({
  categoryId: z.number().int().positive(),

  name: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).optional(),
  image: z.string().url().optional(),

  // Price in paise
  price: z.number().int().positive(),

  // Nutrition per serving
  servingSize: z.string().trim().max(100).optional(),
  calories: z.number().nonnegative().optional(),
  protein: z.number().nonnegative().optional(),
  carbohydrates: z.number().nonnegative().optional(),
  fat: z.number().nonnegative().optional(),

  notes: z.string().trim().max(1000).optional(),
  prepTimeMinutes: z.number().int().positive().optional(),

  isPublished: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
});

export const updateFoodSchema = foodSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const foodIngredientsSchema = z.object({
  ingredients: z
    .array(
      z.object({
        ingredientId: z.number().int().positive(),
        quantity: z.number().positive(),
      }),
    )
    .min(1)
    .refine(
      (items) =>
        new Set(items.map((item) => item.ingredientId)).size === items.length,
      { message: "Duplicate ingredients are not allowed" },
    ),
});
