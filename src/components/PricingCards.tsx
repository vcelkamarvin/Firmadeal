"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { PLANS } from "@/data/plans";

// Re-export PLANS for any existing consumers
export { PLANS };

interface PricingCardsProps {
  onSelectPlan?: (planId: "basic" | "advanced" | "premium") => void;
  loadingPlan?: string | null;
}

export default function PricingCards({ onSelectPlan, loadingPlan }: PricingCardsProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl flex flex-col ${
              plan.highlight
                ? "border-2 border-[var(--accent)] shadow-[0_8px_40px_rgba(26,51,41,0.12)]"
                : "border border-[var(--border)]"
            }`}
          >
            {/* Badge */}
            {plan.badge && (
              <div
                className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-sans text-[11px] font-bold whitespace-nowrap ${
                  plan.badgeColor === "green"
                    ? "bg-[var(--accent)] text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                {plan.badge}
              </div>
            )}

            <div className="p-7 flex-1 flex flex-col">
              {/* Plan name */}
              <h3 className="font-sans text-[12px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2">
                {plan.name}
              </h3>

              {/* Advanced social proof line */}
              {plan.id === "advanced" && (
                <p style={{
                  fontSize: 12,
                  color: "#2d5a3d",
                  fontWeight: 500,
                  marginBottom: 8,
                  fontFamily: "Helvetica Neue, Arial, sans-serif",
                }}>
                  4× mehr Käufer als Basic · Ø 60 Tage schneller
                </p>
              )}

              {/* Trial badge */}
              <div className="inline-flex items-center gap-1.5 bg-[var(--accent-light)] text-[var(--accent)] font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3 self-start">
                🎁 {plan.trialLabel}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-sans text-[46px] font-bold text-[var(--ink)] tracking-tight leading-none tabular-nums">
                  €{plan.price}
                </span>
                <span className="font-sans text-[13px] text-[var(--muted)]">/Monat</span>
              </div>
              <p className="font-sans text-[11px] text-[var(--muted)] mb-3">
                Dann €{plan.price}/Monat · Jederzeit kündbar
              </p>

              {/* Info badges */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {[plan.duration, plan.views, plan.avgSaleDaysLabel, "0% Provision"].map((badge) => (
                  <span
                    key={badge}
                    className="font-sans text-[11px] text-[var(--ink)] bg-[var(--surface2)] border border-[var(--border)] px-2 py-0.5 rounded-full"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {/* Features */}
              <p className="font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-3">
                Inkludierte Funktionen
              </p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={13} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
                    <span className="font-sans text-[13px] text-[var(--ink)]">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {onSelectPlan ? (
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={loadingPlan !== null && loadingPlan !== undefined}
                  className={`block text-center w-full py-3.5 rounded-xl font-sans font-bold text-[14px] transition-all disabled:opacity-70 ${
                    plan.highlight
                      ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                      : plan.id === "premium"
                      ? "bg-[var(--neutral-900)] text-white hover:bg-[var(--neutral-800)]"
                      : "border border-[var(--border)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]"
                  }`}
                >
                  {loadingPlan === plan.id ? "Wird geladen…" : plan.ctaLabel}
                </button>
              ) : (
                <Link
                  href="/sell"
                  className={`block text-center w-full py-3.5 rounded-xl font-sans font-bold text-[14px] transition-all ${
                    plan.highlight
                      ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                      : plan.id === "premium"
                      ? "bg-[var(--neutral-900)] text-white hover:bg-[var(--neutral-800)]"
                      : "border border-[var(--border)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]"
                  }`}
                >
                  {plan.ctaLabel}
                </Link>
              )}

              {/* Basic "not included" hint */}
              {plan.id === "basic" && (
                <p style={{
                  fontSize: 11,
                  color: "#bbb",
                  textAlign: "center",
                  marginTop: 8,
                  fontFamily: "Helvetica Neue, Arial, sans-serif",
                }}>
                  Kein Newsletter · Keine Ads · Keine Syndication
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
