export const dynamic = "force-dynamic";
export const maxDuration = 30;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Daily WATCHDOG backstop for the blog content engine.
// Primary trigger = GitHub Actions cron (two early staggered slots: 07:17 & 08:37 Berlin).
// This Vercel cron runs at 09:09 Berlin (07:09 UTC) — AFTER both early GitHub slots — and
// ONLY re-triggers the GitHub workflow if no PUBLISHED post exists today (Europe/Berlin).
// Idempotent: on normal days the primary already published, so we skip and never
// double-publish. On days GitHub dropped its cron, we recover the day.
// Requires GITHUB_DISPATCH_TOKEN (PAT with workflow scope) in Vercel env (Production).

const REPO = "vcelkamarvin/Firmadeal";
const WORKFLOW = "seo-content.yml";

// YYYY-MM-DD in Europe/Berlin (DST-safe)
function berlinDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-CA", { timeZone: "Europe/Berlin" });
}

// Ops alert on any non-200 outcome. This cron runs once/day, so at most one email
// per day. Degrades to a console.error when no alert creds are configured — the
// point is that this route no longer rots silently the way it did for ~3 weeks.
async function alertOps(subject: string, html: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL || process.env.ADMIN_EMAIL;
  if (!key || !to) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Firmadeal <noreply@firmadeal.de>", to, subject, html }),
    });
  } catch (e) {
    console.error("[watchdog] alert send failed:", e instanceof Error ? e.message : e);
  }
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
    console.error("[watchdog] supabase check failed:", e instanceof Error ? e.message : e);
  }

  if (publishedToday) {
    return NextResponse.json({ ok: true, action: "skipped", reason: "already_published_today", lastSeen });
  }

  // 2) Primary cron missed today — trigger the GitHub Actions workflow as backstop.
  const token = process.env.GITHUB_DISPATCH_TOKEN;
  if (!token) {
    console.error("[watchdog] GITHUB_DISPATCH_TOKEN missing — cannot run backstop");
    await alertOps(
      "⚠️ Firmadeal blog watchdog blocked — no GITHUB_DISPATCH_TOKEN",
      "No article was published today and the watchdog cannot trigger the backstop because <code>GITHUB_DISPATCH_TOKEN</code> is missing in the Vercel environment. Set a GitHub PAT with <b>Actions: read & write</b> (fine-grained) or <b>workflow</b> (classic) scope for <code>vcelkamarvin/Firmadeal</code>."
    );
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
          "User-Agent": "firmadeal-blog-watchdog",
        },
        // force=false: rely on the generator Europe/Berlin idempotent guard as the final dedupe (a redundant dispatch can never double-publish)
        body: JSON.stringify({ ref: "main", inputs: { count: "1", force: "false" } }),
      }
    );

    if (res.status === 204) {
      return NextResponse.json({ ok: true, action: "dispatched", workflow: WORKFLOW });
    }
    const detail = await res.text();
    console.error("[watchdog] dispatch failed:", res.status, detail);
    await alertOps(
      "⚠️ Firmadeal blog watchdog — workflow dispatch failed",
      `No post today and the backstop dispatch to <code>${WORKFLOW}</code> returned HTTP ${res.status}. Detail: <pre>${detail}</pre> A 401/403 usually means the token is expired or lacks Actions scope; a 404 means the repo/workflow path is wrong.`
    );
    return NextResponse.json({ ok: false, action: "dispatch_failed", status: res.status, detail }, { status: 502 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[watchdog] dispatch error:", msg);
    await alertOps("⚠️ Firmadeal blog watchdog — unhandled error", `The watchdog threw while dispatching the content workflow: <pre>${msg}</pre>`);
    return NextResponse.json({ ok: false, action: "error" }, { status: 500 });
  }
}
