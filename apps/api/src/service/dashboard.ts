import { count, eq, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { vehicle } from "@/db/schema/vehicle";
import { trip } from "@/db/schema/trip";

export type Kpis = {
  activeFleet: number;
  maintenanceAlerts: number;
  utilizationRate: number;
  pendingCargo: number;
};

export async function getKpis(): Promise<Kpis> {
  const [onTripRow] = await db
    .select({ value: count() })
    .from(vehicle)
    .where(eq(vehicle.status, "on_trip"));

  const [inShopRow] = await db
    .select({ value: count() })
    .from(vehicle)
    .where(eq(vehicle.status, "in_shop"));

  const [totalVehiclesRow] = await db.select({ value: count() }).from(vehicle);

  const [draftTripsRow] = await db
    .select({ value: count() })
    .from(trip)
    .where(eq(trip.status, "draft"));

  const activeFleet = onTripRow?.value ?? 0;
  const maintenanceAlerts = inShopRow?.value ?? 0;
  const totalVehicles = totalVehiclesRow?.value ?? 0;
  const utilizationRate =
    totalVehicles > 0
      ? Math.round((activeFleet / totalVehicles) * 100)
      : 0;
  const pendingCargo = draftTripsRow?.value ?? 0;

  return {
    activeFleet,
    maintenanceAlerts,
    utilizationRate,
    pendingCargo,
  };
}
