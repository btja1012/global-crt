import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { db } from "@/lib/server-db";
import { comments } from "../../../../../shared/schema";
import { eq } from "drizzle-orm";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { commentId } = await params;
  const id = parseInt(commentId);
  if (isNaN(id)) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

  await db.delete(comments).where(eq(comments.id, id));
  return NextResponse.json({ message: "Deleted" });
}
