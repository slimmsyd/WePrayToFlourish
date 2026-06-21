import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "./auth";

/** True if the current request carries a valid admin session cookie. */
export async function getSession(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySession(token);
}

/** Throw if the caller is not an authenticated admin (defense in depth). */
export async function requireAdmin(): Promise<void> {
  if (!(await getSession())) throw new Error("Unauthorized");
}
