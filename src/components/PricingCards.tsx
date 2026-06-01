"use client";

import Link from "next/link";
import { Check } from "lucide-react";

interface PricingCardsProps {
  onSelectPlan?: (planId: "monthly" | "yearly") => void;
  loadingPlan?: string | null;
}

const COMMON_FEATURES = [
  "Listing sichtbar im Marktplatz",
  "1.000+ aktive K\u00e4ufer/Monat kontaktieren Sie direkt",
  "Anonymes Inserat \u2014 Ihre Daten bleiben gesch\u00fctzt",
  "Automatische Unternehmensbewertung",
  "7-Tage Markttest-Bericht",
  "0% Provision auf den Verkaufspreis",
];

const EXCLUSIVE_FEATURES = [
  "Top-Platzierung \u2014 Ihr Inserat erscheint vor Monthly-Inseraten",
  "W\u00f6chentlicher Newsletter an 8.000+ aktive Investoren",
];

export default function PricingCards({ onSelectPlan, loadingPlan }: PricingCardsProps) {
  const isLoading = loadingPlan !== null && loadingPlan !== undefined;

  const renderCTA = (planId: "monthly" | "yearly", label: string, filled: boolean) => {
    const cls = filled
      ? "block text-center w-full py-3.5 rounded-xl font-sans font-bold text-[14px] bg-[#1A5C3A] text-white hover:bg-[#154d30] transition-all disabled:opacity-70"
      : "block text-center w-full py-3.5 rounded-xl font-sans font-bold text-[14px] border border-[var(--border)] text-[var(--ink)] hover:border-[#1A5C3A] hover:text-[#1A5C3A] hover:bg-[var(--accent-light)] transition-all disabled:opacity-70";

    if (onSelectPlan) {
      return (
        <button
          type="button"
          onClick={() => onSelectPlan(planId)}
          disabled={isLoading}
          className={cls}
        >
          {loadingPlan === planId ? "Wird geladen\u2026" : label}
        </button>
      );
    }
    return (
      <Link href="/sell" className={cls}>
        {label}
      </Link>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
      {/* Monthly Card */}
      <div className="relative bg-white border border-[var(--border)] rounded-2xl flex flex-col p-7">
        <h3 className="font-sans text-[12px] font-bold text-[var(--muted)] uppercase tracking-widest mb-3">
          Firmadeal Listing
        </h3>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="font-sans text-[48px] font-bold text-[var(--ink)] tracking-tight leading-none tabular-nums">
            \u20ac39
          </span>
          <span className="font-sans text-[14px] text-[var(--muted)]">/Monat</span>
        </div>
        <p className="font-sans text-[12px] text-[var(--muted)] mb-5">
          Nach 7 Tagen \u00b7 Jederzeit k\u00fcndbar
        </p>
        <ul className="space-y-3 mb-8 flex-1">
          {COMMON_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={13} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
              <span className="font-sans text-[13px] text-[var(--ink)]">{f}</span>
            </li>
          ))}
        </ul>
        {renderCTA("monthly", "7 Tage kostenlos starten \u2192", false)}
      </div>

      {/* Yearly Card */}
      <div
        className="relative bg-white border-2 rounded-2xl flex flex-col p-7 shadow-[0_8px_40px_rgba(26,92,58,0.12)]"
        style={{ borderColor: "#1A5C3A" }}
      >
        {/* EMPFOHLEN badge */}
        <div className="absolute -top-3.5 right-6 px-4 py-1 rounded-full font-sans text-[11px] font-bold bg-[#1A5C3A] text-white whitespace-nowrap">
          EMPFOHLEN
        </div>

        <h3 className="font-sans text-[12px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">
          Firmadeal Listing Jahrespaket
        </h3>
        <p className="font-sans text-[11px] font-semibold mb-3" style={{ color: "#1A5C3A" }}>
          Beliebteste Wahl \u2014 59% g\u00fcnstiger
        </p>

        {/* Price with strikethrough */}
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <span className="font-sans text-[15px] text-[var(--muted)] line-through tabular-nums">
            \u20ac468/Jahr
          </span>
          <span className="font-sans text-[48px] font-bold text-[var(--ink)] tracking-tight leading-none tabular-nums">
            \u20ac189
          </span>
          <span className="font-sans text-[14px] text-[var(--muted)]">/Jahr</span>
        </div>
        <p className="font-sans text-[12px] text-[var(--muted)] mb-2">
          = \u20ac15,75/Monat \u00b7 Nach 7 Tagen \u00b7 Jederzeit k\u00fcndbar
        </p>

        {/* Savings pill */}
        <div
          className="inline-flex items-center self-start font-sans text-[12px] font-bold px-3 py-1 rounded-full mb-5"
          style={{ background: "#e8f5ed", color: "#1A5C3A" }}
        >
          Sie sparen \u20ac279
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-6 flex-1">
          {COMMON_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={13} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
              <span className="font-sans text-[13px] text-[var(--ink)]">{f}</span>
            </li>
          ))}
          {EXCLUSIVE_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={13} className="mt-0.5 flex-shrink-0" style={{ color: "#1A5C3A" }} />
              <span className="font-sans text-[13px] text-[var(--ink)]">
                {f}
                <span className="ml-1.5 font-sans text-[11px] font-semibold text-amber-600 whitespace-nowrap">
                  \u2b50 Nur im Jahrespaket
                </span>
              </span>
            </li>
          ))}
        </ul>

        {renderCTA("yearly", "Jetzt Jahrespaket starten \u2192", true)}

        <p className="font-sans text-[12px] text-[var(--muted)] text-center mt-4 leading-relaxed">
          F\u00fcr ernsthafte Verk\u00e4ufer \u2014 maximale Sichtbarkeit \u00fcber den gesamten Verkaufsprozess
        </p>
      </div>
    </div>
  );
}
