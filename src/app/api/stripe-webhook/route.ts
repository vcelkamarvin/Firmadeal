export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { buildTrialWelcomeEmail, buildTrialEndingEmail } from "@/lib/emails";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.firmadeal.de";

const PLAN_PRICES: Record<string, string> = {
  monthly: "39", yearly: "189", test: "87",
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
    // Payment completed — listing goes LIVE immediately
    case "checkout.session.completed": {
      const listingId = obj.metadata?.listing_id;
      const plan = obj.metadata?.plan ?? "test";
      if (!listingId) break;

      const planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      await supabase.from("listings").update({
        status: "active",
        plan,
        trial_ends_at: null,
        plan_expires_at: planExpiresAt,
        stripe_subscription_id: obj.subscription ?? null,
        stripe_customer_id: obj.customer ?? null,
        featured: plan === "yearly",
      }).eq("id", listingId);

      // Send trial welcome email to seller
      const { data: activatedListing } = await supabase
        .from("listings")
        .select("user_id")
        .eq("id", listingId)
        .single();

      if (activatedListing?.user_id) {
        const { data: welcomeProfile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", activatedListing.user_id)
          .single();

        if (welcomeProfile?.email) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          const welcomePrice = PLAN_PRICES[plan ?? "monthly"] ?? "39";
          await resend.emails.send({
            from: "noreply@firmadeal.de",
            to: welcomeProfile.email,
            subject: "🎉 Ihr Inserat ist live – 7 Tage kostenlos",
            html: buildTrialWelcomeEmail({
              price: welcomePrice,
              dashboardUrl: `${SITE_URL}/dashboard`,
            }),
          }).catch((err) => { console.error("[resend] webhook email failed:", err?.message ?? err); });
        }
      }
      break;
    }

    // Trial ending soon (Stripe fires 3 days before trial_end)
    case "customer.subscription.trial_will_end": {
      const subId = obj.id;
      const plan = obj.metadata?.plan ?? obj.items?.data?.[0]?.price?.metadata?.plan;

      // trial_end is a Unix timestamp on the subscription object
      const trialEndTs: number = obj.trial_end ?? Date.now() / 1000 + 3 * 86400;
      const trialEndDate = new Date(trialEndTs * 1000).toLocaleDateString("de-DE", {
        day: "numeric",
        month: "long",
      });

      const { data: listing } = await supabase
        .from("listings")
        .select("id, plan, user_id, views_count, inquiries_count, transferability_score")
        .eq("stripe_subscription_id", subId)
        .single();

      if (listing) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", listing.user_id)
          .single();

        const sellerEmail = profile?.email;
        const planKey = listing.plan ?? plan ?? "monthly";
        const price = PLAN_PRICES[planKey] ?? "39";

        if (sellerEmail) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          await resend.emails.send({
            from: "noreply@firmadeal.de",
            to: sellerEmail,
            subject: "⚠️ Ihr Testzeitraum endet in 3 Tagen",
            html: buildTrialEndingEmail({
              price,
              trialEndDate,
              viewsCount: listing.views_count ?? 0,
              inquiriesCount: listing.inquiries_count ?? 0,
              transferabilityScore: listing.transferability_score ?? null,
              dashboardUrl: `${SITE_URL}/dashboard`,
            }),
          }).catch((err) => { console.error("[resend] webhook email failed:", err?.message ?? err); });
        }
      }
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
