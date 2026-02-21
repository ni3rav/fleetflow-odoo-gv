import {
  pgTable,
  pgEnum,
  text,
  integer,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { trip } from "./trip";

export const driverStatusEnum = pgEnum("driver_status", [
  "on_duty",
  "off_duty",
  "suspended",
]);

export const driver = pgTable(
  "driver",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    licenseNumber: text("license_number").notNull().unique(),
    licenseExpiry: date("license_expiry", { mode: "string" }).notNull(),
    safetyScore: integer("safety_score").notNull().default(100),
    completionRate: integer("completion_rate").notNull().default(0),
    complaints: integer("complaints").notNull().default(0),
    status: driverStatusEnum("status").notNull().default("on_duty"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("driver_status_idx").on(table.status)],
);

export const driverRelations = relations(driver, ({ many }) => ({
  trips: many(trip),
}));
