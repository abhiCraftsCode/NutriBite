import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z
    .string()
    .trim()
    .email()
    .max(255)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  phone: z.string().trim().min(7).max(20).optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(255)
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
});
