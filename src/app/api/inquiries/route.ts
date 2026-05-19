import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.firmadeal.de";

export async function POST(request: NextRequest) {
  const { listing_id, sender_name, sender_email, sender_phone, message, inquiry_type } =
    await request.json();

  if (!listing_id || !sender_name || !sender_email || !message) {
    return NextResponse.json({ error: "Fehlende Pflichtfelder" }, { status: 400 });
  }

  const supabase = adminClient();

  // 1. Insert inquiry
  const { error: insertErr } = await supabase.from("inquiries").insert({
    listing_id,
    sender_name,
    sender_email,
    sender_phone: sender_phone || null,
    message,
    inquiry_type: inquiry_type ?? "inquiry",
  });
  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // 2. Increment inquiries_count
  // Increment inquiries_count manually
  const { data: listing } = await supabase
    .from("listings")
    .select("title, user_id, inquiries_count")
    .eq("id", listing_id)
    .single();

  if (listing) {
    await supabase
      .from("listings")
      .update({ inquiries_count: (listing.inquiries_count ?? 0) + 1 })
      .eq("id", listing_id);
  }

  // 3. Get seller email from auth
  const listingTitle = listing?.title ?? "Ihr Inserat";
  let sellerEmail: string | null = null;
  let sellerName: string | null = null;

  if (listing?.user_id) {
    const { data: userData } = await supabase.auth.admin.getUserById(listing.user_id);
    sellerEmail = userData?.user?.email ?? null;
    sellerName = userData?.user?.user_metadata?.full_name ?? null;
  }

  // 4. Send emails (fire-and-forget — don't fail the request if email fails)
  const phoneDisplay = sender_phone || "nicht angegeben";
  const listingUrl = `${SITE_URL}/listings/${listing_id}`;

  if (sellerEmail) {
    await resend.emails.send({
      from: "anfragen@firmadeal.de",
      to: sellerEmail,
      subject: `💬 Neue Käuferanfrage: ${listingTitle}`,
      text: `Guten Tag ${sellerName ?? ""},

Sie haben eine neue Kaufanfrage für Ihr Inserat erhalten:
"${listingTitle}"

─────────────────────────
VON: ${sender_name}
E-MAIL: ${sender_email}
TELEFON: ${phoneDisplay}

NACHRICHT:
${message}
─────────────────────────

Antworten Sie direkt an ${sender_email}.

Ihr Inserat auf Firmadeal ansehen →
${listingUrl}

— Das Firmadeal Team`,
    }).catch(() => {});
  }

  await resend.emails.send({
    from: "noreply@firmadeal.de",
    to: sender_email,
    subject: `Ihre Anfrage wurde gesendet — ${listingTitle}`,
    text: `Ihre Anfrage wurde erfolgreich übermittelt.

Der Anbieter meldet sich in der Regel innerhalb von 24–48 Stunden bei Ihnen.

Weitere Inserate entdecken → ${SITE_URL}/listings

— Das Firmadeal Team`,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
