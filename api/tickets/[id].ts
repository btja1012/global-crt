import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../_auth";
import * as storage from "../_storage";
import { insertTicketSchema } from "../../shared/schema";
import { z } from "zod";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = requireAuth(req, res);
  if (!user) return;

  const id = Number(req.query.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid ticket ID" });
  }

  if (req.method === "GET") {
    const ticket = await storage.getTicket(id);
    if (!ticket) return res.status(404).json({ message: "Ticket no encontrado" });
    return res.status(200).json(ticket);
  }

  if (req.method === "PUT") {
    try {
      const input = insertTicketSchema.partial().parse(req.body);
      const updated = await storage.updateTicket(id, input);
      if (!updated) return res.status(404).json({ message: "Ticket no encontrado" });
      return res.status(200).json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join(".") });
      }
      throw err;
    }
  }

  if (req.method === "DELETE") {
    await storage.deleteTicket(id);
    return res.status(204).end();
  }

  return res.status(405).json({ message: "Method not allowed" });
}
