"use client";

import Link from "next/link";
import { KAUFGESUCHE, type Kaufgesuch } from "@/data/kaufgesuche";
import { useLanguage } from "@/context/LanguageContext";

function KaufgesuchCard({ k }: { k: Kaufgesuch }) {
  return (
    <div
      className="flex-shrink-0 bg-white border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--accent)] hover:shadow-md transition-all duration-200"
      style={{ width: "272px" }}
    >
      <div className="mb-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--accent)]">
          {k.typ}
        </span>
        <p className="font-sans text-[14px] font-bold text-[var(--ink)] leading-snug mt-1.5">
          {k.branche}
        </p>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between items-center">
          <span className="font-sans text-[11px] text-[var(--muted)]">Region</span>
          <span className="font-sans text-[11px] font-semibold text-[var(--ink)]">{k.region}</span>
        </div>
        {k.umsatz && (
          <div className="flex justify-between items-center">
            <span className="font-sans text-[11px] text-[var(--muted)]">Umsatz</span>
            <span className="font-sans text-[11px] font-semibold text-[var(--ink)] tabular-nums">{k.umsatz}</span>
          </div>
        )}
        {k.ebitda && (
          <div className="flex justify-between items-center">
            <span className="font-sans text-[11px] text-[var(--muted)]">EBITDA</span>
            <span className="font-sans text-[11px] font-semibold text-[var(--accent)] tabular-nums">{k.ebitda}</span>
          </div>
        )}
        <div className="flex justify-between items-center border-t border-[var(--border)] pt-1.5">
          <span className="font-sans text-[11px] text-[var(--muted)]">Ziel</span>
          <span className="font-sans text-[11px] font-semibold text-[var(--ink)] text-right ml-2 truncate max-w-[150px]">{k.zusatz}</span>
        </div>
      </div>

      <Link
        href="/sell"
        className="block text-center font-sans text-[11px] font-bold text-[var(--accent)] bg-[var(--accent-light)] rounded-lg py-2 hover:bg-[var(--accent)] hover:text-white transition-colors"
      >
        Passt das? Einreichen →
      </Link>
    </div>
  );
}

export default function KaufgesucheSection() {
  const { lang } = useLanguage();
  const doubled = [...KAUFGESUCHE, ...KAUFGESUCHE];

  return (
    <section className="bg-[var(--surface2)] border-y border-[var(--border)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-[0.2em] mb-1">
              {lang === "de" ? "Käufer-Netzwerk" : "Buyer network"}
            </p>
            <h2 className="font-sans text-[22px] font-bold text-[var(--ink)] tracking-tight">
              {lang === "de" ? "Wer über Firmadeal kauft" : "Who buys via Firmadeal"}
            </h2>
            <p className="font-sans text-[13px] text-[var(--muted)] mt-1.5 max-w-xl leading-relaxed">
              {lang === "de"
                ? "Beispielhafte Profile der Käufer in unserem Netzwerk — Private Equity, Family Offices, Search Funds, strategische Käufer und MBI-Kandidaten."
                : "Example profiles of buyers in our network — private equity, family offices, search funds, strategic buyers and MBI candidates."}
            </p>
          </div>
          <span className="font-sans text-[11px] text-[var(--muted)] bg-white border border-[var(--border)] rounded-full px-3 py-1 whitespace-nowrap self-start sm:self-auto">
            {lang === "de" ? "Beispielprofile" : "Example profiles"}
          </span>
        </div>
      </div>

      {/* Marquee — pauses on hover, respects prefers-reduced-motion via CSS */}
      <div className="overflow-hidden" style={{ paddingLeft: "16px", paddingRight: "16px" }}>
        <div className="animate-kaufgesuche flex gap-4">
          {doubled.map((k, i) => (
            <KaufgesuchCard key={`${k.id}-${i}`} k={k} />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 text-center">
        <Link
          href="/sell"
          className="inline-flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-bold px-7 py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-all hover:-translate-y-0.5 hover:shadow-lg text-[14px]"
        >
          {lang === "de" ? "Unternehmen vertraulich einreichen →" : "Submit your business confidentially →"}
        </Link>
        <p className="font-sans text-[12px] text-[var(--muted)] mt-2">
          {lang === "de" ? "Einmalig €87 · 0% Provision · Anonym bis zum Abschluss" : "One-time €87 · 0% commission · Anonymous"}
        </p>
      </div>
    </section>
  );
}
