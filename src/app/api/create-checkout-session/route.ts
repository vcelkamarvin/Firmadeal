import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const PLAN_CONFIG = {
  base:    { amount: 3900,  name: "Firmadeal Basic",    description: "Ø 89 Tage · 250 Aufrufe/Monat · 0% Provision"    },
  plus:    { amount: 7900,  name: "Firmadeal Advanced",  description: "Ø 52 Tage · 1.000 Aufrufe/Monat · 0% Provision"  },
  premium: { amount: 19900, name: "Firmadeal Premium",   description: "Ø 31 Tage · 5.000+ Aufrufe/Monat · 0% Provision" },
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
