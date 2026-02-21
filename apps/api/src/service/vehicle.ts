import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { vehicle } from "@/db/schema/vehicle";
import { trip } from "@/db/schema/trip";
import { AppError } from "@/lib/errors";
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
} from "@/validations/vehicle";

export async function listVehicles(filters?: {
  status?: string;
  type?: string;
}) {
  const conditions = [];

  if (filters?.status) {
    conditions.push(
      eq(
        vehicle.status,
        filters.status as (typeof vehicle.status.enumValues)[number],
      ),
    );
  }
  if (filters?.type) {
    conditions.push(
      eq(
        vehicle.type,
        filters.type as (typeof vehicle.type.enumValues)[number],
      ),
    );
  }

  return db
    .select()
    .from(vehicle)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
}

export async function getVehicleById(id: string) {
  const [found] = await db.select().from(vehicle).where(eq(vehicle.id, id));

  if (!found) throw new AppError(404, "Vehicle not found");
  return found;
}

export async function getAvailableVehicles() {
  return db.select().from(vehicle).where(eq(vehicle.status, "available"));
}

export async function createVehicle(data: CreateVehicleInput) {
  const [created] = await db
    .insert(vehicle)
    .values({
      id: crypto.randomUUID(),
      licensePlate: data.licensePlate,
      name: data.name,
      model: data.model,
      type: data.type,
      maxCapacityKg: data.maxCapacityKg,
      odometer: data.odometer ?? 0,
      status: "available",
    })
    .returning();

  return created;
}

export async function updateVehicle(id: string, data: UpdateVehicleInput) {
  await getVehicleById(id);

  const [updated] = await db
    .update(vehicle)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(vehicle.id, id))
    .returning();

  return updated;
}

export async function deleteVehicle(id: string) {
  return db.transaction(async (tx) => {
    const activeTrips = await tx
      .select({ id: trip.id })
      .from(trip)
      .where(
        and(
          eq(trip.vehicleId, id),
          inArray(trip.status, ["draft", "dispatched"]),
        ),
      );

    if (activeTrips.length > 0) {
      throw new AppError(
        409,
        `Cannot delete vehicle: ${activeTrips.length} active trip(s) exist`,
      );
    }

    const [deleted] = await tx
      .delete(vehicle)
      .where(eq(vehicle.id, id))
      .returning();

    if (!deleted) throw new AppError(404, "Vehicle not found");
    return deleted;
  });
}
