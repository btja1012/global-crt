import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { db } from "@/lib/server-db";
import { tickets, insertTicketSchema, auditLogs } from "../../../../shared/schema";
import { desc, isNull, ilike, or, and, eq, SQL } from "drizzle-orm";
import type { ServiceType, DirectionType } from "../../../../shared/schema";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() || "";
  const serviceType = searchParams.get("serviceType") || "";
  const direction = searchParams.get("direction") || "";

  const conditions = [
    isNull(tickets.deletedAt),
    search
      ? or(
          ilike(tickets.trackingNumber, `%${search}%`),
          ilike(tickets.clientName, `%${search}%`),
          ilike(tickets.origin, `%${search}%`),
          ilike(tickets.destination, `%${search}%`),
        )
      : undefined,
    serviceType ? eq(tickets.serviceType, serviceType as ServiceType) : undefined,
    direction ? eq(tickets.direction, direction as DirectionType) : undefined,
  ].filter(Boolean) as SQL[];

  const result = await db.query.tickets.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    with: { comments: true, attachments: true },
    orderBy: desc(tickets.createdAt),
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = insertTicketSchema.parse(body);
    const [newTicket] = await db.insert(tickets).values(data as typeof tickets.$inferInsert).returning();

    // Log creation
    await db.insert(auditLogs).values({
      ticketId: newTicket.id,
      userId: user.id,
      userName: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
      action: "created",
      changes: null,
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return NextResponse.json({ message: "Datos inválidos", errors: err.errors }, { status: 400 });
    }
    if (err?.code === "23505") {
      return NextResponse.json({ message: "El número de rastreo ya existe" }, { status: 409 });
    }
    console.error("POST /api/tickets error:", err);
    return NextResponse.json({ message: err?.message || "Error al crear ticket" }, { status: 500 });
  }
}
