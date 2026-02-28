import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const IS_PROD = process.env.NODE_ENV === "production";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (IS_PROD && !secret) {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  return secret || "change-me-in-production";
}
const COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 8 * 60 * 60; // 8 hours

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function signToken(user: AuthUser): string {
  return jwt.sign(user, getJwtSecret(), { expiresIn: "8h" });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthUser;
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

// Supports up to 4 users via environment variables:
//   ADMIN_EMAIL / ADMIN_PASSWORD  (primary admin)
//   USER2_EMAIL / USER2_PASSWORD  (second admin)
//   USER3_EMAIL / USER3_PASSWORD  (third admin)
//   USER4_EMAIL / USER4_PASSWORD  (fourth admin)
export async function validateCredentials(email: string, password: string): Promise<AuthUser | null> {
  const accounts = [
    { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, id: "admin", firstName: "Admin", lastName: "" },
    { email: process.env.USER2_EMAIL, password: process.env.USER2_PASSWORD, id: "user2", firstName: "Admin", lastName: "2" },
    { email: process.env.USER3_EMAIL, password: process.env.USER3_PASSWORD, id: "user3", firstName: "Admin", lastName: "3" },
    { email: process.env.USER4_EMAIL, password: process.env.USER4_PASSWORD, id: "user4", firstName: "Admin", lastName: "4" },
  ];

  for (const acc of accounts) {
    if (!acc.email || !acc.password) continue;
    if (email !== acc.email) continue;
    // Support both bcrypt hashes (starts with $2) and plain text passwords (backward compat)
    const passwordMatch = acc.password.startsWith("$2")
      ? await bcrypt.compare(password, acc.password)
      : password === acc.password;
    if (!passwordMatch) return null;
    return { id: acc.id, email: acc.email, firstName: acc.firstName, lastName: acc.lastName };
  }

  return null;
}
