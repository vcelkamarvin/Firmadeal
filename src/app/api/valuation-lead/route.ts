export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.firmadeal.de";
const eur = (n: number) => "€" + Math.round(n || 0).toLocaleString("de-DE");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const branche = body.branche ?? null;
    const region = body.region ?? null;
    const umsatz = Number.isFinite(+body.umsatz) ? Math.round(+body.umsatz) : null;
    const ebitda = Number.isFinite(+body.ebitda) ? Math.round(+body.ebitda) : null;
    const growth = Number.isFinite(+body.growth) ? Math.round(+body.growth) : null;
    const valueLow = Number.isFinite(+body.valueLow) ? Math.round(+body.valueLow) : null;
    const valueHigh = Number.isFinite(+body.valueHigh) ? Math.round(+body.valueHigh) : null;

    let stored = false;
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
      );
      const { error } = await supabase.from("valuation_leads").insert({
        email, branche, region, umsatz, ebitda, growth,
        value_low: valueLow, value_high: valueHigh, source: "unternehmenswert",
      });
      if (error) console.error("[valuation-lead] insert failed:", error.message);
      else stored = true;
    } catch (e) {
      console.error("[valuation-lead] supabase error:", e instanceof Error ? e.message : e);
    }

    let emailed = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const range = valueLow && valueHigh ? `${eur(valueLow)} – ${eur(valueHigh)}` : "Ihre Bewertung";
        const html = `
<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#15281e">
  <div style="background:#1a3329;color:#fff;padding:28px 28px 24px;border-radius:14px 14px 0 0">
    <div style="font-size:18px;font-weight:700">Firmadeal</div>
    <div style="font-size:13px;color:#8fcfb0;letter-spacing:2px;margin-top:14px">IHRE INDIKATIVE BEWERTUNG</div>
    <div style="font-size:30px;font-weight:700;margin-top:6px">${range}</div>
    <div style="font-size:14px;color:#cfe3d7;margin-top:4px">${branche ?? ""}${region ? " · " + region : ""}</div>
  </div>
  <div style="background:#f3efe7;padding:24px 28px;border-radius:0 0 14px 14px">
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px">
      Vielen Dank für Ihr Interesse. Die oben genannte Spanne ist eine indikative Schätzung auf Basis
      branchenüblicher EBITDA-Multiplikatoren — keine verbindliche Wertermittlung.
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 18px">
      Möchten Sie wissen, was ein <b>echter Käufer</b> für Ihr Unternehmen zahlen würde? Reichen Sie Ihr
      Unternehmen vertraulich ein — anonym, ohne Makler, <b>0% Provision</b>, einmalig €87.
    </p>
    <a href="${SITE}/sell" style="display:inline-block;background:#1a3329;color:#fff;text-decoration:none;
      padding:13px 22px;border-radius:10px;font-weight:700;font-size:15px">Käufer finden →</a>
    <p style="font-size:12px;color:#6b7d72;margin-top:22px;line-height:1.5">
      Firmadeal · vertraulicher Unternehmensverkauf in DE · AT · CH · ${SITE}
    </p>
  </div>
</div>`;
        await resend.emails.send({
          from: "Firmadeal <noreply@firmadeal.de>",
          to: email,
          subject: "Ihre indikative Unternehmensbewertung — Firmadeal",
          html,
        });
        emailed = true;
      } catch (e) {
        console.error("[valuation-lead] resend error:", e instanceof Error ? e.message : e);
      }
    } else {
      console.error("[valuation-lead] RESEND_API_KEY missing");
    }

    return NextResponse.json({ ok: true, stored, emailed });
  } catch (e) {
    console.error("[valuation-lead] fatal:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
