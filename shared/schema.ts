import { pgTable, text, serial, timestamp, varchar, integer, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";

export const TICKET_STATUSES = ["Nuevo", "En Proceso", "Aduana", "En Tránsito", "Entregado"] as const;
export type TicketStatus = typeof TICKET_STATUSES[number];

export const SERVICE_TYPES = ["Marítimo", "Terrestre", "Aéreo", "Agencia Aduanal"] as const;
export type ServiceType = typeof SERVICE_TYPES[number];

export const DIRECTION_TYPES = ["Import", "Export"] as const;
export type DirectionType = typeof DIRECTION_TYPES[number];

export const LOAD_TYPES = ["FCL", "LCL"] as const;
export type LoadType = typeof LOAD_TYPES[number];

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  trackingNumber: varchar("tracking_number", { length: 50 }).notNull().unique(),
  clientName: text("client_name").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  status: text("status").notNull().$type<TicketStatus>(),
  cargoType: text("cargo_type"),
  serviceType: text("service_type").$type<ServiceType>(),
  notes: text("notes"),
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),

  // --- Datos Generales ---
  supplier: text("supplier"),
  fiscalWarehouse: text("fiscal_warehouse"),
  forwarder: text("forwarder"),

  // --- Servicio ---
  direction: text("direction").$type<DirectionType>(),
  loadType: text("load_type").$type<LoadType>(),
  agencyName: text("agency_name"),
  requiresTransport: boolean("requires_transport").default(false),

  // --- Embarque ---
  supplierOrderNumber: text("supplier_order_number"),
  transitTime: text("transit_time"),
  etaPort: text("eta_port"),
  blNumber: text("bl_number"),
  awbNumber: text("awb_number"),
  cpNumber: text("cp_number"),

  // --- Aduana / DUCA ---
  requiresInspection: boolean("requires_inspection").default(false),
  requiresSenasa: boolean("requires_senasa").default(false),
  requiresProcomer: boolean("requires_procomer").default(false),
  policyReceiptNumber: text("policy_receipt_number"),
  movementNumber: text("movement_number"),
  requiresPrevioExamen: boolean("requires_previo_examen").default(false),
  requiresRevisionAforador: boolean("requires_revision_aforador").default(false),

  // --- Pagos Realizados ---
  paidDucaT: boolean("paid_duca_t").default(false),
  paidBodegaje: boolean("paid_bodegaje").default(false),
  permitNumber: text("permit_number"),
  paidExoneracion: boolean("paid_exoneracion").default(false),
  paidTransporteInterno: boolean("paid_transporte_interno").default(false),
  paidSeguro: boolean("paid_seguro").default(false),
  paidDua: boolean("paid_dua").default(false),
  paidRetiroDocumento: boolean("paid_retiro_documento").default(false),
  paidTerceros: boolean("paid_terceros").default(false),

  // --- Datos Financieros ---
  invoiceNumber: text("invoice_number"),
  hasTaxes: boolean("has_taxes").default(false),
  liquidationNumber: text("liquidation_number"),
  receiptNumber: text("receipt_number"),
}, (table) => [
  index("idx_tickets_status").on(table.status),
  index("idx_tickets_created_at").on(table.createdAt),
]);

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  userName: text("user_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_comments_ticket_id").on(table.ticketId),
]);

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_attachments_ticket_id").on(table.ticketId),
]);

export const ticketsRelations = relations(tickets, ({ many }) => ({
  comments: many(comments),
  attachments: many(attachments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  ticket: one(tickets, { fields: [comments.ticketId], references: [tickets.id] }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  ticket: one(tickets, { fields: [attachments.ticketId], references: [tickets.id] }),
}));

export const insertTicketSchema = createInsertSchema(tickets).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, createdAt: true });
export const insertAttachmentSchema = createInsertSchema(attachments).omit({ id: true, createdAt: true });

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Attachment = typeof attachments.$inferSelect;
export type InsertAttachment = z.infer<typeof insertAttachmentSchema>;

export type CreateTicketRequest = InsertTicket;
export type UpdateTicketRequest = Partial<InsertTicket>;
export type TicketResponse = Ticket;
export type CommentResponse = Comment;
export type AttachmentResponse = Attachment;

export type TicketWithDetails = Ticket & {
  comments: Comment[];
  attachments: Attachment[];
};
