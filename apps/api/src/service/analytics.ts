import { sql } from "drizzle-orm";

import { db } from "@/db/client";
import { vehicle } from "@/db/schema/vehicle";
import { expense } from "@/db/schema/expense";
import { maintenanceLog } from "@/db/schema/maintenance";
import { trip } from "@/db/schema/trip";

export type CostSummaryItem = {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalOperationalCost: number;
};

export type FuelEfficiencyItem = {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  totalKm: number;
  totalLiters: number;
  kmPerLiter: number | null;
};

export type AnalyticsSummary = {
  costSummary: CostSummaryItem[];
  fuelEfficiency: FuelEfficiencyItem[];
  totalOperationalCost: number;
};

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const vehicles = await db.select().from(vehicle);

  const fuelByVehicle = await db
    .select({
      vehicleId: expense.vehicleId,
      total: sql<number>`COALESCE(SUM(COALESCE(${expense.fuelCost}, 0)::numeric + COALESCE(${expense.miscExpense}, 0)::numeric), 0)`,
    })
    .from(expense)
    .groupBy(expense.vehicleId);

  const maintenanceByVehicle = await db
    .select({
      vehicleId: maintenanceLog.vehicleId,
      total: sql<number>`COALESCE(SUM(${maintenanceLog.cost}::numeric), 0)`,
    })
    .from(maintenanceLog)
    .groupBy(maintenanceLog.vehicleId);

  const fuelMap = new Map(fuelByVehicle.map((r) => [r.vehicleId, Number(r.total)]));
  const maintenanceMap = new Map(
    maintenanceByVehicle.map((r) => [r.vehicleId, Number(r.total)]),
  );

  const costSummary: CostSummaryItem[] = vehicles.map((v) => {
    const totalFuelCost = fuelMap.get(v.id) ?? 0;
    const totalMaintenanceCost = maintenanceMap.get(v.id) ?? 0;
    return {
      vehicleId: v.id,
      vehicleName: v.name,
      licensePlate: v.licensePlate,
      totalFuelCost,
      totalMaintenanceCost,
      totalOperationalCost: totalFuelCost + totalMaintenanceCost,
    };
  });

  const totalOperationalCost = costSummary.reduce(
    (acc, row) => acc + row.totalOperationalCost,
    0,
  );

  // Fuel efficiency: completed trips with endOdometer; km per trip summed once, liters from expenses per trip
  const efficiencyRows = await db.execute<{
    vehicle_id: string;
    km: string;
    liters: string;
  }>(sql`
    SELECT t.vehicle_id,
           SUM(t.end_odometer - t.start_odometer) AS km,
           COALESCE(SUM(exp.liters), 0) AS liters
    FROM trip t
    INNER JOIN (
      SELECT trip_id, SUM(COALESCE(fuel_liters, 0)::numeric) AS liters
      FROM expense
      WHERE trip_id IS NOT NULL
      GROUP BY trip_id
    ) exp ON t.id = exp.trip_id
    WHERE t.status = 'completed' AND t.end_odometer IS NOT NULL
    GROUP BY t.vehicle_id
  `);

  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));
  const fuelEfficiency: FuelEfficiencyItem[] = (efficiencyRows.rows ?? []).map((r) => {
    const v = vehicleMap.get(r.vehicle_id);
    const totalKm = Number(r.km) || 0;
    const totalLiters = Number(r.liters) || 0;
    return {
      vehicleId: r.vehicle_id,
      vehicleName: v?.name ?? "",
      licensePlate: v?.licensePlate ?? "",
      totalKm,
      totalLiters,
      kmPerLiter: totalLiters > 0 ? Math.round((totalKm / totalLiters) * 100) / 100 : null,
    };
  });

  return {
    costSummary,
    fuelEfficiency,
    totalOperationalCost,
  };
}
