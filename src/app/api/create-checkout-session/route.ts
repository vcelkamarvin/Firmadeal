export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listingId } = await req.json();
  if (!listingId) return NextResponse.json({ error: "Missing listingId" }, { status: 400 });

  const { data: listing } = await supabase
    .from("listings")
    .select("id, status, plan")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .single();

  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  // Guard against duplicate payment for the same listing
  if (listing.plan || listing.status === "active") {
    return NextResponse.json({ error: "already_paid", url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` }, { status: 409 });
  }

  const sessionParams = {
    mode: "payment" as const,
    payment_method_types: ["card" as const],
    allow_promotion_codes: true,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: 8700, // €87.00 one-time
          product_data: {
            name: "Firmadeal — Unternehmensinserat",
          },
        },
        quantity: 1,
      },
    ],
    metadata: { listing_id: listingId, plan: "test" },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment_success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/sell?step=4`,
  };

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[checkout] Stripe error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
