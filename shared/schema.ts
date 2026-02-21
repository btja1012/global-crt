import { pgTable, text, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";

export const cargos = pgTable("cargos", {
  id: serial("id").primaryKey(),
  trackingNumber: varchar("tracking_number", { length: 50 }).notNull().unique(),
  clientName: text("client_name").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  status: text("status").notNull(), // 'Pending', 'In Transit', 'Customs', 'Delivered'
  estimatedDelivery: timestamp("estimated_delivery"),
  cargoType: text("cargo_type"), 
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCargoSchema = createInsertSchema(cargos).omit({ id: true, createdAt: true });

export type Cargo = typeof cargos.$inferSelect;
export type InsertCargo = z.infer<typeof insertCargoSchema>;

export type CreateCargoRequest = InsertCargo;
export type UpdateCargoRequest = Partial<InsertCargo>;
export type CargoResponse = Cargo;
