import type { VercelRequest, VercelResponse } from "@vercel/node";
import { requireAuth } from "../../_auth";
import * as storage from "../../_storage";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = requireAuth(req, res);
  if (!user) return;

  const ticketId = Number(req.query.ticketId);
  if (isNaN(ticketId)) {
    return res.status(400).json({ message: "Invalid ticket ID" });
  }

  if (req.method === "GET") {
    const result = await storage.getAttachments(ticketId);
    return res.status(200).json(result);
  }

  if (req.method === "POST") {
    const { fileName, fileData } = req.body || {};
    if (!fileName || !fileData) {
      return res.status(400).json({ message: "fileName and fileData (base64) are required" });
    }

    const attachment = await storage.createAttachment({
      ticketId,
      userId: user.id,
      fileName,
      fileUrl: fileData,
    });
    return res.status(201).json(attachment);
  }

  return res.status(405).json({ message: "Method not allowed" });
}
