import { db } from "./db";
import {
  tickets,
  comments,
  attachments,
  type CreateTicketRequest,
  type UpdateTicketRequest,
  type TicketResponse,
  type CommentResponse,
  type AttachmentResponse,
  type InsertComment,
  type InsertAttachment,
  type TicketWithDetails,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getTickets(): Promise<TicketWithDetails[]>;
  getTicket(id: number): Promise<TicketWithDetails | undefined>;
  createTicket(ticket: CreateTicketRequest): Promise<TicketResponse>;
  updateTicket(id: number, updates: UpdateTicketRequest): Promise<TicketResponse>;
  deleteTicket(id: number): Promise<void>;
  getComments(ticketId: number): Promise<CommentResponse[]>;
  createComment(comment: InsertComment): Promise<CommentResponse>;
  getAttachments(ticketId: number): Promise<AttachmentResponse[]>;
  createAttachment(attachment: InsertAttachment): Promise<AttachmentResponse>;
  deleteAttachment(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTickets(): Promise<TicketWithDetails[]> {
    const allTickets = await db.select().from(tickets).orderBy(desc(tickets.createdAt));
    const allComments = await db.select().from(comments).orderBy(desc(comments.createdAt));
    const allAttachments = await db.select().from(attachments).orderBy(desc(attachments.createdAt));

    return allTickets.map(ticket => ({
      ...ticket,
      comments: allComments.filter(c => c.ticketId === ticket.id),
      attachments: allAttachments.filter(a => a.ticketId === ticket.id),
    }));
  }

  async getTicket(id: number): Promise<TicketWithDetails | undefined> {
    const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
    if (!ticket) return undefined;

    const ticketComments = await db.select().from(comments)
      .where(eq(comments.ticketId, id))
      .orderBy(desc(comments.createdAt));
    const ticketAttachments = await db.select().from(attachments)
      .where(eq(attachments.ticketId, id))
      .orderBy(desc(attachments.createdAt));

    return { ...ticket, comments: ticketComments, attachments: ticketAttachments };
  }

  async createTicket(ticket: CreateTicketRequest): Promise<TicketResponse> {
    const [newTicket] = await db.insert(tickets).values(ticket as any).returning();
    return newTicket;
  }

  async updateTicket(id: number, updates: UpdateTicketRequest): Promise<TicketResponse> {
    const [updated] = await db.update(tickets)
      .set({ ...updates, updatedAt: new Date() } as any)
      .where(eq(tickets.id, id))
      .returning();
    return updated;
  }

  async deleteTicket(id: number): Promise<void> {
    await db.delete(tickets).where(eq(tickets.id, id));
  }

  async getComments(ticketId: number): Promise<CommentResponse[]> {
    return await db.select().from(comments)
      .where(eq(comments.ticketId, ticketId))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<CommentResponse> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getAttachments(ticketId: number): Promise<AttachmentResponse[]> {
    return await db.select().from(attachments)
      .where(eq(attachments.ticketId, ticketId))
      .orderBy(desc(attachments.createdAt));
  }

  async createAttachment(attachment: InsertAttachment): Promise<AttachmentResponse> {
    const [newAttachment] = await db.insert(attachments).values(attachment).returning();
    return newAttachment;
  }

  async deleteAttachment(id: number): Promise<void> {
    await db.delete(attachments).where(eq(attachments.id, id));
  }
}

export const storage = new DatabaseStorage();
