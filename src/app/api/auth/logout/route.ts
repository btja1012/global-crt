import { NextResponse } from "next/server";
import { clearCookieHeader } from "@/lib/server-auth";

export async function POST() {
  return NextResponse.json({ message: "Logged out" }, {
    headers: { "Set-Cookie": clearCookieHeader() }
  });
}
