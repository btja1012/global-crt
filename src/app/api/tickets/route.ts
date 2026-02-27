import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { db } from "@/lib/server-db";
import { tickets, insertTicketSchema } from "../../../../shared/schema";
import { desc } from "drizzle-orm";
import { ZodError } from "zod";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const result = await db.query.tickets.findMany({
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
    return NextResponse.json(newTicket, { status: 201 });
  } catch (err: any) {
    if (err instanceof ZodError) {
      return NextResponse.json({ message: "Datos inválidos", errors: err.errors }, { status: 400 });
    }
    // PostgreSQL unique constraint violation
    if (err?.code === "23505") {
      return NextResponse.json({ message: "El número de rastreo ya existe" }, { status: 409 });
    }
    console.error("POST /api/tickets error:", err);
    return NextResponse.json({ message: err?.message || "Error al crear ticket" }, { status: 500 });
  }
}
