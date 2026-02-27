import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { db } from "@/lib/server-db";
import { auditLogs } from "../../../../../../shared/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { ticketId } = await params;
  const id = parseInt(ticketId);
  if (isNaN(id)) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

  const logs = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.ticketId, id))
    .orderBy(desc(auditLogs.createdAt));

  return NextResponse.json(logs);
}
