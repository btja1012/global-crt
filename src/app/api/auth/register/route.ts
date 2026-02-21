import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/server-db";
import { users } from "../../../../../shared/models/auth";
import { getAuthUser } from "@/lib/server-auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { email, password, firstName, lastName } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ message: "Email y contraseña son requeridos" }, { status: 400 });
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return NextResponse.json({ message: "Ya existe un usuario con ese email" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [newUser] = await db.insert(users).values({
    email, passwordHash, firstName: firstName || null, lastName: lastName || null,
  }).returning({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName, createdAt: users.createdAt });

  return NextResponse.json(newUser, { status: 201 });
}
