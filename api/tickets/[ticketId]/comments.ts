import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../../_auth";
import * as storage from "../../_storage";
import { z } from "zod";

const commentInput = z.object({ content: z.string().min(1) });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = requireAuth(req, res);
  if (!user) return;

  const ticketId = Number(req.query.ticketId);
  if (isNaN(ticketId)) {
    return res.status(400).json({ message: "Invalid ticket ID" });
  }

  if (req.method === "GET") {
    const result = await storage.getComments(ticketId);
    return res.status(200).json(result);
  }

  if (req.method === "POST") {
    try {
      const { content } = commentInput.parse(req.body);
      const comment = await storage.createComment({
        ticketId,
        userId: user.id,
        userName: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Admin",
        content,
      });
      return res.status(201).json(comment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
