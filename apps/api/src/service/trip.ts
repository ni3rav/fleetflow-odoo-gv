import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { trip } from "@/db/schema/trip";
import { vehicle } from "@/db/schema/vehicle";
import { driver } from "@/db/schema/driver";
import { AppError } from "@/lib/errors";
import type { CreateTripInput, UpdateTripStatusInput } from "@/validations/trip";

const TRIP_STATUS = ["draft", "dispatched", "completed", "cancelled"] as const;
type TripStatus = (typeof TRIP_STATUS)[number];

export async function listTrips(filters?: {
  status?: string;
  vehicleId?: string;
  driverId?: string;
}) {
  const conditions = [];
  if (filters?.status) {
    conditions.push(
      eq(
        trip.status,
        filters.status as (typeof trip.status.enumValues)[number],
      ),
    );
  }
  if (filters?.vehicleId) conditions.push(eq(trip.vehicleId, filters.vehicleId));
  if (filters?.driverId) conditions.push(eq(trip.driverId, filters.driverId));

  return db
    .select()
    .from(trip)
    .where(conditions.length > 0 ? and(...conditions) : undefined);
}

export async function getTripById(id: string) {
  const [found] = await db.select().from(trip).where(eq(trip.id, id));
  if (!found) throw new AppError(404, "Trip not found");
  return found;
}

export async function createTrip(data: CreateTripInput) {
  return db.transaction(async (tx) => {
    const [v] = await tx.select().from(vehicle).where(eq(vehicle.id, data.vehicleId));
    if (!v) throw new AppError(404, "Vehicle not found");
    if (v.status !== "available") {
      throw new AppError(409, "Vehicle is not available for assignment");
    }

    const [d] = await tx.select().from(driver).where(eq(driver.id, data.driverId));
    if (!d) throw new AppError(404, "Driver not found");
    if (d.status !== "on_duty") {
      throw new AppError(409, "Driver is not on duty");
    }
    const today = new Date().toISOString().split("T")[0]!;
    if (d.licenseExpiry <= today) {
      throw new AppError(409, "Driver license has expired");
    }

    if (data.cargoWeightKg > v.maxCapacityKg) {
      throw new AppError(
        400,
        `Cargo weight (${data.cargoWeightKg} kg) exceeds vehicle max capacity (${v.maxCapacityKg} kg)`,
      );
    }

    const [created] = await tx
      .insert(trip)
      .values({
        id: crypto.randomUUID(),
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        cargoWeightKg: data.cargoWeightKg,
        originAddress: data.originAddress,
        destination: data.destination,
        startOdometer: data.startOdometer,
        estimatedFuelCost: data.estimatedFuelCost ?? null,
        status: "draft",
      })
      .returning();

    return created!;
  });
}

export async function updateTripStatus(id: string, data: UpdateTripStatusInput) {
  return db.transaction(async (tx) => {
    const [current] = await tx.select().from(trip).where(eq(trip.id, id));
    if (!current) throw new AppError(404, "Trip not found");

    const fromStatus = current.status as TripStatus;
    const toStatus = data.status as TripStatus;

    const allowed: Record<TripStatus, TripStatus[]> = {
      draft: ["dispatched", "completed", "cancelled"],
      dispatched: ["completed", "cancelled"],
      completed: [],
      cancelled: [],
    };
    if (!allowed[fromStatus]?.includes(toStatus)) {
      throw new AppError(
        400,
        `Cannot transition trip from ${fromStatus} to ${toStatus}`,
      );
    }

    if (toStatus === "completed") {
      if (data.endOdometer === undefined) {
        throw new AppError(400, "endOdometer is required when completing a trip");
      }
    }

    if (toStatus === "dispatched") {
      await tx
        .update(vehicle)
        .set({ status: "on_trip", updatedAt: new Date() })
        .where(eq(vehicle.id, current.vehicleId));
    }

    if (toStatus === "completed" || toStatus === "cancelled") {
      await tx
        .update(vehicle)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(vehicle.id, current.vehicleId));
    }

    const updatePayload: {
      status: TripStatus;
      endOdometer?: number;
      actualFuelCost?: string | null;
      updatedAt: Date;
    } = {
      status: toStatus,
      updatedAt: new Date(),
    };
    if (data.endOdometer !== undefined) updatePayload.endOdometer = data.endOdometer;
    if (data.actualFuelCost !== undefined) updatePayload.actualFuelCost = data.actualFuelCost ?? null;

    const [updated] = await tx
      .update(trip)
      .set(updatePayload)
      .where(eq(trip.id, id))
      .returning();

    return updated!;
  });
}
