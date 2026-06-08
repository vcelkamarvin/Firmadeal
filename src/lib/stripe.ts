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
  test: {
    name: "Firmadeal Listing",
    price: 8700, // cents, one-time
    description: "Inserat · 4.000 Käufer/Monat · Newsletter · Pipeline",
  },
} as const;
