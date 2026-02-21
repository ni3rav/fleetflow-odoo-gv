import { z } from "zod";

export const createVehicleSchema = z.object({
  licensePlate: z.string().min(1, "License plate is required").max(20),
  name: z.string().min(1, "Vehicle name is required").max(100),
  model: z.string().min(1, "Model is required").max(100),
  type: z.enum(["truck", "van", "bike"]),
  maxCapacityKg: z.number().int().positive("Capacity must be positive"),
  odometer: z.number().int().min(0).optional().default(0),
});

export const updateVehicleSchema = z.object({
  licensePlate: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(100).optional(),
  model: z.string().min(1).max(100).optional(),
  type: z.enum(["truck", "van", "bike"]).optional(),
  maxCapacityKg: z.number().int().positive().optional(),
  odometer: z.number().int().min(0).optional(),
  status: z.enum(["available", "retired"]).optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
