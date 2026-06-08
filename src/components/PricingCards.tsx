"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

interface PricingCardsProps {
  onSelectPlan?: (planId: string) => void;
  loadingPlan?: string | null;
}

const FEATURES = [
  "Listing sichtbar im Marktplatz",
  "4.000 aktive Käufer/Monat kontaktieren Sie direkt",
  "Anonymes Inserat — Ihre Daten bleiben geschützt",
  "Automatische Unternehmensbewertung",
  "7-Tage Markttest-Bericht",
  "0% Provision auf den Verkaufspreis",
  "Wöchentlicher Newsletter an 16.000+ aktive Investoren",
  "Direktes Käufer-Matching nach Branche, Region & Größe",
];

export default function PricingCards({ onSelectPlan, loadingPlan }: PricingCardsProps) {
  const [visible, setVisible] = useState(false);
  const isLoading = loadingPlan !== null && loadingPlan !== undefined;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const cta = onSelectPlan ? (
    <button
      type="button"
      onClick={() => onSelectPlan("test")}
      disabled={isLoading}
      className="animate-cta-pulse w-full py-4 rounded-xl font-sans font-bold text-[15px] text-white hover:opacity-90 transition-opacity duration-200 disabled:opacity-60"
      style={{ background: "#1A5C3A" }}
    >
      {loadingPlan === "test" ? "Wird geladen…" : "Jetzt Inserat starten →"}
    </button>
  ) : (
    <Link
      href="/sell"
      className="animate-cta-pulse block text-center w-full py-4 rounded-xl font-sans font-bold text-[15px] text-white hover:opacity-90 transition-opacity duration-200"
      style={{ background: "#1A5C3A" }}
    >
      Jetzt Inserat starten →
    </Link>
  );

  return (
    <div className="max-w-md mx-auto">
      <div
        className="animate-border-glow relative bg-white rounded-2xl flex flex-col p-8 transition-all duration-700"
        style={{
          border: "2.5px solid #1A5C3A",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(16px)",
        }}
      >
        <h3 className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest mb-4">
          Firmadeal Listing
        </h3>

        <div className="flex items-baseline gap-1 mb-1">
          <span className="font-sans text-[64px] font-bold text-[var(--ink)] tracking-tight leading-none tabular-nums">
            €87
          </span>
          <span className="font-sans text-[15px] text-[var(--muted)]">einmalig</span>
        </div>
        <p className="font-sans text-[12px] text-[var(--muted)] mb-6">
          Einmalzahlung · Kein Abo · Keine versteckten Kosten
        </p>

        {/* Stats pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {["4.000 Käufer/Monat", "Ø 60–120 Tage", "0% Provision"].map((p) => (
            <span
              key={p}
              className="font-sans text-[11px] font-bold px-3 py-1.5 rounded-full text-white"
              style={{ background: "#1A5C3A" }}
            >
              {p}
            </span>
          ))}
        </div>

        <ul className="space-y-2.5 mb-7 flex-1">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check size={13} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
              <span className="font-sans text-[13px] text-[var(--ink)]">{f}</span>
            </li>
          ))}
        </ul>

        {cta}

        <p className="font-sans text-[11px] text-[var(--muted)] text-center mt-3 leading-snug">
          Kein Newsletter-Zwang · Jederzeit kündbar · 0% Provision
        </p>

        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot flex-shrink-0" />
          <p className="font-sans text-[12px] font-semibold" style={{ color: "#1A5C3A" }}>
            47 Unternehmer haben in den letzten 30 Tagen ihr Inserat gestartet
          </p>
        </div>
      </div>
    </div>
  );
}
