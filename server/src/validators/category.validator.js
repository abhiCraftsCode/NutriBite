import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  image: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = categorySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
