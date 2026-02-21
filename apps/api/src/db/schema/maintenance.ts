import {
  pgTable,
  pgEnum,
  text,
  numeric,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { vehicle } from "./vehicle";

export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "in_progress",
  "completed",
]);

export const maintenanceLog = pgTable(
  "maintenance_log",
  {
    id: text("id").primaryKey(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicle.id, { onDelete: "restrict" }),
    serviceType: text("service_type").notNull(),
    description: text("description"),
    cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
    date: date("date", { mode: "string" }).notNull(),
    status: maintenanceStatusEnum("status").notNull().default("in_progress"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("maintenance_vehicle_id_idx").on(table.vehicleId)],
);

export const maintenanceLogRelations = relations(maintenanceLog, ({ one }) => ({
  vehicle: one(vehicle, {
    fields: [maintenanceLog.vehicleId],
    references: [vehicle.id],
  }),
}));
