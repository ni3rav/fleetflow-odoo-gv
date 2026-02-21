import {
  pgTable,
  pgEnum,
  text,
  integer,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { trip } from "./trip";
import { maintenanceLog } from "./maintenance";
import { expense } from "./expense";

export const vehicleTypeEnum = pgEnum("vehicle_type", ["truck", "van", "bike"]);

export const vehicleStatusEnum = pgEnum("vehicle_status", [
  "available",
  "on_trip",
  "in_shop",
  "retired",
]);

export const vehicle = pgTable(
  "vehicle",
  {
    id: text("id").primaryKey(),
    licensePlate: text("license_plate").notNull().unique(),
    name: text("name").notNull(),
    model: text("model").notNull(),
    type: vehicleTypeEnum("type").notNull(),
    maxCapacityKg: integer("max_capacity_kg").notNull(),
    odometer: integer("odometer").notNull().default(0),
    status: vehicleStatusEnum("status").notNull().default("available"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("vehicle_status_idx").on(table.status),
    index("vehicle_type_idx").on(table.type),
  ],
);

export const vehicleRelations = relations(vehicle, ({ many }) => ({
  trips: many(trip),
  maintenanceLogs: many(maintenanceLog),
  expenses: many(expense),
}));
