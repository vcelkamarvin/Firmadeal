import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { listingId } = await req.json();

  const { data: listing } = await supabase
    .from("listings")
    .select("stripe_subscription_id")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .single();

  if (!listing?.stripe_subscription_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  try {
    await stripe.subscriptions.update(listing.stripe_subscription_id, {
      cancel_at_period_end: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe error";
    console.error("[cancel-subscription] Stripe error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  await supabase.from("listings")
    .update({ status: "cancelling" })
    .eq("id", listingId);

  return NextResponse.json({ success: true });
}
