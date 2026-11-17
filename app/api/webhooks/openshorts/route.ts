import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const secret = process.env.OPENSHORTS_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook secret is not configured." }, { status: 503 });
  const raw = Buffer.from(await request.arrayBuffer());
  const received = request.headers.get("x-openshorts-signature") || "";
  const expected = "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });

  const event = JSON.parse(raw.toString("utf8"));
  // Persistence is intentionally delegated to the database integration added next.
  // Acknowledge only verified events; never infer campaign approval or earnings.
  console.info("Verified OpenShorts webhook", {
    event: event?.event, job_id: event?.job_id, status: event?.status,
    clip_count: Array.isArray(event?.clips) ? event.clips.length : 0
  });
  return NextResponse.json({ received: true });
}
