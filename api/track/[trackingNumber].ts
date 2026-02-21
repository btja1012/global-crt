import type { VercelRequest, VercelResponse } from "@vercel/node";
import { db } from "../_db";
import { tickets } from "../../shared/schema";
import { eq } from "drizzle-orm";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const trackingNumber = String(req.query.trackingNumber || "").trim();
  if (!trackingNumber) {
    return res.status(400).json({ message: "Tracking number required" });
  }

  const [ticket] = await db
    .select({
      // Only expose public, non-sensitive fields
      trackingNumber: tickets.trackingNumber,
      origin: tickets.origin,
      destination: tickets.destination,
      status: tickets.status,
      cargoType: tickets.cargoType,
      createdAt: tickets.createdAt,
      updatedAt: tickets.updatedAt,
      // Deliberately omit: clientName, notes, assignedTo, id
    })
    .from(tickets)
    .where(eq(tickets.trackingNumber, trackingNumber));

  if (!ticket) {
    return res.status(404).json({ message: "Envío no encontrado" });
  }

  res.setHeader("Cache-Control", "public, s-maxage=60, stale-while-revalidate=120");
  return res.status(200).json(ticket);
}
