import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
const API_BASE = (process.env.OPENSHORTS_API_URL || "https://api.openshorts.app").replace(/\/$/, "");

export async function GET(_request: NextRequest, context: { params: Promise<{ jobId: string }> }) {
  const apiKey = process.env.OPENSHORTS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OpenShorts is not configured." }, { status: 503 });
  const { jobId } = await context.params;
  if (!/^[a-zA-Z0-9_-]{6,100}$/.test(jobId)) return NextResponse.json({ error: "Invalid job ID." }, { status: 400 });
  const response = await fetch(API_BASE + "/api/status/" + encodeURIComponent(jobId), {
    headers: { "Authorization": "Bearer " + apiKey }, cache: "no-store"
  });
  const data = await response.json().catch(() => ({}));
  return NextResponse.json(data, { status: response.status });
}
