import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const PRICE_IDS: Record<string, string> = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID!,
  yearly:  process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID!,
};

export async function POST(req: Request) {
  const { plan, listingId } = await req.json();

  const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const sessionParams = {
    mode: "subscription" as const,
    payment_method_types: ["card" as const],
    allow_promotion_codes: true,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: 7,
      metadata: { listing_id: listingId ?? "", plan },
    },
    metadata: { listing_id: listingId ?? "", plan },
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?trial_started=true&plan=${plan}`,
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
