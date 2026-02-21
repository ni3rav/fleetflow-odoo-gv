import { z } from "zod";

export const createTripSchema = z.object({
  vehicleId: z.string().uuid("Invalid vehicle ID"),
  driverId: z.string().uuid("Invalid driver ID"),
  cargoWeightKg: z.number().int().positive("Cargo weight must be positive"),
  originAddress: z.string().min(1, "Origin address is required").max(500),
  destination: z.string().min(1, "Destination is required").max(500),
  startOdometer: z.number().int().min(0, "Start odometer must be non-negative"),
  estimatedFuelCost: z.string().optional(),
});

export const updateTripStatusSchema = z.object({
  status: z.enum(["draft", "dispatched", "completed", "cancelled"]),
  endOdometer: z.number().int().min(0).optional(),
  actualFuelCost: z.string().optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripStatusInput = z.infer<typeof updateTripStatusSchema>;
