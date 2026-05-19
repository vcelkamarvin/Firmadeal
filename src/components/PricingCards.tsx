"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const PLANS = [
  {
    id:          "base" as const,
    name:        "Markttest Starter",
    price:       39,
    duration:    { de: "3 bis 12 Monate",  en: "3 to 12 months"  },
    views:       { de: "250 Käufer/Monat", en: "250 buyers/month" },
    commission:  "0% Provision",
    popular:     false,
    badge:       null,
    ctaStyle:    "outline" as const,
    avgSaleDays: 89,
    features: {
      de: [
        "Sofort live im DACH-Marktplatz",
        "Aufnahme in Käufer-Datenbank (4.102 Käufer)",
        "Basis-Matching mit passenden Käufern",
        "Direkter Käuferkontakt — kein Makler",
        "7-Tage Markttest-Bericht per E-Mail",
      ],
      en: [
        "Immediately live on DACH marketplace",
        "Added to buyer database (4,102 buyers)",
        "Basic matching with suitable buyers",
        "Direct buyer contact — no broker",
        "7-day market test report by email",
      ],
    },
  },
  {
    id:          "plus" as const,
    name:        "Markttest Pro",
    price:       79,
    duration:    { de: "3 bis 9 Monate",    en: "3 to 9 months"    },
    views:       { de: "1.000 Käufer/Monat", en: "1,000 buyers/month" },
    commission:  "0% Provision",
    popular:     true,
    badge:       { de: "Beliebteste Wahl", en: "Most popular" },
    ctaStyle:    "filled" as const,
    avgSaleDays: 52,
    features: {
      de: [
        "Alles aus Markttest Starter",
        "Newsletter an [X] aktive Investoren (Tag 3)",
        "Priority-Platzierung in Suchergebnissen",
        "Social-Syndication DACH-Käufergruppen",
        "Smart Data Room für Dokumente",
      ],
      en: [
        "Everything in Markttest Starter",
        "Newsletter to [X] active investors (day 3)",
        "Priority placement in search results",
        "Social syndication DACH buyer groups",
        "Smart data room for documents",
      ],
    },
  },
  {
    id:          "premium" as const,
    name:        "Markttest Maximum",
    price:       199,
    duration:    { de: "1 bis 6 Monate",     en: "1 to 6 months"      },
    views:       { de: "5.000+ Käufer/Monat", en: "5,000+ buyers/month" },
    commission:  "0% Provision",
    popular:     false,
    badge:       { de: "18% höhere Abschlussrate", en: "18% higher close rate" },
    ctaStyle:    "dark" as const,
    avgSaleDays: 31,
    features: {
      de: [
        "Alles aus Markttest Pro",
        "Solo-Broadcast an [X] Investoren (dediziert)",
        "LinkedIn + Google Ads für Ihr Inserat",
        "Persönlicher Deal-Stratege",
        "PE-Firmen Direktkontakt",
        "24/7 Deal Strategy Support",
      ],
      en: [
        "Everything in Markttest Pro",
        "Solo broadcast to [X] investors (dedicated)",
        "LinkedIn + Google Ads for your listing",
        "Personal deal strategist",
        "Direct PE firm contact",
        "24/7 deal strategy support",
      ],
    },
  },
];

interface PricingCardsProps {
  onSelectPlan?: (planId: "base" | "plus" | "premium") => void;
  loadingPlan?: string | null;
  investorCount?: number;
  categoryLabel?: string;
}

export default function PricingCards({
  onSelectPlan,
  loadingPlan,
  investorCount = 1200,
  categoryLabel = "DACH",
}: PricingCardsProps) {
  const { lang } = useLanguage();

  const resolveFeature = (f: string) =>
    f
      .replace("[X]", investorCount.toLocaleString("de-DE"))
      .replace("[Category]", categoryLabel);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl flex flex-col ${
              plan.popular
                ? "border-2 border-[var(--accent)] shadow-[0_8px_40px_rgba(26,51,41,0.12)]"
                : "border border-[var(--border)]"
            }`}
          >
            {plan.badge && (
              <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-sans text-[11px] font-bold whitespace-nowrap ${
                plan.popular ? "bg-[var(--accent)] text-white" : "bg-amber-500 text-white"
              }`}>
                {lang === "de" ? plan.badge.de : plan.badge.en}
              </div>
            )}

            <div className="p-7 flex-1 flex flex-col">
              <h3 className="font-sans text-[12px] font-bold text-[var(--muted)] uppercase tracking-widest mb-3">
                {plan.name}
              </h3>

              {/* Trial badge */}
              <div className="inline-flex items-center gap-1.5 bg-[var(--accent-light)] text-[var(--accent)] font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full mb-3 self-start">
                🎁 7 {lang === "de" ? "Tage kostenlos" : "days free"}
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-sans text-[46px] font-bold text-[var(--ink)] tracking-tight leading-none tabular-nums">
                  €{plan.price}
                </span>
                <span className="font-sans text-[13px] text-[var(--muted)]">/Monat</span>
              </div>
              <p className="font-sans text-[11px] text-[var(--muted)] mb-3">
                {lang === "de"
                  ? `Dann €${plan.price}/Monat · Jederzeit kündbar`
                  : `Then €${plan.price}/mo · Cancel anytime`}
              </p>

              {/* Info badges */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                {[
                  lang === "de" ? plan.duration.de : plan.duration.en,
                  lang === "de" ? plan.views.de    : plan.views.en,
                  plan.commission,
                ].map((badge) => (
                  <span key={badge} className="font-sans text-[11px] text-[var(--ink)] bg-[var(--surface2)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                ))}
              </div>

              {/* Features */}
              <p className="font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-3">
                {lang === "de" ? "Inkludierte Funktionen" : "Included features"}
              </p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {(lang === "de" ? plan.features.de : plan.features.en).map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={13} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
                    <span className="font-sans text-[13px] text-[var(--ink)]">
                      {resolveFeature(f)}
                    </span>
                  </li>
                ))}
              </ul>

              {onSelectPlan ? (
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={loadingPlan !== null && loadingPlan !== undefined}
                  className={`block text-center w-full py-3.5 rounded-xl font-sans font-bold text-[14px] transition-all disabled:opacity-70 ${
                    plan.ctaStyle === "filled"
                      ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                      : plan.ctaStyle === "dark"
                      ? "bg-[var(--neutral-900)] text-white hover:bg-[var(--neutral-800)]"
                      : "border border-[var(--border)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]"
                  }`}
                >
                  {loadingPlan === plan.id
                    ? (lang === "de" ? "Wird geladen…" : "Loading…")
                    : (lang === "de" ? "7 Tage kostenlos starten →" : "Start 7-day free trial →")}
                </button>
              ) : (
                <Link
                  href="/sell"
                  className={`block text-center w-full py-3.5 rounded-xl font-sans font-bold text-[14px] transition-all ${
                    plan.ctaStyle === "filled"
                      ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                      : plan.ctaStyle === "dark"
                      ? "bg-[var(--neutral-900)] text-white hover:bg-[var(--neutral-800)]"
                      : "border border-[var(--border)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)]"
                  }`}
                >
                  {lang === "de" ? "7 Tage kostenlos starten →" : "Start 7-day free trial →"}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
