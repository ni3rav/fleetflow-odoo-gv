import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { expense } from "@/db/schema/expense";
import { vehicle } from "@/db/schema/vehicle";
import { trip } from "@/db/schema/trip";
import { AppError } from "@/lib/errors";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
} from "@/validations/expense";

export async function listExpenses(filters?: {
  vehicleId?: string;
  tripId?: string;
}) {
  const conditions = [];
  if (filters?.vehicleId) {
    conditions.push(eq(expense.vehicleId, filters.vehicleId));
  }
  if (filters?.tripId) {
    conditions.push(eq(expense.tripId, filters.tripId));
  }
  return db
    .select()
    .from(expense)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
}

export async function getExpenseById(id: string) {
  const [found] = await db.select().from(expense).where(eq(expense.id, id));
  if (!found) throw new AppError(404, "Expense not found");
  return found;
}

export async function createExpense(data: CreateExpenseInput) {
  const [v] = await db.select({ id: vehicle.id }).from(vehicle).where(eq(vehicle.id, data.vehicleId));
  if (!v) throw new AppError(404, "Vehicle not found");

  if (data.tripId) {
    const [t] = await db.select({ id: trip.id }).from(trip).where(eq(trip.id, data.tripId));
    if (!t) throw new AppError(404, "Trip not found");
  }

  const [created] = await db
    .insert(expense)
    .values({
      id: crypto.randomUUID(),
      vehicleId: data.vehicleId,
      tripId: data.tripId ?? null,
      fuelLiters: data.fuelLiters ?? null,
      fuelCost: data.fuelCost ?? null,
      miscExpense: data.miscExpense ?? null,
      miscDescription: data.miscDescription ?? null,
      date: data.date,
    })
    .returning();

  return created!;
}

export async function updateExpense(id: string, data: UpdateExpenseInput) {
  await getExpenseById(id);

  const [updated] = await db
    .update(expense)
    .set({
      ...(data.tripId !== undefined && { tripId: data.tripId }),
      ...(data.fuelLiters !== undefined && { fuelLiters: data.fuelLiters }),
      ...(data.fuelCost !== undefined && { fuelCost: data.fuelCost }),
      ...(data.miscExpense !== undefined && { miscExpense: data.miscExpense }),
      ...(data.miscDescription !== undefined && {
        miscDescription: data.miscDescription,
      }),
      ...(data.date !== undefined && { date: data.date }),
      updatedAt: new Date(),
    })
    .where(eq(expense.id, id))
    .returning();

  return updated!;
}

export async function deleteExpense(id: string) {
  const [deleted] = await db
    .delete(expense)
    .where(eq(expense.id, id))
    .returning();
  if (!deleted) throw new AppError(404, "Expense not found");
  return deleted;
}
