import { pgTable, text, serial, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";

export const TICKET_STATUSES = ["Nuevo", "En Proceso", "Aduana", "En Tránsito", "Entregado"] as const;
export type TicketStatus = typeof TICKET_STATUSES[number];

export const SERVICE_TYPES = ["Marítimo", "Terrestre", "Aéreo", "Agencia Aduanal"] as const;
export type ServiceType = typeof SERVICE_TYPES[number];

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
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  userName: text("user_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

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
