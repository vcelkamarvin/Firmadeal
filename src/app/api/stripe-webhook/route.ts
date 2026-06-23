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

// Anon key is sufficient — all DB writes go through SECURITY DEFINER functions
// that bypass RLS without exposing full service-role access.
function anonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
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
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = anonClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = event.data.object as any;

  switch (event.type) {
    // Payment completed — listing goes LIVE
    case "checkout.session.completed": {
      const listingId = (obj.metadata as Record<string, string>)?.listing_id;
      const plan = (obj.metadata as Record<string, string>)?.plan ?? "test";
      if (!listingId) break;

      const planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

      await supabase.rpc("activate_listing_after_payment", {
        p_listing_id:             listingId,
        p_plan:                   plan,
        p_plan_expires_at:        planExpiresAt,
        p_stripe_subscription_id: (obj.subscription as string) ?? null,
        p_stripe_customer_id:     (obj.customer as string) ?? null,
        p_featured:               plan === "yearly",
      });

      // Get seller email via SECURITY DEFINER function
      const { data: sellerEmail } = await supabase
        .rpc("get_listing_seller_email", { p_listing_id: listingId });

      if (sellerEmail) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const welcomePrice = PLAN_PRICES[plan] ?? "87";
        resend.emails.send({
          from: "noreply@firmadeal.de",
          to: sellerEmail as string,
          subject: "🎉 Ihr Inserat ist jetzt live – Firmadeal",
          html: buildTrialWelcomeEmail({
            price: welcomePrice,
            dashboardUrl: `${SITE_URL}/dashboard`,
          }),
        }).catch((err) => console.error("[resend] webhook email failed:", err?.message ?? err));
      }
      break;
    }

    // Trial ending soon
    case "customer.subscription.trial_will_end": {
      const subId = obj.id as string;
      const trialEndTs = (obj.trial_end as number) ?? Date.now() / 1000 + 3 * 86400;
      const trialEndDate = new Date(trialEndTs * 1000).toLocaleDateString("de-DE", {
        day: "numeric", month: "long",
      });

      const { data: rows } = await supabase
        .rpc("get_listing_for_webhook", { p_stripe_subscription_id: subId });

      const listing = Array.isArray(rows) ? rows[0] : null;
      if (!listing) break;

      const { data: sellerEmail } = await supabase
        .rpc("get_listing_seller_email", { p_listing_id: listing.id });

      if (sellerEmail) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const price = PLAN_PRICES[listing.plan ?? "monthly"] ?? "39";
        resend.emails.send({
          from: "noreply@firmadeal.de",
          to: sellerEmail as string,
          subject: "⚠️ Ihr Testzeitraum endet in 3 Tagen",
          html: buildTrialEndingEmail({
            price,
            trialEndDate,
            viewsCount:           listing.views_count ?? 0,
            inquiriesCount:       listing.inquiries_count ?? 0,
            transferabilityScore: listing.transferability_score ?? null,
            dashboardUrl:         `${SITE_URL}/dashboard`,
          }),
        }).catch((err) => console.error("[resend] webhook email failed:", err?.message ?? err));
      }
      break;
    }

    // Payment succeeded after trial — clear trial marker
    case "invoice.payment_succeeded": {
      const subId = obj.subscription as string;
      if (subId) {
        await supabase.rpc("clear_trial_after_payment", {
          p_stripe_subscription_id: subId,
        });
      }
      break;
    }

    // Subscription cancelled — expire listing
    case "customer.subscription.deleted": {
      await supabase.rpc("expire_listing_on_subscription_deleted", {
        p_stripe_subscription_id: obj.id as string,
      });
      break;
    }

    // Payment failed — pause listing
    case "invoice.payment_failed": {
      const subId = obj.subscription as string;
      if (subId) {
        await supabase.rpc("pause_listing_on_payment_failed", {
          p_stripe_subscription_id: subId,
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

export const preferredRegion = "auto";
