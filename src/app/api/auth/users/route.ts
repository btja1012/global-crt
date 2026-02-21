import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server-db";
import { users } from "../../../../../shared/models/auth";
import { getAuthUser } from "@/lib/server-auth";
import { eq } from "drizzle-orm";

export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const list = await db.select({
    id: users.id, email: users.email, firstName: users.firstName,
    lastName: users.lastName, createdAt: users.createdAt,
  }).from(users).orderBy(users.createdAt);

  return NextResponse.json(list);
}

export async function DELETE(req: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ message: "ID requerido" }, { status: 400 });

  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ message: "Usuario eliminado" });
}
