import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(50).optional(),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/),
  landmark: z.string().trim().max(200).optional(),
});

export const updateAddressSchema = addressSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });
