import Stripe from "stripe";

let _stripe: Stripe | null = null;
export function getStripeClient(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-02-24.acacia",
    });
  }
  return _stripe;
}

// Keep backward-compat named export for existing callers
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripeClient() as never as Record<string | symbol, unknown>)[prop];
  },
});

export const PLANS = {
  base: {
    name: "Basic",
    price: 3900, // cents / month
    description: "1 aktives Inserat · 3 Monate",
    duration_months: 3,
  },
  plus: {
    name: "Advanced",
    price: 7900,
    description: "3 aktive Inserate · 6 Monate · Featured",
    duration_months: 6,
  },
  premium: {
    name: "Premium",
    price: 19900,
    description: "Unbegrenzt · 12 Monate · Top-Placement · Beratung",
    duration_months: 12,
  },
} as const;
