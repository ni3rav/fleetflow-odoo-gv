import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { maintenanceLog } from "@/db/schema/maintenance";
import { vehicle } from "@/db/schema/vehicle";
import { AppError } from "@/lib/errors";
import type {
  CreateMaintenanceInput,
  UpdateMaintenanceInput,
} from "@/validations/maintenance";

export async function listMaintenance(filters?: { vehicleId?: string }) {
  if (filters?.vehicleId) {
    return db
      .select()
      .from(maintenanceLog)
      .where(eq(maintenanceLog.vehicleId, filters.vehicleId));
  }
  return db.select().from(maintenanceLog);
}

export async function getMaintenanceById(id: string) {
  const [found] = await db
    .select()
    .from(maintenanceLog)
    .where(eq(maintenanceLog.id, id));
  if (!found) throw new AppError(404, "Maintenance log not found");
  return found;
}

export async function createMaintenance(data: CreateMaintenanceInput) {
  return db.transaction(async (tx) => {
    const [v] = await tx.select().from(vehicle).where(eq(vehicle.id, data.vehicleId));
    if (!v) throw new AppError(404, "Vehicle not found");

    const [created] = await tx
      .insert(maintenanceLog)
      .values({
        id: crypto.randomUUID(),
        vehicleId: data.vehicleId,
        serviceType: data.serviceType,
        description: data.description ?? null,
        cost: data.cost,
        date: data.date,
        status: "in_progress",
      })
      .returning();

    await tx
      .update(vehicle)
      .set({ status: "in_shop", updatedAt: new Date() })
      .where(eq(vehicle.id, data.vehicleId));

    return created!;
  });
}

export async function updateMaintenance(
  id: string,
  data: UpdateMaintenanceInput,
) {
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select()
      .from(maintenanceLog)
      .where(eq(maintenanceLog.id, id));
    if (!current) throw new AppError(404, "Maintenance log not found");

    const wasCompleted = current.status === "completed";
    const nowCompleted = data.status === "completed";

    const [updated] = await tx
      .update(maintenanceLog)
      .set({
        ...(data.serviceType !== undefined && { serviceType: data.serviceType }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.cost !== undefined && { cost: data.cost }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.status !== undefined && { status: data.status }),
        updatedAt: new Date(),
      })
      .where(eq(maintenanceLog.id, id))
      .returning();

    if (!wasCompleted && nowCompleted) {
      await tx
        .update(vehicle)
        .set({ status: "available", updatedAt: new Date() })
        .where(eq(vehicle.id, current.vehicleId));
    }

    return updated!;
  });
}
