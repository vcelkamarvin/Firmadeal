import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Use service role for webhook (bypasses RLS)
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as {
      metadata: { plan?: string; listing_id?: string };
      customer_details?: { email?: string };
      amount_total?: number;
      id: string;
    };

    const { plan, listing_id } = session.metadata;

    if (!plan || !listing_id) {
      return NextResponse.json({ received: true });
    }

    const planConfig = PLANS[plan as keyof typeof PLANS];
    if (!planConfig) {
      return NextResponse.json({ received: true });
    }

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + planConfig.duration_months);

    const supabase = createAdminClient();

    // Update listing
    await supabase
      .from("listings")
      .update({
        status: "active",
        plan,
        plan_expires_at: expiresAt.toISOString(),
        featured: plan === "plus" || plan === "premium",
      })
      .eq("id", listing_id);

    // Record payment
    await supabase.from("payments").insert({
      listing_id,
      stripe_session_id: session.id,
      plan,
      amount: session.amount_total ?? planConfig.price,
    });
  }

  return NextResponse.json({ received: true });
}

export const config = {
  api: { bodyParser: false },
};
