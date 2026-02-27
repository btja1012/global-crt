import { NextResponse } from "next/server";
import { getAuthUser, signToken, authCookieHeader } from "@/lib/server-auth";

export async function POST() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  // Issue a fresh 8h token, extending the session
  const token = signToken(user);
  return NextResponse.json(user, { headers: { "Set-Cookie": authCookieHeader(token) } });
}
