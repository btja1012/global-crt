import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "./_db";
import { users } from "../shared/models/auth";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function signToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export function getUser(req: VercelRequest): AuthUser | null {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/auth_token=([^;]+)/);
  if (!match) return null;
  return verifyToken(match[1]);
}

export function requireAuth(req: VercelRequest, res: VercelResponse): AuthUser | null {
  const user = getUser(req);
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  return user;
}

export async function validateCredentials(email: string, password: string): Promise<AuthUser | null> {
  // Try DB first if available
  if (db) {
    try {
      const [dbUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (dbUser) {
        const isValid = await bcrypt.compare(password, dbUser.passwordHash);
        if (!isValid) return null;
        return {
          id: dbUser.id,
          email: dbUser.email,
          firstName: dbUser.firstName || "",
          lastName: dbUser.lastName || "",
        };
      }
    } catch (err) {
      console.error("DB error in validateCredentials:", err);
      // Fall through to env var check
    }
  }

  // Fallback: env var admin
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) return null;
  if (email !== adminEmail) return null;

  const isValid = adminPassword.startsWith("$2")
    ? await bcrypt.compare(password, adminPassword)
    : password === adminPassword;

  if (!isValid) return null;

  // Auto-create admin in DB if available
  if (db) {
    try {
      const hash = adminPassword.startsWith("$2")
        ? adminPassword
        : await bcrypt.hash(adminPassword, 10);
      await db.insert(users).values({
        email: adminEmail,
        passwordHash: hash,
        firstName: "Admin",
        lastName: "",
      }).onConflictDoNothing();
    } catch {
      // Non-critical, ignore
    }
  }

  return { id: "admin", email: adminEmail, firstName: "Admin", lastName: "" };
}

export function setAuthCookie(res: VercelResponse, token: string) {
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  res.setHeader(
    "Set-Cookie",
    `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}${isProduction ? "; Secure" : ""}`
  );
}

export function clearAuthCookie(res: VercelResponse) {
  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  res.setHeader(
    "Set-Cookie",
    `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${isProduction ? "; Secure" : ""}`
  );
}
