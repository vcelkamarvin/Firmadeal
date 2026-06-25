export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { BRANCHEN as PSEO_BRANCHEN, REGIONEN as PSEO_REGIONEN } from "../../../unternehmenswert/pseoData";

const SITE = "https://www.firmadeal.de";
const FROM = "Firmadeal <noreply@firmadeal.de>";
const eur = (n: number | null) => (n ? "€" + Math.round(n).toLocaleString("de-DE") : "");

type Lead = {
  id: string;
  email: string;
  branche: string | null;
  region: string | null;
  value_low: number | null;
  value_high: number | null;
};

// Deep-link to the matching programmatic valuation page when we can resolve it.
function valHref(branche: string | null, region: string | null): string {
  const b = branche ? PSEO_BRANCHEN.find((x) => x.calc === branche) : undefined;
  const r = region ? PSEO_REGIONEN.find((x) => x.name === region) : undefined;
  return b && r ? `${SITE}/unternehmenswert/${b.slug}/${r.slug}` : `${SITE}/unternehmenswert`;
}
function brancheLabel(branche: string | null): string {
  const b = branche ? PSEO_BRANCHEN.find((x) => x.calc === branche) : undefined;
  return b?.label ?? (branche || "Ihr Unternehmen");
}

function shell(eyebrow: string, headline: string, sub: string, bodyHtml: string): string {
  return `
<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#15281e">
  <div style="background:#1a3329;color:#fff;padding:28px 28px 24px;border-radius:14px 14px 0 0">
    <div style="font-size:18px;font-weight:700">Firmadeal</div>
    <div style="font-size:13px;color:#8fcfb0;letter-spacing:2px;margin-top:14px">${eyebrow}</div>
    <div style="font-size:24px;font-weight:700;margin-top:6px">${headline}</div>
    ${sub ? `<div style="font-size:14px;color:#cfe3d7;margin-top:4px">${sub}</div>` : ""}
  </div>
  <div style="background:#f3efe7;padding:24px 28px;border-radius:0 0 14px 14px">
    ${bodyHtml}
    <p style="font-size:12px;color:#6b7d72;margin-top:22px;line-height:1.5">
      Firmadeal · vertraulicher Unternehmensverkauf in DE · AT · CH · ${SITE}
    </p>
  </div>
</div>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0"><tr><td style="background:#1a3329;border-radius:10px"><a href="${href}" style="display:inline-block;color:#ffffff;text-decoration:none;padding:14px 24px;font-weight:700;font-size:15px">${label}</a></td></tr></table>`;
}

function step2Email(lead: Lead) {
  const label = brancheLabel(lead.branche);
  const href = valHref(lead.branche, lead.region);
  const body = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px">vor ein paar Tagen haben Sie den Wert für <b>${label}${lead.region ? " in " + lead.region : ""}</b> berechnet. Hier kurz, worauf ein <b>echter Käufer</b> achtet:</p>
    <ul style="font-size:15px;line-height:1.7;margin:0 0 16px;padding-left:18px">
      <li><b>EBITDA-Multiplikator</b> der Branche — der Hebel auf den Preis.</li>
      <li><b>Wiederkehrende Umsätze</b> &amp; geringe Inhaberabhängigkeit erhöhen den Faktor.</li>
      <li><b>Saubere Zahlen &amp; Dokumentation</b> verkürzen die Prüfung und stützen den Preis.</li>
    </ul>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px">Ihre aktualisierte Spanne und die Kennzahlen für Ihre Branche &amp; Region sehen Sie hier:</p>
    ${button(href, "Bewertung &amp; Marktdaten ansehen &rarr;")}
  `;
  return { subject: `Wie Käufer ${label} wirklich bewerten`, html: shell("TEIL 2 · BEWERTUNG", "Was Ihren Wert bestimmt", "", body) };
}

function step3Email(lead: Lead) {
  const label = brancheLabel(lead.branche);
  const range = lead.value_low && lead.value_high ? `${eur(lead.value_low)} – ${eur(lead.value_high)}` : "";
  const body = `
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px">eine indikative Bewertung ist der erste Schritt${range ? ` — bei Ihnen rund <b>${range}</b>` : ""}. Den echten Preis bestimmt der Markt.</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px">Über Firmadeal reichen Sie ${label} <b>anonym</b> ein und werden direkt mit geprüften Käufern zusammengebracht — <b>0 % Provision</b>, kein Makler, einmalig <b>€87</b>. Sie bleiben bis zum Erstkontakt vollständig vertraulich.</p>
    ${button(`${SITE}/sell`, "Unternehmen vertraulich einreichen &rarr;")}
    <p style="font-size:13px;line-height:1.6;margin:14px 0 0;color:#52635a">Lieber erst schauen, wer sucht? <a href="${SITE}/kaufgesuche" style="color:#2d5a3d">Aktuelle Kaufgesuche ansehen</a>.</p>
  `;
  return { subject: `Vertraulich verkaufen – 0 % Provision, einmalig €87`, html: shell("TEIL 3 · VERKAUFEN", "Bereit für den nächsten Schritt?", "", body) };
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: false, reason: "missing_supabase" }, { status: 503 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ ok: false, reason: "missing_resend" }, { status: 503 });

  const db = createClient(url, key, { auth: { persistSession: false } });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const now = Date.now();
  const iso = (msAgo: number) => new Date(now - msAgo).toISOString();
  const DAY = 86_400_000;
  const cols = "id, email, branche, region, value_low, value_high";

  const result = { step2_sent: 0, step3_sent: 0, errors: 0 };

  // ── Step 2: leads created 2–7 days ago, not yet sent ──
  const { data: due2 } = await db
    .from("valuation_leads")
    .select(cols)
    .is("nurture_step2_sent_at", null)
    .lte("created_at", iso(2 * DAY))
    .gte("created_at", iso(7 * DAY))
    .limit(80);

  for (const lead of (due2 as Lead[]) ?? []) {
    try {
      const { subject, html } = step2Email(lead);
      await resend.emails.send({ from: FROM, to: lead.email, subject, html });
      await db.from("valuation_leads").update({ nurture_step2_sent_at: new Date().toISOString() }).eq("id", lead.id);
      result.step2_sent++;
    } catch (e) {
      result.errors++;
      console.error("[nurture] step2 failed:", lead.id, e instanceof Error ? e.message : e);
    }
  }

  // ── Step 3: leads created 5–12 days ago, not yet sent ──
  const { data: due3 } = await db
    .from("valuation_leads")
    .select(cols)
    .is("nurture_step3_sent_at", null)
    .lte("created_at", iso(5 * DAY))
    .gte("created_at", iso(12 * DAY))
    .limit(80);

  for (const lead of (due3 as Lead[]) ?? []) {
    try {
      const { subject, html } = step3Email(lead);
      await resend.emails.send({ from: FROM, to: lead.email, subject, html });
      await db.from("valuation_leads").update({ nurture_step3_sent_at: new Date().toISOString() }).eq("id", lead.id);
      result.step3_sent++;
    } catch (e) {
      result.errors++;
      console.error("[nurture] step3 failed:", lead.id, e instanceof Error ? e.message : e);
    }
  }

  return NextResponse.json({ ok: true, ...result });
}
