"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import PricingCards from "@/components/PricingCards";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

// ── Sale duration data ─────────────────────────────────────────────────────────

const DURATION_BARS = [
  { plan: "Basic",    days: 89, color: "#6b7280", bg: "#f3f4f6" },
  { plan: "Advanced", days: 52, color: "#2d5a3d", bg: "#f0fdf4" },
  { plan: "Premium",  days: 31, color: "#1d4ed8", bg: "#eff6ff" },
];
const MAX_DAYS = 89;

// ── Scatter data ───────────────────────────────────────────────────────────────

const SCATTER_DATA = [
  // Low zone: underpriced (<2.5×), slower (distrust)
  { x: 1.2, y: 108 }, { x: 1.5, y: 95 }, { x: 1.8, y: 89 }, { x: 2.1, y: 112 }, { x: 2.4, y: 78 },
  // Fair zone: 2.5–5.5×, fastest
  { x: 2.8, y: 65 }, { x: 3.1, y: 52 }, { x: 3.4, y: 48 }, { x: 3.7, y: 61 }, { x: 4.0, y: 44 },
  { x: 4.2, y: 38 }, { x: 4.5, y: 55 }, { x: 4.8, y: 42 }, { x: 5.1, y: 36 }, { x: 5.3, y: 49 },
  // Premium zone: >5.5×, longer (fewer buyers)
  { x: 5.7, y: 71 }, { x: 6.1, y: 88 }, { x: 6.5, y: 95 }, { x: 7.0, y: 82 }, { x: 7.4, y: 109 },
];

// ── Sale Duration Bars Component ───────────────────────────────────────────────

function SaleDurationBars({ lang }: { lang: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div>
      <h3 className="font-sans text-[16px] font-bold text-[var(--ink)] tracking-tight mb-1">
        {lang === "de" ? "Schneller verkaufen mit dem richtigen Plan" : "Sell faster with the right plan"}
      </h3>
      <p className="font-sans text-[12px] text-[var(--muted)] mb-6">
        {lang === "de"
          ? "Ø Verkaufsdauer nach Plan · abgeschlossene Transaktionen"
          : "Avg. sale duration by plan · completed transactions"}
      </p>
      <div ref={ref} className="space-y-4">
        {DURATION_BARS.map((bar, i) => (
          <div key={bar.plan}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-sans text-[13px] font-semibold text-[var(--ink)]">{bar.plan}</span>
              <span className="font-sans text-[13px] font-bold tabular-nums" style={{ color: bar.color }}>
                {bar.days} {lang === "de" ? "Tage" : "days"}
              </span>
            </div>
            <div className="h-8 rounded-lg overflow-hidden relative" style={{ background: bar.bg }}>
              <div
                className="h-full rounded-lg flex items-center pl-3"
                style={{
                  width: inView ? `${(bar.days / MAX_DAYS) * 100}%` : "0%",
                  background: bar.color,
                  transition: `width 1.2s ease-out ${i * 0.2}s`,
                }}
              >
                {inView && (
                  <span className="font-sans text-[12px] font-semibold text-white whitespace-nowrap">
                    Ø {bar.days} {lang === "de" ? "Tage" : "days"}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="font-sans text-[11px] text-[var(--muted)] mt-4">
        {lang === "de" ? "* Keine Erfolgsgarantie." : "* No guarantee of results."}
      </p>
    </div>
  );
}

// ── Scatter Chart Component ────────────────────────────────────────────────────

function MultipleScatterChart({ lang }: { lang: string }) {
  return (
    <div>
      <h3 className="font-sans text-[16px] font-bold text-[var(--ink)] tracking-tight mb-1">
        {lang === "de" ? "Preisfindung & Verkaufsdauer" : "Pricing & sale duration"}
      </h3>
      <p className="font-sans text-[12px] text-[var(--muted)] mb-4">
        {lang === "de"
          ? "EBITDA-Multiple vs. Tage bis erstes Angebot · DACH 2025"
          : "EBITDA multiple vs. days to first offer · DACH 2025"}
      </p>

      <div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4">
            {[
              { color: "#fca5a5", label: lang === "de" ? "Unter Marktwert (<2,5×)" : "Below market (<2.5×)" },
              { color: "#86efac", label: lang === "de" ? "Marktgerecht (2,5–5,5×)"  : "Fair value (2.5–5.5×)" },
              { color: "#93c5fd", label: lang === "de" ? "Über Marktwert (>5,5×)"   : "Above market (>5.5×)"  },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: l.color }} />
                <span className="font-sans text-[12px] text-[var(--muted)]">{l.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-[var(--accent)] flex-shrink-0" style={{ borderTop: "2px dashed #2d5a3d" }} />
              <span className="font-sans text-[12px] text-[var(--muted)]">Ø DACH 4,2×</span>
            </div>
          </div>

        <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                {/* Colored zones */}
                <ReferenceArea x1={1} x2={2.5} fill="#fca5a5" fillOpacity={0.25} />
                <ReferenceArea x1={2.5} x2={5.5} fill="#86efac" fillOpacity={0.25} />
                <ReferenceArea x1={5.5} x2={8} fill="#93c5fd" fillOpacity={0.25} />
                {/* Ø DACH line */}
                <ReferenceLine x={4.2} stroke="#2d5a3d" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: "Ø 4,2×", position: "top", fontSize: 11, fill: "#2d5a3d" }} />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[1, 8]}
                  tickCount={8}
                  tick={{ fontSize: 11, fill: "#888" }}
                  label={{ value: lang === "de" ? "EBITDA-Multiple" : "EBITDA multiple", position: "insideBottom", offset: -10, fontSize: 11, fill: "#888" }}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  domain={[20, 130]}
                  tick={{ fontSize: 11, fill: "#888" }}
                  label={{ value: lang === "de" ? "Tage bis Angebot" : "Days to offer", angle: -90, position: "insideLeft", offset: 10, fontSize: 11, fill: "#888" }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const { x, y } = payload[0].payload as { x: number; y: number };
                    return (
                      <div className="bg-white border border-[var(--border)] rounded-lg px-3 py-2 text-[12px] font-sans shadow-sm">
                        <div>{lang === "de" ? "Multiple" : "Multiple"}: <strong>{x}×</strong></div>
                        <div>{lang === "de" ? "Tage" : "Days"}: <strong>{y}</strong></div>
                      </div>
                    );
                  }}
                />
                <Scatter data={SCATTER_DATA} fill="#2d5a3d" fillOpacity={0.7} r={5} />
              </ScatterChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const OUTCOMES = [
  { category: "Gastronomie", listingPrice: "€780K", finalPrice: "€810K", delta: "+4%",  duration: "47 Tage", plan: "Advanced", positive: true  },
  { category: "IT & SaaS",   listingPrice: "€2,1M",  finalPrice: "€2,35M", delta: "+12%", duration: "38 Tage", plan: "Premium",  positive: true  },
  { category: "Handwerk",    listingPrice: "€340K", finalPrice: "€310K", delta: "−9%",  duration: "89 Tage", plan: "Basic",    positive: false },
  { category: "E-Commerce",  listingPrice: "€1,9M",  finalPrice: "€2,1M",  delta: "+11%", duration: "29 Tage", plan: "Premium",  positive: true  },
];

const FAQ = [
  {
    q: "Gibt es eine Provision auf den Verkaufspreis?",
    a: "Nein. Firmadeal erhebt keine Provision auf den Verkaufspreis. Sie zahlen nur die monatliche Gebühr und behalten 100% des Verkaufserlöses.",
  },
  {
    q: "Kann ich meinen Plan jederzeit kündigen?",
    a: "Ja. Sie können jederzeit zum Ende des Abrechnungszeitraums kündigen. Keine Mindestlaufzeit.",
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
    q: "Kann ich meinen Plan upgraden?",
    a: "Ja. Sie können jederzeit auf einen höheren Plan upgraden. Der Preisunterschied wird anteilig berechnet.",
  },
];

export default function PricingPage() {
  const { lang } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-[var(--bg)] min-h-screen">

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
        <p className="font-sans text-[11px] font-semibold text-[var(--accent)] uppercase tracking-[0.2em] mb-4">
          {lang === "de" ? "Preise" : "Pricing"}
        </p>
        <h1 className="font-sans text-[clamp(30px,5vw,52px)] font-bold text-[var(--ink)] tracking-tight mb-4 leading-[1.05]">
          {lang === "de" ? <>Inserieren.<br />Keine Provision.</> : <>List your business.<br />No commission.</>}
        </h1>
        <p className="font-sans text-[16px] text-[var(--muted)] max-w-[480px] mx-auto leading-relaxed mb-6">
          {lang === "de"
            ? "Transparente Monatspreise. Kündbar. Sie behalten 100% des Verkaufserlöses."
            : "Transparent monthly pricing. Cancel anytime. Keep 100% of the sale proceeds."}
        </p>
        {/* Trial callout */}
        <div className="inline-flex items-center gap-2 bg-[var(--accent-light)] border border-[var(--accent)]/25 rounded-full px-5 py-2">
          <span className="font-sans text-[13px] font-semibold text-[var(--accent)]">
            {lang === "de" ? "Alle Pläne — 7 Tage kostenlos · Karte erforderlich · Keine Abbuchung in den ersten 7 Tagen" : "All plans — 7 days free · Card required · No charge for 7 days"}
          </span>
        </div>
      </section>

      {/* Charts side-by-side */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-[var(--border)] rounded-2xl p-6">
            <SaleDurationBars lang={lang} />
          </div>
          <div className="bg-white border border-[var(--border)] rounded-2xl p-6">
            <MultipleScatterChart lang={lang} />
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-sans text-[22px] font-bold text-[var(--ink)] tracking-tight text-center mb-2">
            {lang === "de" ? "Wählen Sie Ihren Plan" : "Choose your plan"}
          </h2>
          <p className="font-sans text-[14px] text-[var(--muted)] text-center mb-8">
            {lang === "de" ? "Jederzeit kündbar · 0% Provision" : "Cancel anytime · 0% commission"}
          </p>
          <PricingCards />
        </div>

        {/* 0% commission callout */}
        <div className="max-w-5xl mx-auto mt-8 bg-[var(--ink)] rounded-2xl p-7 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-sans text-[20px] font-bold text-white tracking-tight mb-1">
              {lang === "de" ? "0% Provision auf den Verkaufspreis" : "0% commission on the sale price"}
            </p>
            <p className="font-sans text-sm text-white/60">
              {lang === "de"
                ? "Anders als Makler nehmen wir keine Provision. 100% des Erlöses gehören Ihnen."
                : "Unlike brokers, we charge no commission. 100% of the proceeds are yours."}
            </p>
          </div>
          <Link
            href="/sell"
            className="flex-shrink-0 px-6 py-3 bg-white text-[var(--ink)] font-sans font-bold text-sm rounded-xl hover:bg-[var(--surface2)] transition-colors whitespace-nowrap"
          >
            {lang === "de" ? "Jetzt inserieren" : "List now"}
          </Link>
        </div>
      </section>

      {/* Outcomes table */}
      <section className="bg-white border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="mb-6">
            <h2 className="font-sans text-[22px] font-bold text-[var(--ink)] tracking-tight mb-1">
              {lang === "de" ? "Abgeschlossene Verkäufe" : "Completed sales"}
            </h2>
            <p className="font-sans text-[13px] text-[var(--muted)]">
              {lang === "de"
                ? "Beispielhafte Transaktionen zur Orientierung · Keine Garantie auf ähnliche Ergebnisse"
                : "Example transactions for reference · No guarantee of similar results"}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {[
                    lang === "de" ? "Branche" : "Industry",
                    lang === "de" ? "Inseratpreis" : "Listed at",
                    lang === "de" ? "Abschluss" : "Closed at",
                    lang === "de" ? "Dauer" : "Duration",
                    "Plan",
                  ].map((h) => (
                    <th key={h} className="text-left pb-3 font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide pr-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {OUTCOMES.map((o) => (
                  <tr key={o.category}>
                    <td className="py-3.5 font-sans text-[13px] font-semibold text-[var(--ink)] pr-6">{o.category}</td>
                    <td className="py-3.5 font-sans text-[13px] text-[var(--ink)] tabular-nums pr-6">{o.listingPrice}</td>
                    <td className="py-3.5 pr-6">
                      <span className="font-sans text-[13px] font-semibold text-[var(--ink)] tabular-nums">{o.finalPrice}</span>
                      <span className={`ml-2 font-sans text-[11px] font-bold ${o.positive ? "text-[var(--green)]" : "text-amber-600"}`}>
                        {o.delta}
                      </span>
                    </td>
                    <td className="py-3.5 font-sans text-[13px] text-[var(--muted)] tabular-nums pr-6">{o.duration}</td>
                    <td className="py-3.5">
                      <span className={`font-sans text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        o.plan === "Premium" ? "bg-[var(--accent)] text-white"
                        : o.plan === "Advanced" ? "bg-[var(--accent-light)] text-[var(--accent)]"
                        : "bg-[var(--surface2)] text-[var(--muted)]"
                      }`}>
                        {o.plan}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[var(--surface2)] border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="font-sans text-[22px] font-bold text-[var(--ink)] tracking-tight text-center mb-8">
            {lang === "de" ? "Häufige Fragen" : "Frequently asked questions"}
          </h2>
          <div className="space-y-2">
            {FAQ.map((faq, i) => (
              <div key={i} className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-sans text-[14px] font-semibold text-[var(--ink)]">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--muted)] flex-shrink-0 ml-3 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="font-sans text-[13px] text-[var(--muted)] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
