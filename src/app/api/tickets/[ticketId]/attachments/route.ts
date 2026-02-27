import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { db } from "@/lib/server-db";
import { attachments } from "../../../../../../shared/schema";
import { eq, desc } from "drizzle-orm";

// ~5MB raw → base64 is ~37% larger
const MAX_BASE64_LENGTH = Math.ceil(5 * 1024 * 1024 * 1.37);

const ALLOWED_MIME_PREFIXES = [
  "data:image/jpeg",
  "data:image/png",
  "data:image/gif",
  "data:image/webp",
  "data:application/pdf",
  "data:text/plain",
  "data:application/msword",
  "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "data:application/vnd.ms-excel",
  "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { ticketId } = await params;
  const id = parseInt(ticketId);
  if (isNaN(id)) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

  const result = await db.select().from(attachments).where(eq(attachments.ticketId, id)).orderBy(desc(attachments.createdAt));
  return NextResponse.json(result);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ ticketId: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { ticketId } = await params;
    const id = parseInt(ticketId);
    if (isNaN(id)) return NextResponse.json({ message: "ID inválido" }, { status: 400 });

    const body = await req.json();

    if (!body.fileData || !body.fileName) {
      return NextResponse.json({ message: "fileData y fileName son requeridos" }, { status: 400 });
    }

    // Validate file type
    const isAllowedType = ALLOWED_MIME_PREFIXES.some((prefix) => body.fileData.startsWith(prefix));
    if (!isAllowedType) {
      return NextResponse.json(
        { message: "Tipo de archivo no permitido. Use imágenes, PDF, Word o Excel." },
        { status: 400 }
      );
    }

    // Validate file size
    if (body.fileData.length > MAX_BASE64_LENGTH) {
      return NextResponse.json({ message: "El archivo supera el límite de 5MB" }, { status: 400 });
    }

    const [newAttachment] = await db.insert(attachments).values({
      ticketId: id,
      userId: user.id,
      fileName: body.fileName,
      fileUrl: body.fileData,
    }).returning();

    return NextResponse.json(newAttachment, { status: 201 });
  } catch (err: any) {
    console.error("POST /attachments error:", err);
    return NextResponse.json({ message: err?.message || "Error al subir archivo" }, { status: 500 });
  }
}
