import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { db } from "@/lib/server-db";
import { tickets, comments, attachments } from "../../../../../shared/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { ticketId } = await params;
  const id = parseInt(ticketId);
  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, id));
  if (!ticket) return NextResponse.json({ message: "Ticket not found" }, { status: 404 });

  const ticketComments = await db.select().from(comments).where(eq(comments.ticketId, id)).orderBy(desc(comments.createdAt));
  const ticketAttachments = await db.select().from(attachments).where(eq(attachments.ticketId, id)).orderBy(desc(attachments.createdAt));

  return NextResponse.json({ ...ticket, comments: ticketComments, attachments: ticketAttachments });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { ticketId } = await params;
    const id = parseInt(ticketId);
    const body = await req.json();

    // Build partial update — only include fields that were sent
    const patch: Record<string, any> = { updatedAt: new Date() };
    if (body.trackingNumber !== undefined) patch.trackingNumber = body.trackingNumber;
    if (body.clientName !== undefined) patch.clientName = body.clientName;
    if (body.origin !== undefined) patch.origin = body.origin;
    if (body.destination !== undefined) patch.destination = body.destination;
    if (body.status !== undefined) patch.status = body.status;
    if (body.cargoType !== undefined) patch.cargoType = body.cargoType || null;
    if (body.serviceType !== undefined) patch.serviceType = body.serviceType || null;
    if (body.notes !== undefined) patch.notes = body.notes || null;
    if (body.assignedTo !== undefined) patch.assignedTo = body.assignedTo || null;

    const [updated] = await db.update(tickets).set(patch).where(eq(tickets.id, id)).returning();
    if (!updated) return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error("PUT /api/tickets error:", err);
    return NextResponse.json({ message: err?.message || "Error al actualizar ticket" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { ticketId } = await params;
  await db.delete(tickets).where(eq(tickets.id, parseInt(ticketId)));
  return NextResponse.json({ message: "Deleted" });
}
