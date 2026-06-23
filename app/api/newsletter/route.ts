import { NextResponse, type NextRequest } from "next/server";
import { subscribeNewsletter } from "@/lib/newsletter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { email?: string };

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  try {
    const result = await subscribeNewsletter(email);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signup failed";
    console.error("[newsletter]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}