import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "./server-db";
import { users } from "../../shared/models/auth";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";
const IS_PROD = process.env.NODE_ENV === "production";
const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

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

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function authCookieHeader(token: string): string {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}${IS_PROD ? "; Secure" : ""}`;
}

export function clearCookieHeader(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${IS_PROD ? "; Secure" : ""}`;
}

export async function validateCredentials(email: string, password: string): Promise<AuthUser | null> {
  try {
    const [dbUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (dbUser) {
      const isValid = await bcrypt.compare(password, dbUser.passwordHash);
      if (!isValid) return null;
      return { id: dbUser.id, email: dbUser.email, firstName: dbUser.firstName || "", lastName: dbUser.lastName || "" };
    }
  } catch (err) {
    console.error("DB error in validateCredentials:", err);
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword || email !== adminEmail) return null;

  const isValid = adminPassword.startsWith("$2")
    ? await bcrypt.compare(password, adminPassword)
    : password === adminPassword;
  if (!isValid) return null;

  try {
    const hash = adminPassword.startsWith("$2") ? adminPassword : await bcrypt.hash(adminPassword, 10);
    await db.insert(users).values({ email: adminEmail, passwordHash: hash, firstName: "Admin", lastName: "" }).onConflictDoNothing();
  } catch {}

  return { id: "admin", email: adminEmail, firstName: "Admin", lastName: "" };
}
