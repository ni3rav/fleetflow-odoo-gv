import { z } from "zod";

export const createExpenseSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  tripId: z.string().optional().nullable(),
  fuelLiters: z.string().optional().nullable(),
  fuelCost: z.string().optional().nullable(),
  miscExpense: z.string().optional().nullable(),
  miscDescription: z.string().max(500).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
});

export const updateExpenseSchema = z.object({
  tripId: z.string().optional().nullable(),
  fuelLiters: z.string().optional().nullable(),
  fuelCost: z.string().optional().nullable(),
  miscExpense: z.string().optional().nullable(),
  miscDescription: z.string().max(500).optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
