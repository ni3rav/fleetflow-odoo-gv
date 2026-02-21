import { and, eq, gt, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { driver } from "@/db/schema/driver";
import { trip } from "@/db/schema/trip";
import { AppError } from "@/lib/errors";
import type {
  CreateDriverInput,
  UpdateDriverInput,
  UpdateDriverStatusInput,
} from "@/validations/driver";

export async function listDrivers(filters?: { status?: string }) {
  if (filters?.status) {
    return db
      .select()
      .from(driver)
      .where(
        eq(
          driver.status,
          filters.status as (typeof driver.status.enumValues)[number],
        ),
      );
  }
  return db.select().from(driver);
}

export async function getDriverById(id: string) {
  const [found] = await db.select().from(driver).where(eq(driver.id, id));

  if (!found) throw new AppError(404, "Driver not found");
  return found;
}

export async function getAvailableDrivers() {
  const today = new Date().toISOString().split("T")[0]!;
  return db
    .select()
    .from(driver)
    .where(and(eq(driver.status, "on_duty"), gt(driver.licenseExpiry, today)));
}

export async function createDriver(data: CreateDriverInput) {
  const [created] = await db
    .insert(driver)
    .values({
      id: crypto.randomUUID(),
      name: data.name,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      safetyScore: data.safetyScore ?? 100,
      completionRate: data.completionRate ?? 0,
      complaints: 0,
      status: "on_duty",
    })
    .returning();

  return created;
}

export async function updateDriver(id: string, data: UpdateDriverInput) {
  await getDriverById(id);

  const [updated] = await db
    .update(driver)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(driver.id, id))
    .returning();

  return updated;
}

export async function updateDriverStatus(
  id: string,
  data: UpdateDriverStatusInput,
) {
  return db.transaction(async (tx) => {
    const [current] = await tx.select().from(driver).where(eq(driver.id, id));

    if (!current) throw new AppError(404, "Driver not found");

    // can't go off_duty or suspended if currently on an active trip
    if (data.status !== "on_duty") {
      const activeTrips = await tx
        .select({ id: trip.id })
        .from(trip)
        .where(
          and(
            eq(trip.driverId, id),
            inArray(trip.status, ["draft", "dispatched"]),
          ),
        );

      if (activeTrips.length > 0) {
        throw new AppError(
          409,
          `Cannot change status: driver has ${activeTrips.length} active trip(s)`,
        );
      }
    }

    const [updated] = await tx
      .update(driver)
      .set({ status: data.status, updatedAt: new Date() })
      .where(eq(driver.id, id))
      .returning();

    return updated;
  });
}

export async function deleteDriver(id: string) {
  return db.transaction(async (tx) => {
    const activeTrips = await tx
      .select({ id: trip.id })
      .from(trip)
      .where(
        and(
          eq(trip.driverId, id),
          inArray(trip.status, ["draft", "dispatched"]),
        ),
      );

    if (activeTrips.length > 0) {
      throw new AppError(
        409,
        `Cannot delete driver: ${activeTrips.length} active trip(s) exist`,
      );
    }

    const [deleted] = await tx
      .delete(driver)
      .where(eq(driver.id, id))
      .returning();

    if (!deleted) throw new AppError(404, "Driver not found");
    return deleted;
  });
}
