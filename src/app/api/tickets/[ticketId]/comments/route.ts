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

  const { ticketId } = await params;
  const body = await req.json();
  const [newComment] = await db.insert(comments).values({ ...body, ticketId: parseInt(ticketId) }).returning();
  return NextResponse.json(newComment, { status: 201 });
}
