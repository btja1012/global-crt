import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { db } from "@/lib/server-db";
import { tickets } from "../../../../../shared/schema";
import { desc } from "drizzle-orm";

function escapeCSV(value: unknown): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(tickets).orderBy(desc(tickets.createdAt));

  const headers = [
    "ID", "Número de Rastreo", "Cliente", "Origen", "Destino", "Estado",
    "Tipo de Servicio", "Tipo de Carga", "Dirección", "Proveedor",
    "Número BL/AWB", "ETA Puerto", "Tiempo de Tránsito",
    "Notas", "Asignado a", "Fecha de Creación",
  ];

  const csvRows = [
    headers.join(","),
    ...rows.map((t) => [
      t.id,
      t.trackingNumber,
      t.clientName,
      t.origin,
      t.destination,
      t.status,
      t.serviceType ?? "",
      t.cargoType ?? "",
      t.direction ?? "",
      t.supplier ?? "",
      t.blNumber ?? t.awbNumber ?? "",
      t.etaPort ?? "",
      t.transitTime ?? "",
      t.notes ?? "",
      t.assignedTo ?? "",
      t.createdAt ? new Date(t.createdAt).toLocaleDateString("es-CR") : "",
    ].map(escapeCSV).join(",")),
  ];

  const csv = csvRows.join("\n");
  const filename = `ordenes-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
