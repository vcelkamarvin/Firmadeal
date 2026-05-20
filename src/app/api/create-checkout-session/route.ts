import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const PLAN_CONFIG = {
  basic:    { amount: 3900,  name: "Markttest Starter", description: "Ø 90–180 Tage · 250 Käufer/Monat · 0% Provision"    },
  advanced: { amount: 7900,  name: "Markttest Pro",     description: "Ø 60–120 Tage · 1.000 Käufer/Monat · 0% Provision"  },
  premium:  { amount: 19900, name: "Markttest Maximum", description: "Ø 30–90 Tage · 5.000+ Käufer/Monat · 0% Provision"  },
};

export async function POST(req: Request) {
  const { plan, listingId } = await req.json();

  const planData = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG];
  if (!planData) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      currency: "eur",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: planData.name, description: planData.description },
            unit_amount: planData.amount,
            recurring: { interval: "month" },
          },
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
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
