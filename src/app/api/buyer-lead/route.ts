export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.firmadeal.de";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "invalid_email" }, { status: 400 });
    }

    const name = body.name ?? null;
    const buyerType = body.buyerType ?? null;
    const branchen = Array.isArray(body.branchen) ? body.branchen : null;
    const regionen = Array.isArray(body.regionen) ? body.regionen : null;
    const budgetMin = Number.isFinite(+body.budgetMin) ? Math.round(+body.budgetMin) : null;
    const budgetMax = Number.isFinite(+body.budgetMax) ? Math.round(+body.budgetMax) : null;
    const note = body.note ?? null;

    let stored = false;
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } }
      );
      const { error } = await supabase.from("buyer_leads").insert({
        email, name, buyer_type: buyerType, branchen, regionen,
        budget_min: budgetMin, budget_max: budgetMax, note, source: "kaeufer",
      });
      if (error) console.error("[buyer-lead] insert failed:", error.message);
      else stored = true;
    } catch (e) {
      console.error("[buyer-lead] supabase error:", e instanceof Error ? e.message : e);
    }

    let emailed = false;
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const interests = (branchen || []).join(", ");
        const html = `
<div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;color:#15281e">
  <div style="background:#1a3329;color:#fff;padding:28px;border-radius:14px 14px 0 0">
    <div style="font-size:18px;font-weight:700">Firmadeal</div>
    <div style="font-size:13px;color:#8fcfb0;letter-spacing:2px;margin-top:14px">KÄUFER-NETZWERK</div>
    <div style="font-size:24px;font-weight:700;margin-top:6px">Willkommen an Bord.</div>
  </div>
  <div style="background:#f3efe7;padding:24px 28px;border-radius:0 0 14px 14px">
    <p style="font-size:15px;line-height:1.6;margin:0 0 14px">
      Vielen Dank — Sie sind jetzt Teil des privaten Käufer-Netzwerks von Firmadeal.
      ${interests ? `Wir haben Ihr Interesse an <b>${interests}</b> gespeichert.` : ""}
    </p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 18px">
      Sobald ein passendes Unternehmen verfügbar ist, melden wir uns — diskret und zuerst bei Ihnen.
      In der Zwischenzeit können Sie die aktuell kuratierten Mandate ansehen.
    </p>
    <a href="${SITE}/listings" style="display:inline-block;background:#1a3329;color:#fff;text-decoration:none;
      padding:13px 22px;border-radius:10px;font-weight:700;font-size:15px">Aktuelle Mandate ansehen →</a>
    <p style="font-size:12px;color:#6b7d72;margin-top:22px;line-height:1.5">
      Firmadeal · vertraulicher Unternehmensverkauf in DE · AT · CH · ${SITE}
    </p>
  </div>
</div>`;
        await resend.emails.send({
          from: "Firmadeal <noreply@firmadeal.de>",
          to: email,
          subject: "Willkommen im Käufer-Netzwerk — Firmadeal",
          html,
        });
        emailed = true;
      } catch (e) {
        console.error("[buyer-lead] resend error:", e instanceof Error ? e.message : e);
      }
    } else {
      console.error("[buyer-lead] RESEND_API_KEY missing");
    }

    return NextResponse.json({ ok: true, stored, emailed });
  } catch (e) {
    console.error("[buyer-lead] fatal:", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
