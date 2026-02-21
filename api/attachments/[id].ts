import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../_auth";
import * as storage from "../_storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = requireAuth(req, res);
  if (!user) return;

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const id = Number(req.query.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid attachment ID" });
  }

  await storage.deleteAttachment(id);
  return res.status(204).end();
}
