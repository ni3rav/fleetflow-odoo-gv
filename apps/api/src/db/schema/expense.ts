import {
  pgTable,
  text,
  numeric,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { trip } from "./trip";
import { vehicle } from "./vehicle";

export const expense = pgTable(
  "expense",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id").references(() => trip.id, { onDelete: "restrict" }),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicle.id, { onDelete: "restrict" }),
    fuelLiters: numeric("fuel_liters", { precision: 10, scale: 2 }),
    fuelCost: numeric("fuel_cost", { precision: 10, scale: 2 }),
    miscExpense: numeric("misc_expense", { precision: 10, scale: 2 }),
    miscDescription: text("misc_description"),
    date: date("date", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("expense_trip_id_idx").on(table.tripId),
    index("expense_vehicle_id_idx").on(table.vehicleId),
  ],
);

export const expenseRelations = relations(expense, ({ one }) => ({
  trip: one(trip, {
    fields: [expense.tripId],
    references: [trip.id],
  }),
  vehicle: one(vehicle, {
    fields: [expense.vehicleId],
    references: [vehicle.id],
  }),
}));
