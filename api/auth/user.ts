import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUser } from "../_auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = getUser(req);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.status(200).json(user);
}
