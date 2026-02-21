import { z } from "zod";

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  serviceType: z.string().min(1, "Service type is required").max(100),
  description: z.string().max(500).optional(),
  cost: z.string().regex(/^\d+(\.\d{1,2})?$/, "Cost must be a valid decimal"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

export const updateMaintenanceSchema = z.object({
  serviceType: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  cost: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(["in_progress", "completed"]).optional(),
});

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
