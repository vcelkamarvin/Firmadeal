"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { PLANS } from "@/components/PricingCards";

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface Props {
  plan: "base" | "plus" | "premium";
  onBack: () => void;
}

export default function StripeEmbeddedCheckout({ plan, onBack }: Props) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const planInfo = PLANS.find((p) => p.id === plan);

  useEffect(() => {
    fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.clientSecret) setClientSecret(d.clientSecret);
        else setError(d.error || "Unbekannter Fehler");
      })
      .catch(() => setError("Netzwerkfehler beim Laden der Zahlungsseite"))
      .finally(() => setLoading(false));
  }, [plan]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !stripePromise) return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-8 text-center">
      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-red-500 text-xl">!</span>
      </div>
      <h3 className="font-sans text-[16px] font-bold text-[var(--ink)] mb-2">Zahlung nicht verfügbar</h3>
      <p className="font-sans text-[13px] text-[var(--muted)] mb-2">
        {error || "Stripe ist nicht konfiguriert."}
      </p>
      <p className="font-sans text-[11px] text-[var(--muted)] mb-6">
        Bitte fügen Sie <code className="bg-[var(--surface2)] px-1 rounded">STRIPE_SECRET_KEY</code> und{" "}
        <code className="bg-[var(--surface2)] px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> in <code className="bg-[var(--surface2)] px-1 rounded">.env.local</code> ein.
      </p>
      <button onClick={onBack} className="font-sans text-sm text-[var(--accent)] hover:underline">
        ← Zurück zur Planauswahl
      </button>
    </div>
  );

  return (
    <div>
      {/* Plan summary */}
      {planInfo && (
        <div className="bg-[var(--accent-light)] border border-[var(--accent)]/20 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="font-sans text-[13px] font-bold text-[var(--accent)]">
              {planInfo.name} — €{planInfo.price}/Monat
            </p>
            <p className="font-sans text-[12px] text-[var(--muted)]">
              {planInfo.duration.de} · {planInfo.commission}
            </p>
          </div>
          <button onClick={onBack} className="font-sans text-[12px] text-[var(--muted)] hover:text-[var(--ink)]">
            Ändern
          </button>
        </div>
      )}

      {/* Embedded Stripe Checkout */}
      <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>
    </div>
  );
}
