import { NextRequest, NextResponse } from "next/server";
import { validateCredentials, signToken, authCookieHeader } from "@/lib/server-auth";

export async function POST(req: NextRequest) {
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
