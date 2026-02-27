import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { db } from "@/lib/server-db";
import { tickets, comments, attachments, auditLogs } from "../../../../../shared/schema";
import { eq, desc } from "drizzle-orm";

const UPDATABLE_FIELDS = [
  "trackingNumber", "clientName", "origin", "destination", "status",
  "cargoType", "serviceType", "notes", "assignedTo",
  "supplier", "fiscalWarehouse", "forwarder",
  "direction", "loadType", "agencyName", "requiresTransport",
  "supplierOrderNumber", "transitTime", "etaPort", "blNumber", "awbNumber", "cpNumber",
  "requiresInspection", "requiresSenasa", "requiresProcomer",
  "policyReceiptNumber", "movementNumber", "requiresPrevioExamen", "requiresRevisionAforador",
  "paidDucaT", "paidBodegaje", "permitNumber", "paidExoneracion",
  "paidTransporteInterno", "paidSeguro", "paidDua", "paidRetiroDocumento", "paidTerceros",
  "invoiceNumber", "hasTaxes", "liquidationNumber", "receiptNumber",
] as const;

export async function GET(_req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { ticketId } = await params;
  const id = parseInt(ticketId);
  if (isNaN(id)) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

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
    if (isNaN(id)) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

    const body = await req.json();

    // Fetch current values for audit log diff
    const [current] = await db.select().from(tickets).where(eq(tickets.id, id));
    if (!current) return NextResponse.json({ message: "Ticket not found" }, { status: 404 });

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    const changed: { field: string; from: unknown; to: unknown }[] = [];

    for (const field of UPDATABLE_FIELDS) {
      if (body[field] !== undefined) {
        const newVal = body[field] ?? null;
        patch[field] = newVal;
        if (current[field] !== newVal) {
          changed.push({ field, from: current[field], to: newVal });
        }
      }
    }

    const [updated] = await db.update(tickets).set(patch).where(eq(tickets.id, id)).returning();
    if (!updated) return NextResponse.json({ message: "Ticket not found" }, { status: 404 });

    if (changed.length > 0) {
      await db.insert(auditLogs).values({
        ticketId: id,
        userId: user.id,
        userName: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
        action: "updated",
        changes: JSON.stringify(changed),
      });
    }

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
  const id = parseInt(ticketId);
  if (isNaN(id)) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

  // Soft delete
  await db.update(tickets).set({ deletedAt: new Date() }).where(eq(tickets.id, id));

  await db.insert(auditLogs).values({
    ticketId: id,
    userId: user.id,
    userName: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
    action: "deleted",
    changes: null,
  });

  return NextResponse.json({ message: "Deleted" });
}
