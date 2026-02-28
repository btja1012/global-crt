import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { db } from "@/lib/server-db";
import { tickets } from "../../../../../shared/schema";
import { isNotNull, desc } from "drizzle-orm";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const deleted = await db
    .select()
    .from(tickets)
    .where(isNotNull(tickets.deletedAt))
    .orderBy(desc(tickets.deletedAt));

  return NextResponse.json(deleted);
}
