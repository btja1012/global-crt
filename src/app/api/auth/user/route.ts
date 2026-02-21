import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/server-auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(user);
  } catch (err) {
    console.error("Auth user error:", err);
    return NextResponse.json({ message: "Error interno" }, { status: 500 });
  }
}
