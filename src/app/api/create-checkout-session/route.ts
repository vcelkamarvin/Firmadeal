export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const { plan, listingId } = await req.json();

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
    metadata: { listing_id: listingId ?? "", plan: plan ?? "test" },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment_success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/sell?step=4`,
  };

  console.log("[checkout] Creating session:", JSON.stringify(sessionParams, null, 2));

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log("[checkout] Session created:", session.id, "url:", session.url);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[checkout] Stripe error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
