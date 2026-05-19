import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = adminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = event.data.object as any;

  switch (event.type) {
    // Trial started — listing goes LIVE immediately
    case "checkout.session.completed": {
      const listingId = obj.metadata?.listing_id;
      const plan = obj.metadata?.plan;
      if (!listingId) break;

      const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await supabase.from("listings").update({
        status: "active",
        plan,
        trial_ends_at: trialEndsAt,
        plan_expires_at: planExpiresAt,
        stripe_subscription_id: obj.subscription ?? null,
        stripe_customer_id: obj.customer ?? null,
        featured: plan === "advanced" || plan === "premium",
      }).eq("id", listingId);
      break;
    }

    // Trial ending soon (Stripe fires 3 days before)
    case "customer.subscription.trial_will_end": {
      console.log("Trial ending soon for subscription:", obj.id);
      // TODO: Send reminder email via Resend
      break;
    }

    // Payment succeeded after trial — clear trial marker
    case "invoice.payment_succeeded": {
      const subId = obj.subscription;
      if (subId) {
        await supabase.from("listings")
          .update({ trial_ends_at: null })
          .eq("stripe_subscription_id", subId);
      }
      break;
    }

    // Subscription cancelled or payment failed — pause listing
    case "customer.subscription.deleted": {
      await supabase.from("listings")
        .update({ status: "expired" })
        .eq("stripe_subscription_id", obj.id);
      break;
    }

    case "invoice.payment_failed": {
      if (obj.subscription) {
        await supabase.from("listings")
          .update({ status: "paused" })
          .eq("stripe_subscription_id", obj.subscription);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

export const preferredRegion = "auto";
