import type { VercelRequest, VercelResponse } from "@vercel/node";
import { seedDatabase } from "./_storage";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const seedKey = process.env.SEED_KEY;
  const providedKey = req.headers["x-seed-key"] || req.query.key;

  if (seedKey && providedKey !== seedKey) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await seedDatabase();
  return res.status(200).json({ message: "Database seeded" });
}
