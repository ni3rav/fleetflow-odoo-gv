import { z } from "zod";

export const createDriverSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  licenseNumber: z.string().min(1, "License number is required").max(50),
  licenseExpiry: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  safetyScore: z.number().int().min(0).max(100).optional().default(100),
  completionRate: z.number().int().min(0).max(100).optional().default(0),
});

export const updateDriverSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  licenseNumber: z.string().min(1).max(50).optional(),
  licenseExpiry: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  safetyScore: z.number().int().min(0).max(100).optional(),
  completionRate: z.number().int().min(0).max(100).optional(),
  complaints: z.number().int().min(0).optional(),
});

export const updateDriverStatusSchema = z.object({
  status: z.enum(["on_duty", "off_duty", "suspended"]),
});

export type CreateDriverInput = z.infer<typeof createDriverSchema>;
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>;
export type UpdateDriverStatusInput = z.infer<typeof updateDriverStatusSchema>;
