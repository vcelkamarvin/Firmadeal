"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

interface PricingCardsProps {
  onSelectPlan?: (planId: "monthly" | "yearly") => void;
  loadingPlan?: string | null;
}

const MONTHLY_FEATURES = [
  "Listing sichtbar im Marktplatz",
  "500 aktive Käufer/Monat kontaktieren Sie direkt",
  "Anonymes Inserat — Ihre Daten bleiben geschützt",
  "Automatische Unternehmensbewertung",
  "7-Tage Markttest-Bericht",
  "0% Provision auf den Verkaufspreis",
];

const YEARLY_BASE = [
  "Listing sichtbar im Marktplatz",
  "1.000 aktive Käufer/Monat — 2× mehr als Monatsplan",
  "Anonymes Inserat — Ihre Daten bleiben geschützt",
  "Automatische Unternehmensbewertung",
  "7-Tage Markttest-Bericht",
  "0% Provision auf den Verkaufspreis",
  "Top-Platzierung — erscheint vor allen Monats-Inseraten",
];

const YEARLY_EXCLUSIVE = [
  "Wöchentlicher Newsletter an 8.000+ aktive Investoren",
  "Direktes Matching mit verifizierten Käufern in Ihrer Branche und Region — wir leiten Ihr Inserat aktiv an passende Investoren, PE-Fonds und Unternehmer im DACH-Raum weiter",
];

export default function PricingCards({ onSelectPlan, loadingPlan }: PricingCardsProps) {
  const [visible, setVisible] = useState(false);
  const isLoading = loadingPlan !== null && loadingPlan !== undefined;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const monthlyCTA = onSelectPlan ? (
    <button
      type="button"
      onClick={() => onSelectPlan("monthly")}
      disabled={isLoading}
      className="w-full py-3.5 rounded-xl font-sans font-bold text-[14px] border-2 border-[var(--border)] text-[var(--ink)] hover:border-[#1A5C3A] hover:text-[#1A5C3A] transition-all duration-200 disabled:opacity-60"
    >
      {loadingPlan === "monthly" ? "Wird geladen…" : "7 Tage kostenlos starten →"}
    </button>
  ) : (
    <Link
      href="/sell"
      className="block text-center w-full py-3.5 rounded-xl font-sans font-bold text-[14px] border-2 border-[var(--border)] text-[var(--ink)] hover:border-[#1A5C3A] hover:text-[#1A5C3A] transition-all duration-200"
    >
      7 Tage kostenlos starten →
    </Link>
  );

  const yearlyCTA = onSelectPlan ? (
    <button
      type="button"
      onClick={() => onSelectPlan("yearly")}
      disabled={isLoading}
      className="animate-cta-pulse w-full py-4 rounded-xl font-sans font-bold text-[15px] text-white hover:opacity-90 transition-opacity duration-200 disabled:opacity-60"
      style={{ background: "#1A5C3A" }}
    >
      {loadingPlan === "yearly" ? "Wird geladen…" : "Jetzt Jahrespaket sichern →"}
    </button>
  ) : (
    <Link
      href="/sell"
      className="animate-cta-pulse block text-center w-full py-4 rounded-xl font-sans font-bold text-[15px] text-white hover:opacity-90 transition-opacity duration-200"
      style={{ background: "#1A5C3A" }}
    >
      Jetzt Jahrespaket sichern →
    </Link>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto items-start">

      {/* ── Monthly Card ── */}
      <div
        className="relative bg-white border border-[var(--border)] rounded-2xl flex flex-col p-7 transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transitionDelay: "0ms",
        }}
      >
        <h3 className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest mb-4">
          Firmadeal Listing
        </h3>

        <div className="flex items-baseline gap-1 mb-1">
          <span className="font-sans text-[46px] font-bold text-[var(--ink)] tracking-tight leading-none tabular-nums">
            €39
          </span>
          <span className="font-sans text-[14px] text-[var(--muted)]">/Monat</span>
        </div>
        <p className="font-sans text-[12px] text-[var(--muted)] mb-5">
          Nach 7 Tagen · Jederzeit kündbar
        </p>

        {/* Stats pills — gray */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {["500 Käufer/Monat", "Ø 90–180 Tage", "0% Provision"].map((p) => (
            <span key={p} className="font-sans text-[11px] font-medium text-[var(--muted)] bg-[var(--surface2)] border border-[var(--border)] px-2.5 py-1 rounded-full">
              {p}
            </span>
          ))}
        </div>

        <ul className="space-y-2.5 mb-7 flex-1">
          {MONTHLY_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={13} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
              <span className="font-sans text-[13px] text-[var(--ink)]">{f}</span>
            </li>
          ))}
        </ul>

        {monthlyCTA}

        <p className="font-sans text-[11px] text-[var(--muted)] text-center mt-3 leading-snug">
          Kein Newsletter · Keine Käufergruppen · Keine Top-Platzierung
        </p>
      </div>

      {/* ── Yearly Card ── */}
      <div
        className="animate-border-glow relative bg-white rounded-2xl flex flex-col p-8 transition-all duration-700"
        style={{
          border: "2.5px solid #1A5C3A",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
          transitionDelay: "100ms",
        }}
      >
        {/* Floating badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="animate-float-badge font-sans text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500 text-white whitespace-nowrap">
            ⭐ Beliebteste Wahl — 59% günstiger
          </span>
          <span className="font-sans text-[11px] font-bold px-3 py-1 rounded-full bg-red-500 text-white whitespace-nowrap">
            🔥 Nur noch 3 Plätze verfügbar
          </span>
        </div>

        <h3 className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2">
          Firmadeal Jahrespaket
        </h3>

        {/* Crossed out price */}
        <p className="font-sans text-[14px] text-[var(--muted)] line-through mb-0.5">€468/Jahr</p>

        {/* Big price */}
        <div className="flex items-baseline gap-1 mb-1">
          <span
            className="font-sans font-bold text-[var(--ink)] tracking-tight leading-none tabular-nums"
            style={{ fontSize: 64 }}
          >
            €189
          </span>
          <span className="font-sans text-[15px] text-[var(--muted)]">/Jahr</span>
        </div>
        <p className="font-sans text-[12px] text-[var(--muted)] mb-2">
          = €15,75/Monat · Nach 7 Tagen · Jederzeit kündbar
        </p>

        {/* Savings pill */}
        <div
          className="inline-flex items-center self-start font-sans text-[12px] font-bold px-3 py-1 rounded-full mb-5"
          style={{ background: "#e8f5ed", color: "#1A5C3A" }}
        >
          Sie sparen €279
        </div>

        {/* Stats pills — green */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {["1.000 Käufer/Monat", "Ø 60–120 Tage", "0% Provision"].map((p) => (
            <span
              key={p}
              className="font-sans text-[11px] font-bold px-3 py-1.5 rounded-full text-white"
              style={{ background: "#1A5C3A" }}
            >
              {p}
            </span>
          ))}
        </div>

        {/* Base features */}
        <ul className="space-y-2.5 mb-3 flex-1">
          {YEARLY_BASE.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={13} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
              <span className="font-sans text-[13px] text-[var(--ink)]">{f}</span>
            </li>
          ))}

          {/* Exclusive features */}
          {YEARLY_EXCLUSIVE.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <span className="text-amber-500 text-[13px] mt-0.5 flex-shrink-0">⭐</span>
              <span>
                <span className="font-sans text-[13px] text-[var(--ink)]">{f} </span>
                <span className="inline-block font-sans text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 whitespace-nowrap">
                  Nur im Jahrespaket
                </span>
              </span>
            </li>
          ))}
        </ul>

        {/* Algorithm trust line */}
        <div className="border-t border-[var(--border)] pt-3 mb-5">
          <p className="font-sans text-[11px] text-[var(--muted)] leading-relaxed">
            Unser Algorithmus analysiert Branche, Region und Unternehmensgröße und leitet Ihr Inserat automatisch an Käufer weiter, die aktiv in Ihrem Segment suchen — ohne Makler, ohne Provision.
          </p>
        </div>

        {yearlyCTA}

        <p className="font-sans text-[12px] text-[var(--muted)] text-center mt-3 leading-relaxed">
          Für ernsthafte Verkäufer — maximale Reichweite über den gesamten Verkaufsprozess
        </p>

        {/* Social proof */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot flex-shrink-0" />
          <p className="font-sans text-[12px] font-semibold" style={{ color: "#1A5C3A" }}>
            47 Unternehmer haben in den letzten 30 Tagen ihr Inserat mit dem Jahrespaket gestartet
          </p>
        </div>
      </div>
    </div>
  );
}
