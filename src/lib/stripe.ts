import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
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
