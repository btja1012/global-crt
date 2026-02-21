import type { VercelRequest, VercelResponse } from "@vercel/node";
import { validateCredentials, signToken, setAuthCookie } from "../_auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña son requeridos" });
  }

  try {
    const user = await validateCredentials(email, password);
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }
    const token = signToken(user);
    setAuthCookie(res, token);
    return res.status(200).json(user);
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
}
