import { db } from "./_db";
import { tickets, comments, attachments } from "../shared/schema";
import type {
  CreateTicketRequest,
  UpdateTicketRequest,
  TicketResponse,
  CommentResponse,
  AttachmentResponse,
  InsertComment,
  InsertAttachment,
  TicketWithDetails,
} from "../shared/schema";
import { eq, desc } from "drizzle-orm";

export async function getTickets(): Promise<TicketWithDetails[]> {
  const allTickets = await db.select().from(tickets).orderBy(desc(tickets.createdAt));
  const allComments = await db.select().from(comments).orderBy(desc(comments.createdAt));
  const allAttachments = await db.select().from(attachments).orderBy(desc(attachments.createdAt));

  return allTickets.map((ticket) => ({
    ...ticket,
    comments: allComments.filter((c) => c.ticketId === ticket.id),
    attachments: allAttachments.filter((a) => a.ticketId === ticket.id),
  }));
}

export async function getTicket(id: number): Promise<TicketWithDetails | undefined> {
  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
  if (!ticket) return undefined;

  const ticketComments = await db.select().from(comments).where(eq(comments.ticketId, id)).orderBy(desc(comments.createdAt));
  const ticketAttachments = await db.select().from(attachments).where(eq(attachments.ticketId, id)).orderBy(desc(attachments.createdAt));

  return { ...ticket, comments: ticketComments, attachments: ticketAttachments };
}

export async function createTicket(ticket: CreateTicketRequest): Promise<TicketResponse> {
  const [newTicket] = await db.insert(tickets).values(ticket as any).returning();
  return newTicket;
}

export async function updateTicket(id: number, updates: UpdateTicketRequest): Promise<TicketResponse | undefined> {
  const [updated] = await db.update(tickets).set({ ...updates, updatedAt: new Date() } as any).where(eq(tickets.id, id)).returning();
  return updated;
}

export async function deleteTicket(id: number): Promise<void> {
  await db.delete(tickets).where(eq(tickets.id, id));
}

export async function getComments(ticketId: number): Promise<CommentResponse[]> {
  return await db.select().from(comments).where(eq(comments.ticketId, ticketId)).orderBy(desc(comments.createdAt));
}

export async function createComment(comment: InsertComment): Promise<CommentResponse> {
  const [newComment] = await db.insert(comments).values(comment).returning();
  return newComment;
}

export async function getAttachments(ticketId: number): Promise<AttachmentResponse[]> {
  return await db.select().from(attachments).where(eq(attachments.ticketId, ticketId)).orderBy(desc(attachments.createdAt));
}

export async function createAttachment(attachment: InsertAttachment): Promise<AttachmentResponse> {
  const [newAttachment] = await db.insert(attachments).values(attachment).returning();
  return newAttachment;
}

export async function deleteAttachment(id: number): Promise<void> {
  await db.delete(attachments).where(eq(attachments.id, id));
}

export async function seedDatabase(): Promise<void> {
  const existing = await getTickets();
  if (existing.length === 0) {
    const t1 = await createTicket({
      trackingNumber: "CR-2025-001",
      clientName: "Importaciones ABC",
      origin: "Miami, USA",
      destination: "San José, Costa Rica",
      status: "En Proceso",
      cargoType: "Contenedor",
      notes: "Mercancía frágil - manejar con cuidado",
      assignedTo: null,
    });
    await createComment({
      ticketId: t1.id,
      userId: "system",
      userName: "Sistema",
      content: "Ticket creado. Carga recibida en puerto de origen.",
    });

    const t2 = await createTicket({
      trackingNumber: "CR-2025-002",
      clientName: "Exportadora Tropical",
      origin: "Limón, Costa Rica",
      destination: "Rotterdam, Países Bajos",
      status: "Aduana",
      cargoType: "Pallet",
      notes: "Productos agrícolas - requiere refrigeración",
      assignedTo: null,
    });
    await createComment({
      ticketId: t2.id,
      userId: "system",
      userName: "Sistema",
      content: "Documentación de exportación en revisión aduanera.",
    });

    await createTicket({
      trackingNumber: "CR-2025-003",
      clientName: "TechParts CR",
      origin: "Shanghai, China",
      destination: "Alajuela, Costa Rica",
      status: "En Tránsito",
      cargoType: "Caja",
      notes: "Componentes electrónicos",
      assignedTo: null,
    });

    await createTicket({
      trackingNumber: "CR-2025-004",
      clientName: "Mueblería Central",
      origin: "Ciudad de Guatemala, Guatemala",
      destination: "Heredia, Costa Rica",
      status: "Nuevo",
      cargoType: "Contenedor",
      notes: "Muebles de oficina",
      assignedTo: null,
    });

    await createTicket({
      trackingNumber: "CR-2025-005",
      clientName: "Farmacéutica Nacional",
      origin: "Madrid, España",
      destination: "Cartago, Costa Rica",
      status: "Entregado",
      cargoType: "Caja",
      notes: "Equipo médico - entrega completada",
      assignedTo: null,
    });
  }
}
