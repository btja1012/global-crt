import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { db } from "@/lib/server-db";
import { tickets, auditLogs } from "../../../../../shared/schema";
import { inArray } from "drizzle-orm";
import type { TicketStatus } from "../../../../../shared/schema";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { ids, action, status } = body as { ids: number[]; action: "delete" | "update"; status?: TicketStatus };

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ message: "ids requeridos" }, { status: 400 });
    }
    if (ids.length > 100) {
      return NextResponse.json({ message: "Máximo 100 órdenes a la vez" }, { status: 400 });
    }

    const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

    if (action === "delete") {
      await db.update(tickets).set({ deletedAt: new Date() }).where(inArray(tickets.id, ids));
      await db.insert(auditLogs).values(
        ids.map((id) => ({ ticketId: id, userId: user.id, userName, action: "deleted", changes: null }))
      );
      return NextResponse.json({ message: `${ids.length} órdenes eliminadas` });
    }

    if (action === "update" && status) {
      await db.update(tickets).set({ status, updatedAt: new Date() }).where(inArray(tickets.id, ids));
      await db.insert(auditLogs).values(
        ids.map((id) => ({
          ticketId: id,
          userId: user.id,
          userName,
          action: "updated",
          changes: JSON.stringify([{ field: "status", to: status }]),
        }))
      );
      return NextResponse.json({ message: `${ids.length} órdenes actualizadas` });
    }

    return NextResponse.json({ message: "Acción no válida" }, { status: 400 });
  } catch (err: any) {
    console.error("POST /api/tickets/bulk error:", err);
    return NextResponse.json({ message: err?.message || "Error en operación bulk" }, { status: 500 });
  }
}
