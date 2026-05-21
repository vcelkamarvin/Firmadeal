import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.firmadeal.de";

const PLAN_PRICES: Record<string, string> = {
  basic: "39", advanced: "79", premium: "199",
};

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
      const subId = obj.id;
      const customerId = obj.customer;
      const plan = obj.metadata?.plan ?? obj.items?.data?.[0]?.price?.metadata?.plan;

      // Find listing + seller email
      const { data: listing } = await supabase
        .from("listings")
        .select("id, plan, user_id")
        .eq("stripe_subscription_id", subId)
        .single();

      if (listing) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", listing.user_id)
          .single();

        const sellerEmail = profile?.email;
        const planKey = listing.plan ?? plan ?? "basic";
        const price = PLAN_PRICES[planKey] ?? "39";

        if (sellerEmail) {
          await resend.emails.send({
            from: "noreply@firmadeal.de",
            to: sellerEmail,
            subject: "Ihr Firmadeal-Testzeitraum endet in 3 Tagen",
            text: `Ihr 7-tägiger Markttest auf Firmadeal endet in 3 Tagen.
Ab dann wird Ihre Karte mit €${price}/Monat belastet.
Sie können jederzeit in Ihrem Dashboard kündigen.

Zum Dashboard → ${SITE_URL}/dashboard

— Das Firmadeal Team`,
          }).catch(() => {});
        }
      }

      void customerId; // referenced via listing lookup
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
