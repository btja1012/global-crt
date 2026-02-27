import { NextRequest, NextResponse } from "next/server";
import { validateCredentials, signToken, authCookieHeader } from "@/lib/server-auth";
import { rateLimit } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const limit = rateLimit(`login:${ip}`);
  if (!limit.ok) {
    return NextResponse.json(
      { message: `Demasiados intentos. Intente en ${limit.retryAfter} segundos.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ message: "Email y contraseña son requeridos" }, { status: 400 });
    }
    const user = await validateCredentials(email, password);
    if (!user) {
      return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
    }
    const token = signToken(user);
    return NextResponse.json(user, { headers: { "Set-Cookie": authCookieHeader(token) } });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
  }
}
