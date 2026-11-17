import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const API_BASE = (process.env.OPENSHORTS_API_URL || "https://api.openshorts.app").replace(/\/$/, "");

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENSHORTS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OpenShorts is not configured. Add OPENSHORTS_API_KEY in Vercel environment variables." }, { status: 503 });

  const body = await request.json().catch(() => null);
  const sourceUrl = typeof body?.sourceUrl === "string" ? body.sourceUrl.trim() : "";
  const rightsConfirmed = body?.rightsConfirmed === true;
  if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//i.test(sourceUrl)) {
    return NextResponse.json({ error: "Enter a valid YouTube video URL." }, { status: 400 });
  }
  if (!rightsConfirmed) return NextResponse.json({ error: "Confirm that you own the video or have permission to process it." }, { status: 400 });

  const webhookSecret = process.env.OPENSHORTS_WEBHOOK_SECRET;
  const origin = request.nextUrl.origin;
  const payload: Record<string, unknown> = {
    url: sourceUrl,
    acknowledged: true,
    output_format: "vertical",
    layouts: ["auto"],
    ...(webhookSecret ? {
      webhook_url: origin + "/api/webhooks/openshorts",
      webhook_secret: webhookSecret
    } : {})
  };

  const response = await fetch(API_BASE + "/api/process", {
    method: "POST",
    headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store"
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return NextResponse.json({ error: result?.detail?.error || result?.detail || result?.error || "OpenShorts request failed.", details: result }, { status: response.status });
  return NextResponse.json({ ...result, status: result.status || "queued" });
}
