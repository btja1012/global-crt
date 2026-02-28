import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { db } from "@/lib/server-db";
import { tickets } from "../../../../../shared/schema";
import { max } from "drizzle-orm";

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]).map((h) => h.replace(/^"|"$/g, "").trim());
  return lines
    .slice(1)
    .map((line) => {
      const values = parseCSVLine(line);
      const row: Record<string, string> = {};
      headers.forEach((h, i) => {
        row[h] = (values[i] || "").replace(/^"|"$/g, "").trim();
      });
      return row;
    })
    .filter((row) => Object.values(row).some((v) => v));
}

const VALID_STATUSES = ["Nuevo", "En Proceso", "Aduana", "En Tránsito", "Entregado"];
const VALID_SERVICE_TYPES = ["Marítimo", "Terrestre", "Aéreo", "Agencia Aduanal"];
const VALID_DIRECTIONS = ["Import", "Export"];

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let csvText = "";
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("csv") as File | null;
    if (!file) return NextResponse.json({ message: "No se recibió ningún archivo" }, { status: 400 });
    csvText = await file.text();
  } else {
    csvText = await req.text();
  }

  const rows = parseCSV(csvText);
  if (rows.length === 0) {
    return NextResponse.json({ message: "CSV vacío o formato inválido" }, { status: 400 });
  }

  // Get next tracking number
  const [{ maxNum }] = await db.select({ maxNum: max(tickets.trackingNumber) }).from(tickets);
  let nextNum = (parseInt(maxNum || "0") || 4687) + 1;

  const results = { imported: 0, skipped: 0, errors: [] as string[] };

  for (const row of rows) {
    // Support both English and Spanish column names
    const clientName = row["clientName"] || row["cliente"] || row["Cliente"] || row["client_name"];
    const origin = row["origin"] || row["origen"] || row["Origen"];
    const destination = row["destination"] || row["destino"] || row["Destino"];

    if (!clientName || !origin || !destination) {
      results.skipped++;
      results.errors.push(`Faltan campos requeridos: clientName, origin, destination`);
      continue;
    }

    const rawStatus = row["status"] || row["estado"] || row["Estado"] || "Nuevo";
    const status = VALID_STATUSES.includes(rawStatus) ? rawStatus : "Nuevo";

    const rawServiceType = row["serviceType"] || row["tipoServicio"] || row["tipo_servicio"] || "";
    const serviceType = VALID_SERVICE_TYPES.includes(rawServiceType) ? rawServiceType : undefined;

    const rawDirection = row["direction"] || row["direccion"] || row["Direccion"] || "";
    const direction = VALID_DIRECTIONS.includes(rawDirection) ? rawDirection : undefined;

    const cargoType = row["cargoType"] || row["tipoCarga"] || row["tipo_carga"] || null;
    const trackingNumber = row["trackingNumber"] || row["tracking"] || String(nextNum++);

    try {
      await db.insert(tickets).values({
        trackingNumber,
        clientName,
        origin,
        destination,
        status: status as any,
        serviceType: serviceType as any,
        direction: direction as any,
        cargoType: cargoType || null,
      });
      results.imported++;
    } catch (err: any) {
      results.skipped++;
      if (err?.code === "23505") {
        results.errors.push(`Número de rastreo duplicado: ${trackingNumber}`);
      } else {
        results.errors.push(`Error en fila ${trackingNumber}: ${err?.message}`);
      }
    }
  }

  return NextResponse.json(results);
}
