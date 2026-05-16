import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const supabase = createClient();
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

  await stripe.subscriptions.update(listing.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  await supabase.from("listings")
    .update({ status: "cancelling" })
    .eq("id", listingId);

  return NextResponse.json({ success: true });
}
