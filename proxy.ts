import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

/**
 * Gate the admin area. Runs before rendering (Next 16 "proxy" — the renamed
 * middleware; defaults to the Node runtime). It's a convenience gate only —
 * every admin Server Action / page also calls requireAdmin() (defense in depth,
 * since Server Actions are directly POST-reachable).
 */
export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (await verifySession(token)) return NextResponse.next();

  // Unauthenticated:
  if (request.nextUrl.pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  // Protect /admin and everything under it EXCEPT /admin/login, plus /api/admin/*.
  matcher: ["/admin", "/admin/((?!login).*)", "/api/admin/:path*"],
};
