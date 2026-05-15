import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { plan, listing_id } = await request.json();

    if (!plan || !PLANS[plan as keyof typeof PLANS]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Firmadeal ${planConfig.name}`,
              description: `${planConfig.description} – DACH-Marktplatz`,
            },
            unit_amount: planConfig.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${siteUrl}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${siteUrl}/sell`,
      metadata: {
        plan,
        listing_id: listing_id ?? "",
      },
      payment_intent_data: {
        metadata: {
          plan,
          listing_id: listing_id ?? "",
        },
      },
      locale: "de",
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe session error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
