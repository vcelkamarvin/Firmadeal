export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Logs every *genuine* calculator estimate (branche × region × EBITDA → value range)
// into valuation_estimates. This is what turns the /unternehmenswert pages into a
// proprietary benchmark set ("based on N valuations, a Pflegedienst in Bayern at
// €X EBITDA lands at €Y"). The client only calls this after a real user interaction
// (never on the on-mount default), and dedupes per settled input signature.
//
// NOTE: unlike the legacy homepage calculator, we do NOT invent placeholder inputs.
// Fields the calculator does not collect (annual_revenue, years_in_operation,
// employees) are left NULL rather than written as constants.

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const brancheSlug = typeof body.brancheSlug === "string" ? body.brancheSlug.trim() : "";
    const regionSlug = typeof body.regionSlug === "string" ? body.regionSlug.trim() : "";
    const brancheLabel = typeof body.branche === "string" ? body.branche.trim() : null;

    const ebitda = Number.isFinite(+body.ebitda) ? Math.round(+body.ebitda) : null;
    const growth = Number.isFinite(+body.growth) ? Math.round(+body.growth) : null;
    const valueLow = Number.isFinite(+body.valueLow) ? Math.round(+body.valueLow) : null;
    const valueHigh = Number.isFinite(+body.valueHigh) ? Math.round(+body.valueHigh) : null;

    // Guard against junk / default-only writes. A benchmark row is only meaningful
    // with a known branche+region and a positive EBITDA that produced a value range.
    if (!brancheSlug || !regionSlug || !ebitda || ebitda <= 0 || !valueLow || !valueHigh) {
      return NextResponse.json({ ok: false, error: "invalid_estimate" }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.error("[valuation-estimate] supabase env missing");
      return NextResponse.json({ ok: false, error: "server_misconfigured" }, { status: 500 });
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await supabase.from("valuation_estimates").insert({
      business_type: brancheLabel,   // human label, kept for back-compat with existing column
      branche: brancheSlug,          // canonical slug — join key for the pSEO pages
      region: regionSlug,            // canonical slug
      ebitda,
      growth,
      estimated_value_low: valueLow,
      estimated_value_high: valueHigh,
      source: "unternehmenswert",
    });

    // The whole point of this route is that insert failures are LOUD, not swallowed
    // like the previous client-side `catch {}`.
    if (error) {
      console.error("[valuation-estimate] insert failed:", error.message);
      return NextResponse.json({ ok: false, error: "insert_failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, stored: true });
  } catch (e) {
    console.error("[valuation-estimate] fatal:", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
