import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { db } from "@/lib/server-db";
import { tickets, comments, attachments } from "../../../../shared/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const allTickets = await db.select().from(tickets).orderBy(desc(tickets.createdAt));
  const allComments = await db.select().from(comments).orderBy(desc(comments.createdAt));
  const allAttachments = await db.select().from(attachments).orderBy(desc(attachments.createdAt));

  const result = allTickets.map((ticket) => ({
    ...ticket,
    comments: allComments.filter((c) => c.ticketId === ticket.id),
    attachments: allAttachments.filter((a) => a.ticketId === ticket.id),
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const [newTicket] = await db.insert(tickets).values({
      trackingNumber: body.trackingNumber,
      clientName: body.clientName,
      origin: body.origin,
      destination: body.destination,
      status: body.status,
      cargoType: body.cargoType || null,
      serviceType: body.serviceType || null,
      notes: body.notes || null,
      assignedTo: body.assignedTo || null,
    }).returning();
    return NextResponse.json(newTicket, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/tickets error:", err);
    return NextResponse.json({ message: err?.message || "Error al crear ticket" }, { status: 500 });
  }
}
