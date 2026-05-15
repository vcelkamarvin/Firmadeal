"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const PLANS = [
  {
    id: "base",
    name: "Base",
    price: 49,
    months: 4,
    popular: false,
    badge: null,
    featuresDe: [
      "Inserat aufgeben",
      "4 Monate aktiv",
      "Professionelle Überprüfung",
      "Kontaktformular für Käufer",
      "DACH-weite Sichtbarkeit",
    ],
    featuresEn: [
      "Post your listing",
      "Active for 4 months",
      "Professional review",
      "Contact form for buyers",
      "DACH-wide visibility",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: 89,
    months: 6,
    popular: true,
    badge: { de: "Beliebteste Wahl", en: "Most Popular" },
    featuresDe: [
      "Alles aus Base",
      "6 Monate aktiv",
      "Featured Inserat (oben in Ergebnissen)",
      "Vertrauenssiegel",
      "Social Media Erwähnung",
      "Priorität in Suchergebnissen",
    ],
    featuresEn: [
      "Everything in Base",
      "Active for 6 months",
      "Featured listing (top of results)",
      "Trust badge",
      "Social media mention",
      "Priority in search results",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 149,
    months: 8,
    popular: false,
    badge: { de: "Maximale Sichtbarkeit", en: "Maximum Visibility" },
    featuresDe: [
      "Alles aus Plus",
      "8 Monate aktiv",
      "Top-Priorität in Suchergebnissen",
      "Social Media Werbeanzeige",
      "Dedizierter Support",
      "Newsletter-Erwähnung",
    ],
    featuresEn: [
      "Everything in Plus",
      "Active for 8 months",
      "Top priority in search results",
      "Social media advertising",
      "Dedicated support",
      "Newsletter mention",
    ],
  },
];

const FAQ_DE = [
  {
    q: "Gibt es eine Provision auf den Verkaufspreis?",
    a: "Nein. Firmadeal erhebt keine Provision auf den Verkaufspreis. Sie zahlen nur den einmaligen Inseratspreis und behalten 100% des Verkaufserlöses.",
  },
  {
    q: "Kann ich meinen Plan nachträglich upgraden?",
    a: "Ja. Sie können jederzeit auf einen höheren Plan upgraden. Der Preisunterschied wird anteilig berechnet.",
  },
  {
    q: "Was passiert nach Ablauf meines Plans?",
    a: "Ihr Inserat wird automatisch pausiert. Sie erhalten eine Benachrichtigung und können einfach verlängern.",
  },
  {
    q: "Wie schnell wird mein Inserat veröffentlicht?",
    a: "Sofort nach erfolgreicher Zahlung, typischerweise innerhalb von Sekunden.",
  },
  {
    q: "Kann ich mein Inserat jederzeit bearbeiten?",
    a: "Ja. Sie können Ihr Inserat jederzeit in Ihrem Dashboard bearbeiten, ohne extra zu zahlen.",
  },
];

const FAQ_EN = [
  {
    q: "Is there a commission on the sale price?",
    a: "No. Firmadeal charges no commission on the sale price. You pay only the one-time listing fee and keep 100% of the proceeds.",
  },
  {
    q: "Can I upgrade my plan later?",
    a: "Yes. You can upgrade to a higher plan at any time. The price difference will be prorated.",
  },
  {
    q: "What happens when my plan expires?",
    a: "Your listing will be automatically paused. You'll receive a notification and can renew easily.",
  },
  {
    q: "How quickly will my listing be published?",
    a: "Immediately after successful payment, typically within seconds.",
  },
  {
    q: "Can I edit my listing at any time?",
    a: "Yes. You can edit your listing at any time in your dashboard without any extra charge.",
  },
];

export default function PricingPage() {
  const { lang } = useLanguage();

  const faqs = lang === "de" ? FAQ_DE : FAQ_EN;

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-[0.15em] mb-4">
          {lang === "de" ? "Transparente Preise" : "Transparent pricing"}
        </p>
        <h1 className="font-fraunces text-[clamp(32px,5vw,52px)] text-[var(--ink)] mb-4 leading-tight">
          {lang === "de"
            ? "Einmalig zahlen. Keine Provision."
            : "Pay once. No commission."}
        </h1>
        <p className="font-sans text-lg text-[var(--muted)] max-w-[500px] mx-auto">
          {lang === "de"
            ? "Wählen Sie den Plan, der zu Ihrem Unternehmen passt. Alle Pläne sind einmalige Zahlungen – keine Abonnements."
            : "Choose the plan that fits your business. All plans are one-time payments — no subscriptions."}
        </p>
      </section>

      {/* Plans */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl p-7 ${
                plan.popular
                  ? "border-2 border-[var(--accent)] shadow-[0_8px_40px_rgba(28,63,94,0.12)]"
                  : "border border-[var(--border)]"
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-mono font-medium whitespace-nowrap ${
                    plan.popular
                      ? "bg-[var(--accent)] text-white"
                      : "bg-amber-500 text-white"
                  }`}
                >
                  {lang === "de" ? plan.badge.de : plan.badge.en}
                </div>
              )}

              <h3 className="font-fraunces text-[24px] text-[var(--ink)] mb-2">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-fraunces text-[44px] text-[var(--ink)] leading-none">
                  €{plan.price}
                </span>
              </div>
              <p className="font-mono text-[11px] text-[var(--muted)] mb-6">
                {plan.months} {lang === "de" ? "Monate aktiv · Einmalig" : "months active · One-time"}
              </p>

              <ul className="space-y-3 mb-8">
                {(lang === "de" ? plan.featuresDe : plan.featuresEn).map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check size={15} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
                    <span className="font-sans text-sm text-[var(--ink)]">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/sell"
                className={`block text-center w-full py-3.5 rounded-xl font-sans font-medium text-sm transition-all ${
                  plan.popular
                    ? "bg-[var(--accent)] text-white hover:opacity-90"
                    : "border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--accent-light)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                }`}
              >
                {lang === "de" ? "Jetzt inserieren →" : "List now →"}
              </Link>
            </div>
          ))}
        </div>

        {/* Commission callout */}
        <div className="max-w-5xl mx-auto mt-8 bg-[var(--accent-light)] border border-[var(--accent)]/20 rounded-2xl p-6 text-center">
          <p className="font-fraunces text-[20px] text-[var(--accent)] mb-1">
            {lang === "de" ? "0% Provision auf den Verkaufspreis" : "0% commission on the sale price"}
          </p>
          <p className="font-sans text-sm text-[var(--muted)]">
            {lang === "de"
              ? "Anders als traditionelle Makler nehmen wir keine Provision. Sie behalten 100% des Verkaufserlöses."
              : "Unlike traditional brokers, we take no commission. You keep 100% of the sale proceeds."}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[var(--surface2)] border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-fraunces text-[28px] text-[var(--ink)] text-center mb-10">
            {lang === "de" ? "Häufige Fragen" : "Frequently asked questions"}
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-white border border-[var(--border)] rounded-xl p-6"
              >
                <h3 className="font-sans text-[15px] font-semibold text-[var(--ink)] mb-2">
                  {faq.q}
                </h3>
                <p className="font-sans text-sm text-[var(--muted)] leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
