"use client";

import Link from "next/link";

export default function SaleTimelineSection({ lang }: { lang: string }) {
  return (
    <section className="bg-white border-y border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        <div className="mb-10">
          <p className="font-sans text-[11px] font-semibold text-[var(--accent)] uppercase tracking-[0.2em] mb-2">
            {lang === "de" ? "Durchschnittliche Verkaufsdauer" : "Average sale duration"}
          </p>
          <h2 className="font-sans text-[24px] font-bold text-[var(--ink)] tracking-tight mb-2">
            {lang === "de" ? "Wie lange dauert ein Verkauf?" : "How long does a sale take?"}
          </h2>
          <p className="font-sans text-[14px] text-[var(--muted)]">
            {lang === "de"
              ? "Basierend auf abgeschlossenen Transaktionen im DACH-Raum"
              : "Based on completed transactions in the DACH region"}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            {
              value: "Ø 94",
              unit: lang === "de" ? "Tage" : "days",
              label: lang === "de" ? "bis zum Abschluss" : "to closing",
              sub: lang === "de" ? "Median aller Transaktionen" : "Median of all transactions",
            },
            {
              value: "67%",
              unit: "",
              label: lang === "de" ? "in unter 4 Monaten" : "in under 4 months",
              sub: lang === "de" ? "aller Verkäufe abgeschlossen" : "of all sales completed",
            },
            {
              value: "23%",
              unit: "",
              label: lang === "de" ? "in unter 6 Wochen" : "in under 6 weeks",
              sub: lang === "de" ? "mit Premium-Inserat" : "with Premium listing",
            },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--surface2)] rounded-xl p-6 border border-[var(--border)]">
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="font-sans text-[38px] font-bold text-[var(--accent)] tracking-tight leading-none">
                  {s.value}
                </span>
                {s.unit && (
                  <span className="font-sans text-[20px] font-bold text-[var(--accent)]">{s.unit}</span>
                )}
              </div>
              <div className="font-sans text-[15px] font-semibold text-[var(--ink)] mb-1">{s.label}</div>
              <div className="font-sans text-[13px] text-[var(--muted)]">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Timeline bars */}
        <div className="bg-[var(--surface2)] rounded-xl p-6 border border-[var(--border)]">
          <p className="font-sans text-[13px] font-bold text-[var(--ink)] mb-6">
            {lang === "de"
              ? "Geschätzte Verkaufsdauer nach Inserats-Plan"
              : "Estimated sale duration by listing plan"}
          </p>
          <div className="space-y-5">
            {[
              { name: "Basic",    range: lang === "de" ? "3–12 Monate" : "3–12 months", pct: 100, color: "var(--neutral-400)" },
              { name: "Advanced", range: lang === "de" ? "3–9 Monate"  : "3–9 months",  pct: 75,  color: "var(--green-600)"   },
              { name: "Premium",  range: lang === "de" ? "1–6 Monate"  : "1–6 months",  pct: 50,  color: "var(--accent)"      },
            ].map((tier) => (
              <div key={tier.name} className="flex items-center gap-4">
                <div className="w-20 flex-shrink-0">
                  <span className="font-sans text-[13px] font-semibold text-[var(--ink)]">{tier.name}</span>
                </div>
                <div className="flex-1 h-3 bg-white rounded-full overflow-hidden border border-[var(--border)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${tier.pct}%`,
                      background: tier.color,
                      transition: "width 0.7s ease",
                    }}
                  />
                </div>
                <div className="w-24 flex-shrink-0 text-right">
                  <span className="font-sans text-[12px] text-[var(--muted)]">{tier.range}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="font-sans text-[12px] text-[var(--muted)] mt-6">
            {lang === "de"
              ? "Premium-Inserate werden 18% häufiger abgeschlossen als Basic-Inserate. "
              : "Premium listings close 18% more often than Basic listings. "}
            <Link href="/pricing" className="font-semibold text-[var(--accent)] hover:underline">
              {lang === "de" ? "Premium jetzt buchen →" : "Book Premium now →"}
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
