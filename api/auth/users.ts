import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db";
import { users } from "../../shared/models/auth";
import { requireAuth } from "../_auth";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireAuth(req, res)) return;

  if (req.method === "GET") {
    const list = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      createdAt: users.createdAt,
    }).from(users).orderBy(users.createdAt);
    return res.status(200).json(list);
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "ID requerido" });
    }
    await db.delete(users).where(eq(users.id, id));
    return res.status(200).json({ message: "Usuario eliminado" });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
