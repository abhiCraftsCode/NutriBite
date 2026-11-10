import { z } from "zod";

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    phone: z
      .string()
      .trim()
      .max(20)
      .transform((value) => value || null)
      .nullable()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8).max(128),
});
