import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

// Simple single-owner admin auth using a signed, HttpOnly cookie.
const COOKIE_NAME = "jj_admin";
const SESSION_VALUE = "owner";

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "dev-insecure-secret-change-me";
}

function sign(value: string): string {
  const sig = createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${sig}`;
}

function verify(token: string | undefined): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return false;
  const value = token.slice(0, idx);
  const expected = sign(value);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b) && value === SESSION_VALUE;
}

/** Validate the owner password from the login form. */
export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createSessionCookie() {
  cookies().set(COOKIE_NAME, sign(SESSION_VALUE), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function destroySessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export function isAuthenticated(): boolean {
  return verify(cookies().get(COOKIE_NAME)?.value);
}
