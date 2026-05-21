import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import {
  buildSellerInquiryEmail,
  buildBuyerConfirmationEmail,
} from "@/lib/emails";

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
    .select("title, user_id, inquiries_count, location, category, price, ebitda")
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

  if (listing?.user_id) {
    const { data: userData } = await supabase.auth.admin.getUserById(listing.user_id);
    sellerEmail = userData?.user?.email ?? null;
  }

  // 4. Send emails (fire-and-forget — don't fail the request if email fails)
  const listingUrl = `${SITE_URL}/listings/${listing_id}`;

  if (sellerEmail) {
    await resend.emails.send({
      from: "anfragen@firmadeal.de",
      to: sellerEmail,
      subject: `💬 Neue Kaufanfrage: ${listingTitle}`,
      html: buildSellerInquiryEmail({
        listingTitle,
        listingLocation: listing?.location ?? null,
        listingCategory: listing?.category ?? null,
        listingPrice: listing?.price ?? null,
        listingEbitda: listing?.ebitda ?? null,
        buyerName: sender_name,
        buyerEmail: sender_email,
        buyerPhone: sender_phone || null,
        message,
        listingUrl,
      }),
    }).catch(() => {});
  }

  await resend.emails.send({
    from: "noreply@firmadeal.de",
    to: sender_email,
    subject: `✓ Anfrage gesendet – Firmadeal`,
    html: buildBuyerConfirmationEmail({
      listingTitle,
      listingLocation: listing?.location ?? null,
      listingPrice: listing?.price ?? null,
      siteUrl: SITE_URL,
    }),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
