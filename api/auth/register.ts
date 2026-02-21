import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { db } from "../_db";
import { users } from "../../shared/models/auth";
import { requireAuth } from "../_auth";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!requireAuth(req, res)) return;

  const { email, password, firstName, lastName } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son requeridos" });
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    return res.status(409).json({ message: "Ya existe un usuario con ese email" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [newUser] = await db.insert(users).values({
    email,
    passwordHash,
    firstName: firstName || null,
    lastName: lastName || null,
  }).returning({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName, createdAt: users.createdAt });

  return res.status(201).json(newUser);
}
