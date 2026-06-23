export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  buildSellerInquiryEmail,
  buildBuyerConfirmationEmail,
} from "@/lib/emails";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.firmadeal.de";

// Anon key is sufficient: RLS allows public INSERT on inquiries,
// and seller email lookup uses a SECURITY DEFINER function.
function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Simple in-memory rate limit: max 3 inquiries per IP per 10 minutes
const ipTimestamps = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const window = 10 * 60 * 1000;
  const hits = (ipTimestamps.get(ip) ?? []).filter((t) => now - t < window);
  hits.push(now);
  ipTimestamps.set(ip, hits);
  return hits.length > 3;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Zu viele Anfragen. Bitte warten." }, { status: 429 });
  }

  const { listing_id, sender_name, sender_email, sender_phone, message, inquiry_type } =
    await request.json();

  if (!listing_id || !sender_name || !sender_email || !message) {
    return NextResponse.json({ error: "Fehlende Pflichtfelder" }, { status: 400 });
  }

  // Basic email format check
  if (!sender_email.includes("@") || sender_email.length > 254) {
    return NextResponse.json({ error: "Ungültige E-Mail-Adresse" }, { status: 400 });
  }

  const supabase = anonClient();

  // 1. Fetch listing info (needed for email content + seller lookup)
  const { data: listing } = await supabase
    .from("listings")
    .select("title, user_id, city, region, country, category, asking_price, ebitda")
    .eq("id", listing_id)
    .eq("status", "active")
    .single();

  if (!listing) {
    return NextResponse.json({ error: "Inserat nicht gefunden" }, { status: 404 });
  }

  // 2. Insert inquiry — DB trigger auto-increments inquiries_count
  const { error: insertErr } = await supabase.from("inquiries").insert({
    listing_id,
    sender_name: sender_name.slice(0, 200),
    sender_email,
    sender_phone: sender_phone ? sender_phone.slice(0, 50) : null,
    message: message.slice(0, 5000),
    inquiry_type: inquiry_type ?? "inquiry",
  });

  if (insertErr) {
    console.error("[inquiries] insert error:", insertErr.message);
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  // 3. Get seller email via SECURITY DEFINER function (no service role needed)
  const { data: sellerEmailData } = await supabase
    .rpc("get_listing_seller_email", { p_listing_id: listing_id });
  const sellerEmail = sellerEmailData as string | null;

  // 4. Send emails fire-and-forget
  const resend = new Resend(process.env.RESEND_API_KEY);
  const listingUrl = `${SITE_URL}/listings/${listing_id}`;
  const listingTitle = listing.title ?? "Ihr Inserat";
  const listingLocation = [listing.city, listing.region, listing.country].filter(Boolean).join(", ") || null;

  if (sellerEmail) {
    resend.emails.send({
      from: "anfragen@firmadeal.de",
      to: sellerEmail,
      subject: `💬 Neue Kaufanfrage: ${listingTitle}`,
      html: buildSellerInquiryEmail({
        listingTitle,
        listingLocation,
        listingCategory: listing.category ?? null,
        listingPrice: listing.asking_price ?? null,
        listingEbitda: listing.ebitda ?? null,
        buyerName: sender_name,
        buyerEmail: sender_email,
        buyerPhone: sender_phone || null,
        message,
        listingUrl,
      }),
    }).catch((err) => console.error("[resend] seller email failed:", err?.message ?? err));
  }

  resend.emails.send({
    from: "noreply@firmadeal.de",
    to: sender_email,
    subject: `✓ Anfrage gesendet – Firmadeal`,
    html: buildBuyerConfirmationEmail({
      listingTitle,
      listingLocation,
      listingPrice: listing.asking_price ?? null,
      siteUrl: SITE_URL,
    }),
  }).catch((err) => console.error("[resend] buyer email failed:", err?.message ?? err));

  return NextResponse.json({ ok: true });
}
