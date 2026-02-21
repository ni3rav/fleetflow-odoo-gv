import {
  pgTable,
  pgEnum,
  text,
  integer,
  numeric,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { vehicle } from "./vehicle";
import { driver } from "./driver";
import { expense } from "./expense";

export const tripStatusEnum = pgEnum("trip_status", [
  "draft",
  "dispatched",
  "completed",
  "cancelled",
]);

export const trip = pgTable(
  "trip",
  {
    id: text("id").primaryKey(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicle.id, { onDelete: "restrict" }),
    driverId: text("driver_id")
      .notNull()
      .references(() => driver.id, { onDelete: "restrict" }),
    cargoWeightKg: integer("cargo_weight_kg").notNull(),
    originAddress: text("origin_address").notNull(),
    destination: text("destination").notNull(),
    estimatedFuelCost: numeric("estimated_fuel_cost", {
      precision: 10,
      scale: 2,
    }),
    actualFuelCost: numeric("actual_fuel_cost", { precision: 10, scale: 2 }),
    startOdometer: integer("start_odometer").notNull(),
    endOdometer: integer("end_odometer"),
    status: tripStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("trip_vehicle_id_idx").on(table.vehicleId),
    index("trip_driver_id_idx").on(table.driverId),
    index("trip_status_idx").on(table.status),
  ],
);

export const tripRelations = relations(trip, ({ one, many }) => ({
  vehicle: one(vehicle, {
    fields: [trip.vehicleId],
    references: [vehicle.id],
  }),
  driver: one(driver, {
    fields: [trip.driverId],
    references: [driver.id],
  }),
  expenses: many(expense),
}));
