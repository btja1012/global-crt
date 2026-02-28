import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";
import { db } from "@/lib/server-db";
import { attachments } from "../../../../../../shared/schema";
import { eq, desc } from "drizzle-orm";
import { put } from "@vercel/blob";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_MIME_TYPES = [
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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

    const contentType = req.headers.get("content-type") || "";

    let fileBuffer: Buffer;
    let fileName: string;
    let mimeType: string;

    if (contentType.includes("multipart/form-data")) {
      // Real file upload via FormData
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) return NextResponse.json({ message: "Archivo requerido" }, { status: 400 });

      mimeType = file.type;
      fileName = file.name;
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
    } else {
      // Legacy base64 path (backward compat)
      const body = await req.json();
      if (!body.fileData || !body.fileName) {
        return NextResponse.json({ message: "fileData y fileName son requeridos" }, { status: 400 });
      }
      const match = (body.fileData as string).match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return NextResponse.json({ message: "Formato de archivo inválido" }, { status: 400 });
      mimeType = match[1];
      fileName = body.fileName;
      fileBuffer = Buffer.from(match[2], "base64");
    }

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json({ message: "Tipo de archivo no permitido. Use imágenes, PDF, Word o Excel." }, { status: 400 });
    }
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "El archivo supera el límite de 5MB" }, { status: 400 });
    }

    // Upload to Vercel Blob
    const blob = await put(`attachments/${id}/${Date.now()}-${fileName}`, fileBuffer, {
      access: "public",
      contentType: mimeType,
    });

    const [newAttachment] = await db.insert(attachments).values({
      ticketId: id,
      userId: user.id,
      fileName,
      fileUrl: blob.url,
    }).returning();

    return NextResponse.json(newAttachment, { status: 201 });
  } catch (err: any) {
    console.error("POST /attachments error:", err);
    return NextResponse.json({ message: err?.message || "Error al subir archivo" }, { status: 500 });
  }
}
