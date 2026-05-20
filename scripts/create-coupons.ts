import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

async function createCoupons() {
  const coupons = [
    {
      name: "FRÜHJAHR2026 — 1 Monat kostenlos",
      percent_off: 100,
      duration: "once" as const,
      id: "FRUEHJAHR2026",
    },
    {
      name: "LAUNCH50 — 50% erster Monat",
      percent_off: 50,
      duration: "once" as const,
      id: "LAUNCH50",
    },
    {
      name: "MAKLER50 — 50% erster Monat",
      percent_off: 50,
      duration: "once" as const,
      id: "MAKLER50",
    },
    {
      name: "STEUERBERATER — 50% erster Monat",
      percent_off: 50,
      duration: "once" as const,
      id: "STEUERBERATER",
    },
  ];

  for (const coupon of coupons) {
    try {
      const created = await stripe.coupons.create(coupon);
      console.log(`✅ Created: ${created.id}`);
    } catch (e: any) {
      if (e.code === "resource_already_exists") {
        console.log(`⚠️  Already exists: ${coupon.id}`);
      } else {
        console.error(`❌ Error: ${coupon.id}`, e.message);
      }
    }
  }
}

createCoupons();
