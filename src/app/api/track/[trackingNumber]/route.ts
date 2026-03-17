import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/server-db";
import { tickets } from "../../../../../shared/schema";
import { eq } from "drizzle-orm";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ trackingNumber: string }> }) {
  const { trackingNumber } = await params;

  const [ticket] = await db.select({
    trackingNumber: tickets.trackingNumber,
    origin: tickets.origin,
    destination: tickets.destination,
    status: tickets.status,
    cargoType: tickets.cargoType,
    createdAt: tickets.createdAt,
    updatedAt: tickets.updatedAt,
  }).from(tickets).where(eq(tickets.trackingNumber, trackingNumber));

  if (!ticket) {
    return NextResponse.json({ message: "Orden no encontrada" }, { status: 404 });
  }

  return NextResponse.json(ticket, {
    headers: { "Cache-Control": "public, s-maxage=60" },
  });
}
