import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { db } from "@/lib/server-db";
import { comments } from "../../../../../../shared/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { ticketId } = await params;
  const result = await db.select().from(comments).where(eq(comments.ticketId, parseInt(ticketId))).orderBy(desc(comments.createdAt));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { ticketId } = await params;
    const body = await req.json();
    const userName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
    const [newComment] = await db.insert(comments).values({
      ticketId: parseInt(ticketId),
      userId: user.id,
      userName,
      content: body.content,
    }).returning();
    return NextResponse.json(newComment, { status: 201 });
  } catch (err: any) {
    console.error("POST /comments error:", err);
    return NextResponse.json({ message: err?.message || "Error al agregar comentario" }, { status: 500 });
  }
}
