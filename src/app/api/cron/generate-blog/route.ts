export const dynamic = "force-dynamic";
export const maxDuration = 30;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Daily BACKSTOP for the blog content engine.
// Primary trigger = GitHub Actions cron (09:00 Berlin / 07:00 UTC).
// This Vercel cron runs at 08:00 UTC (10:00 Berlin) — one hour later — and ONLY
// re-triggers the GitHub workflow if no article was published today. That makes
// it idempotent: on normal days the primary already published, so we skip and
// never double-publish. On days the GitHub cron silently missed, we recover it.

const REPO = "vcelkamarvin/Firmadeal";
const WORKFLOW = "seo-content.yml";

// YYYY-MM-DD in Europe/Berlin (DST-safe)
function berlinDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-CA", { timeZone: "Europe/Berlin" });
}

export async function GET(req: Request) {
  // If CRON_SECRET is configured, require it. Vercel sends it automatically as
  // `Authorization: Bearer <CRON_SECRET>` on scheduled invocations.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 1) Was an article already published today (Berlin time)?
  let publishedToday = false;
  let lastSeen: string | null = null;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const db = createClient(url, key, { auth: { persistSession: false } });
      const { data } = await db
        .from("blog_posts")
        .select("created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(1);
      lastSeen = data?.[0]?.created_at ?? null;
      publishedToday = !!lastSeen && berlinDate(lastSeen) === berlinDate(new Date());
    }
  } catch (e) {
    console.error("[cron] supabase check failed:", e instanceof Error ? e.message : e);
  }

  if (publishedToday) {
    return NextResponse.json({ ok: true, action: "skipped", reason: "already_published_today", lastSeen });
  }

  // 2) Primary cron missed today — trigger the GitHub Actions workflow as backstop.
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    console.error("[cron] GITHUB_DISPATCH_TOKEN missing — cannot run backstop");
    return NextResponse.json(
      { ok: false, action: "blocked", reason: "missing_github_token" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/actions/workflows/${WORKFLOW}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
          "User-Agent": "firmadeal-cron-backstop",
        },
        // force=true bypasses the 09:00-Berlin time-guard since we are recovering a missed slot
        body: JSON.stringify({ ref: "main", inputs: { count: "2", force: "true" } }),
      }
    );

    if (res.status === 204) {
      return NextResponse.json({ ok: true, action: "dispatched", workflow: WORKFLOW });
    }
    const detail = await res.text();
    console.error("[cron] dispatch failed:", res.status, detail);
    return NextResponse.json({ ok: false, action: "dispatch_failed", status: res.status, detail }, { status: 502 });
  } catch (e) {
    console.error("[cron] dispatch error:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, action: "error" }, { status: 500 });
  }
}
