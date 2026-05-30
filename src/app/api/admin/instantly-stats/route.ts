import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.INSTANTLY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "INSTANTLY_API_KEY not set" }, { status: 500 });
  }

  const res = await fetch(
    "https://api.instantly.ai/api/v1/analytics/campaign/summary",
    {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 300 },
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Instantly API error: ${res.status}`, detail: text }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
