import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export const PLANS = {
  base: {
    name: "Base",
    price: 4900, // cents
    duration_months: 4,
    description: "4 Monate aktiv",
  },
  plus: {
    name: "Plus",
    price: 8900,
    duration_months: 6,
    description: "6 Monate aktiv",
  },
  premium: {
    name: "Premium",
    price: 14900,
    duration_months: 8,
    description: "8 Monate aktiv",
  },
} as const;
