import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { db } from "@/lib/server-db";
import { tickets, auditLogs } from "../../../../../../shared/schema";
import { eq } from "drizzle-orm";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { ticketId } = await params;
  const id = parseInt(ticketId);
  if (isNaN(id)) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

  const [restored] = await db
    .update(tickets)
    .set({ deletedAt: null })
    .where(eq(tickets.id, id))
    .returning();

  if (!restored) return NextResponse.json({ message: "Ticket not found" }, { status: 404 });

  await db.insert(auditLogs).values({
    ticketId: id,
    userId: user.id,
    userName: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
    action: "restored",
    changes: null,
  });

  return NextResponse.json(restored);
}
