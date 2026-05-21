import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const COUPONS = [
  {
    id: "FRUEHJAHR2026",
    name: "1 Monat kostenlos (100%)",
    percent_off: 100,
    duration: "once" as const,
  },
  {
    id: "LAUNCH50",
    name: "50% erster Monat",
    percent_off: 50,
    duration: "once" as const,
  },
  {
    id: "MAKLER50",
    name: "50% erster Monat — Makler",
    percent_off: 50,
    duration: "once" as const,
  },
  {
    id: "STEUERBERATER",
    name: "50% erster Monat — Steuerberater",
    percent_off: 50,
    duration: "once" as const,
  },
];

async function recreateCoupons() {
  console.log("Deleting old coupons...");
  for (const coupon of COUPONS) {
    try {
      await stripe.coupons.del(coupon.id);
      console.log(`🗑️  Deleted: ${coupon.id}`);
    } catch {
      console.log(`⚠️  Not found (skipping delete): ${coupon.id}`);
    }
  }

  console.log("\nCreating new coupons...");
  for (const coupon of COUPONS) {
    try {
      const created = await stripe.coupons.create(coupon);
      console.log(`✅ Created: ${created.id} — ${coupon.percent_off}% off`);
    } catch (e: any) {
      console.error(`❌ Failed: ${coupon.id} — ${e.message}`);
    }
  }

  console.log("\nVerifying...");
  for (const coupon of COUPONS) {
    try {
      const c = await stripe.coupons.retrieve(coupon.id);
      console.log(`✅ Verified: ${c.id} — valid: ${c.valid}`);
    } catch {
      console.log(`❌ Not found: ${coupon.id}`);
    }
  }
}

recreateCoupons().catch(console.error);
