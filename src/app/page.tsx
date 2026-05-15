"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, ShieldCheck, MessageCircle, Lock,
  Building2, UtensilsCrossed, ShoppingBag, Factory,
  Briefcase, Monitor, Heart, Wrench, Calculator,
  ChevronDown, TrendingUp, Clock, Users, CheckCircle2,
  Bell, BarChart2, Landmark, Truck, Zap,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ListingCard from "@/components/ListingCard";
import { MOCK_LISTINGS } from "@/lib/mockData";

// ── Data ─────────────────────────────────────────────────────────────────────

const FEATURED = MOCK_LISTINGS.filter((l) => l.featured).slice(0, 4);

const CATEGORIES = [
  { label: "Gastronomie",    icon: UtensilsCrossed, count: 2, bg: "bg-orange-50",  text: "text-orange-700" },
  { label: "IT & Tech",      icon: Monitor,         count: 1, bg: "bg-blue-50",    text: "text-blue-700"   },
  { label: "Einzelhandel",   icon: ShoppingBag,     count: 0, bg: "bg-pink-50",    text: "text-pink-700"   },
  { label: "Produktion",     icon: Factory,         count: 1, bg: "bg-slate-50",   text: "text-slate-700"  },
  { label: "Dienstleistungen", icon: Briefcase,     count: 1, bg: "bg-amber-50",   text: "text-amber-700"  },
  { label: "Gesundheit",     icon: Heart,           count: 2, bg: "bg-red-50",     text: "text-red-700"    },
  { label: "Handwerk",       icon: Wrench,          count: 1, bg: "bg-lime-50",    text: "text-lime-700"   },
  { label: "Immobilien",     icon: Building2,       count: 1, bg: "bg-emerald-50", text: "text-emerald-700"},
];

const PROCESS_STEPS = [
  {
    n: "01",
    de: { title: "Unternehmen finden", desc: "Filtern Sie nach Branche, Region und Kaufpreis. Alle Finanzdaten auf einen Blick." },
    en: { title: "Find a business",   desc: "Filter by industry, region, and price. Full financial data at a glance." },
    icon: <TrendingUp size={20} />,
  },
  {
    n: "02",
    de: { title: "Direkt Kontakt", desc: "Schreiben Sie dem Verkäufer direkt. Kein Makler, keine Wartezeit." },
    en: { title: "Contact directly",  desc: "Message the seller directly. No broker, no waiting." },
    icon: <MessageCircle size={20} />,
  },
  {
    n: "03",
    de: { title: "Due Diligence",     desc: "Prüfen Sie Finanzen und Verträge. Wir stellen Ihnen eine Checkliste zur Verfügung." },
    en: { title: "Due diligence",     desc: "Review financials and contracts. We provide a checklist." },
    icon: <BarChart2 size={20} />,
  },
  {
    n: "04",
    de: { title: "Übergabe",          desc: "Vertrag unterschreiben, Zahlung abwickeln, Schlüssel übergeben." },
    en: { title: "Close the deal",    desc: "Sign the contract, process payment, hand over the keys." },
    icon: <CheckCircle2 size={20} />,
  },
];

const ACCORDION_ITEMS_DE = [
  { q: "Bewertung & LOI", a: "Verkäufer und Käufer einigen sich auf einen Richtwert. Ein Letter of Intent (LOI) sichert die Absicht beider Parteien und hält die wesentlichen Bedingungen fest." },
  { q: "KfW-Förderantrag", a: "Käufer können über KfW- oder Bürgschaftsprogramme bis zu 80 % des Kaufpreises finanzieren. Die Beantragung dauert typischerweise 4–8 Wochen." },
  { q: "Due Diligence", a: "Sie prüfen Buchhaltung, Verträge, Kundenstamm und Verbindlichkeiten. Wir stellen Ihnen eine strukturierte Checkliste zur Verfügung." },
  { q: "Notarieller Kaufvertrag", a: "Der Notar beurkundet den Kaufvertrag. Bei Anteilsübertragungen ist dies zwingend erforderlich. Dauer: 1–2 Wochen nach finaler Einigung." },
  { q: "Übergabe & Einarbeitung", a: "Der Verkäufer begleitet Sie in der Übergangsphase. Typisch: 1–3 Monate Einarbeitung, die vertraglich vereinbart wird." },
];

const ACCORDION_ITEMS_EN = [
  { q: "Valuation & LOI",    a: "Buyer and seller agree on a valuation. A Letter of Intent (LOI) documents the intent and key terms of the deal." },
  { q: "SBA/KfW loan application", a: "Buyers can finance up to 80% of the purchase price via government programs. Applications typically take 4–8 weeks." },
  { q: "Due diligence",     a: "Review accounting, contracts, customer base, and liabilities. We provide a structured checklist." },
  { q: "Notarized purchase agreement", a: "A notary certifies the purchase agreement. Required for share transfers. Duration: 1–2 weeks after final agreement." },
  { q: "Handover & training", a: "The seller supports you during the transition. Typical: 1–3 months of onboarding, contractually agreed." },
];

const FAQS_DE = [
  { q: "Was kostet eine Bewertung?",             a: "Unsere Bewertungsschätzung ist vollständig kostenlos. Eine formelle Unternehmensbewertung durch einen Wirtschaftsprüfer liegt typischerweise zwischen €1.500 und €5.000." },
  { q: "Bleibt mein Inserat anonym?",            a: "Ja. Sie bestimmen, wann Sie Ihren Namen und Firmennamen preisgeben. Anfragen erhalten Sie zunächst anonymisiert." },
  { q: "Wie lange dauert ein Unternehmensverkauf?", a: "Im Schnitt 4–9 Monate. Gut vorbereitete Verkäufer mit vollständigen Finanzdaten verkaufen deutlich schneller." },
  { q: "Welche Unterlagen brauche ich?",         a: "Betriebswirtschaftliche Auswertungen (BWA) der letzten 3 Jahre, Jahresabschlüsse, Kundenliste (anonymisiert), Mietverträge." },
  { q: "Was bedeutet 0% Provision?",             a: "Wir verdienen ausschließlich an den Inserats-Gebühren. Es gibt keine versteckte Käufer- oder Verkäuferprovision." },
];

const FAQS_EN = [
  { q: "What does a valuation cost?",              a: "Our valuation estimate is completely free. A formal business valuation by a CPA typically costs €1,500 to €5,000." },
  { q: "Does my listing stay anonymous?",          a: "Yes. You control when to reveal your name and company. Initial inquiries are anonymized." },
  { q: "How long does a business sale take?",      a: "On average 4–9 months. Well-prepared sellers with complete financials close significantly faster." },
  { q: "What documents do I need?",               a: "P&L statements for the last 3 years, annual accounts, anonymized customer list, rental agreements." },
  { q: "What does 0% commission mean?",           a: "We earn exclusively from listing fees. There is no hidden buyer's or seller's commission." },
];

const INDUSTRY_MULTIPLES: Record<string, { lo: number; hi: number }> = {
  "Gastronomie":      { lo: 0.4, hi: 0.8  },
  "IT & Tech":        { lo: 1.8, hi: 4.5  },
  "Einzelhandel":     { lo: 0.3, hi: 0.6  },
  "Dienstleistungen": { lo: 0.8, hi: 2.0  },
  "Handwerk":         { lo: 0.5, hi: 1.1  },
  "Gesundheit":       { lo: 1.2, hi: 2.8  },
  "Immobilien":       { lo: 1.5, hi: 3.2  },
  "Produktion":       { lo: 0.7, hi: 1.4  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function ValuationWidget() {
  const { lang } = useLanguage();
  const [category, setCategory] = useState("");
  const [revenue, setRevenue] = useState("");
  const [shown, setShown] = useState(false);

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    setShown(true);
  };

  const m = INDUSTRY_MULTIPLES[category] ?? { lo: 0.5, hi: 1.5 };
  const rev = parseFloat(revenue.replace(/\./g, "").replace(",", ".")) || 0;
  const lo = Math.round((rev * m.lo) / 1000) * 1000;
  const hi = Math.round((rev * m.hi) / 1000) * 1000;

  const fmtK = (n: number) =>
    n >= 1_000_000
      ? `€${(n / 1_000_000).toFixed(1).replace(".", ",")} Mio.`
      : `€${(n / 1_000).toFixed(0)}k`;

  return (
    <div className="w-full max-w-[360px] bg-white rounded-2xl border border-[var(--border)] p-6 shadow-[0_8px_40px_rgba(28,63,94,0.10)]">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse-dot" />
        <span className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide">
          {lang === "de" ? "Kostenlose Bewertung" : "Free valuation"}
        </span>
      </div>
      <h3 className="font-fraunces text-[22px] text-[var(--ink)] mb-4 leading-snug">
        {lang === "de" ? "Was ist Ihr Unternehmen wert?" : "What is your business worth?"}
      </h3>

      <form onSubmit={calculate} className="space-y-3">
        <div>
          <label className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wide block mb-1">
            {lang === "de" ? "Branche" : "Industry"}
          </label>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setShown(false); }}
            required
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans bg-white outline-none focus:border-[var(--accent)] transition-colors"
          >
            <option value="">{lang === "de" ? "Branche wählen…" : "Choose industry…"}</option>
            {Object.keys(INDUSTRY_MULTIPLES).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wide block mb-1">
            {lang === "de" ? "Jahresumsatz (€)" : "Annual revenue (€)"}
          </label>
          <input
            type="number"
            value={revenue}
            onChange={(e) => { setRevenue(e.target.value); setShown(false); }}
            placeholder="800000"
            required
            min={10000}
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-[var(--accent)] text-white font-sans font-semibold text-sm rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-150"
        >
          {lang === "de" ? "Bewertung anzeigen →" : "Show valuation →"}
        </button>
      </form>

      {shown && rev > 0 && (
        <div className="mt-4 p-4 bg-[var(--accent-light)] rounded-xl border border-[var(--accent)]/15">
          <p className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-wide mb-1">
            {lang === "de" ? "Geschätzter Unternehmenswert" : "Estimated business value"}
          </p>
          <p className="font-fraunces text-[26px] text-[var(--ink)] leading-none">
            {fmtK(lo)} – {fmtK(hi)}
          </p>
          <p className="font-mono text-[10px] text-[var(--muted)] mt-2">
            {lang === "de"
              ? `Basierend auf ${m.lo}x–${m.hi}x Umsatz-Multiple für ${category}`
              : `Based on ${m.lo}x–${m.hi}x revenue multiple for ${category}`}
          </p>
          <Link
            href="/sell"
            className="block mt-3 text-center text-sm font-sans font-medium text-[var(--accent)] hover:underline"
          >
            {lang === "de" ? "Jetzt inserieren →" : "List now →"}
          </Link>
        </div>
      )}

      <p className="font-mono text-[9px] text-[var(--muted)] text-center mt-3">
        {lang === "de"
          ? "Richtwert · Keine Haftung · Keine Weitergabe"
          : "Estimate only · No liability · Data not shared"}
      </p>
    </div>
  );
}

function AffordabilityCalculator() {
  const { lang } = useLanguage();
  const [budget, setBudget] = useState(500000);
  const [downPct, setDownPct] = useState(30);
  const RATE = 0.058; // 5.8% p.a. typical German business loan
  const YEARS = 10;

  const down = Math.round(budget * (downPct / 100));
  const loan = budget - down;
  const r = RATE / 12;
  const n = YEARS * 12;
  const monthly = loan > 0 ? Math.round((loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : 0;

  const fmtE = (n: number) =>
    n >= 1_000_000
      ? `€${(n / 1_000_000).toFixed(2).replace(".", ",")} Mio.`
      : `€${n.toLocaleString("de-DE")}`;

  const matchCount = MOCK_LISTINGS.filter(
    (l) => !l.price_confidential && l.asking_price !== null && l.asking_price <= budget
  ).length;

  return (
    <section className="bg-[var(--surface2)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left: copy */}
          <div>
            <p className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-[0.15em] mb-4">
              {lang === "de" ? "Für Käufer" : "For buyers"}
            </p>
            <h2 className="font-fraunces text-[clamp(28px,4vw,44px)] text-[var(--ink)] leading-[1.05] mb-5">
              {lang === "de"
                ? "Können Sie sich ein Unternehmen leisten?"
                : "Can you afford to buy a business?"}
            </h2>
            <p className="font-sans text-[15px] text-[var(--muted)] leading-relaxed mb-8 max-w-[420px]">
              {lang === "de"
                ? "Verschieben Sie den Schieberegler und sehen Sie Ihre monatliche Rate — sofort, ohne Anmeldung."
                : "Move the slider and see your monthly payment — instantly, no sign-up required."}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: lang === "de" ? "Kaufpreis" : "Budget",        value: fmtE(budget) },
                { label: lang === "de" ? "Eigenkapital" : "Down payment", value: fmtE(down) },
                { label: lang === "de" ? "Rate/Monat" : "Monthly rate",  value: `€${monthly.toLocaleString("de-DE")}` },
              ].map((m) => (
                <div key={m.label} className="bg-white border border-[var(--border)] rounded-xl p-4">
                  <div className="font-fraunces text-[22px] text-[var(--ink)] leading-none mb-1">
                    {m.value}
                  </div>
                  <div className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wide">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            {matchCount > 0 && (
              <div className="mt-5 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse-dot" />
                <span className="font-sans text-sm text-[var(--ink)]">
                  <span className="font-semibold">{matchCount}</span>{" "}
                  {lang === "de"
                    ? `Inserat${matchCount !== 1 ? "e" : ""} in Ihrem Budget`
                    : `listing${matchCount !== 1 ? "s" : ""} within your budget`}
                </span>
                <Link href={`/listings`} className="font-sans text-sm text-[var(--accent)] hover:underline">
                  {lang === "de" ? "Anzeigen →" : "Browse →"}
                </Link>
              </div>
            )}
          </div>

          {/* Right: sliders */}
          <div className="bg-white border border-[var(--border)] rounded-2xl p-8 space-y-8">
            {/* Budget slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide">
                  {lang === "de" ? "Kaufbudget" : "Purchase budget"}
                </label>
                <span className="font-fraunces text-[18px] text-[var(--ink)]">{fmtE(budget)}</span>
              </div>
              <input
                type="range"
                min={50000} max={5000000} step={50000}
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-full bg-[var(--border)] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between mt-1.5">
                <span className="font-mono text-[10px] text-[var(--muted)]">€50k</span>
                <span className="font-mono text-[10px] text-[var(--muted)]">€5 Mio.</span>
              </div>
            </div>

            {/* Down payment slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide">
                  {lang === "de" ? "Eigenkapitalanteil" : "Down payment %"}
                </label>
                <span className="font-fraunces text-[18px] text-[var(--ink)]">{downPct}%</span>
              </div>
              <input
                type="range"
                min={10} max={80} step={5}
                value={downPct}
                onChange={(e) => setDownPct(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-full bg-[var(--border)] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between mt-1.5">
                <span className="font-mono text-[10px] text-[var(--muted)]">10%</span>
                <span className="font-mono text-[10px] text-[var(--muted)]">80%</span>
              </div>
            </div>

            {/* Calculated summary */}
            <div className="border-t border-[var(--border)] pt-6 space-y-3">
              {[
                { label: lang === "de" ? "Darlehen" : "Loan amount",        value: fmtE(loan) },
                { label: lang === "de" ? "Laufzeit" : "Loan term",           value: `${YEARS} ${lang === "de" ? "Jahre" : "years"}` },
                { label: lang === "de" ? "Zinssatz (ca.)" : "Rate (approx.)", value: `${(RATE * 100).toFixed(1)}% p.a.` },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-[var(--muted)]">{row.label}</span>
                  <span className="font-sans text-sm text-[var(--ink)] font-medium">{row.value}</span>
                </div>
              ))}
              <div className="bg-[var(--accent-light)] rounded-xl p-4 flex items-center justify-between mt-4 border border-[var(--accent)]/15">
                <div>
                  <div className="font-mono text-[10px] text-[var(--accent)] uppercase tracking-wide">
                    {lang === "de" ? "Monatliche Rate" : "Monthly payment"}
                  </div>
                  <div className="font-fraunces text-[28px] text-[var(--accent)] leading-none mt-0.5">
                    €{monthly.toLocaleString("de-DE")}
                  </div>
                </div>
                <Link
                  href="/listings"
                  className="flex items-center gap-1.5 bg-[var(--accent)] text-white font-sans font-medium text-sm px-4 py-2.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  {lang === "de" ? "Jetzt suchen" : "Browse now"}
                  <ArrowRight size={14} />
                </Link>
              </div>
              <p className="font-mono text-[9px] text-[var(--muted)] text-center pt-1">
                {lang === "de"
                  ? "Indikative Berechnung · Kein Finanzierungsangebot"
                  : "Indicative calculation · Not a financing offer"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-sans text-[15px] font-medium text-white group-hover:text-white/80 transition-colors pr-6">
          {q}
        </span>
        <ChevronDown
          size={18}
          className={`text-white/50 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-5 font-sans text-[14px] text-white/60 leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border)]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="font-sans text-[15px] font-medium text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors pr-6">
          {q}
        </span>
        <ChevronDown
          size={18}
          className={`text-[var(--muted)] flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-5 font-sans text-[14px] text-[var(--muted)] leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const faqs = lang === "de" ? FAQS_DE : FAQS_EN;
  const accordion = lang === "de" ? ACCORDION_ITEMS_DE : ACCORDION_ITEMS_EN;

  const TICKER_ITEMS = [
    lang === "de" ? "1.247 aktive Käufer" : "1,247 active buyers",
    lang === "de" ? "0% Provision" : "0% commission",
    lang === "de" ? "47 neue Inserate diese Woche" : "47 new listings this week",
    lang === "de" ? "Ø 4:23 Min. zum Inserieren" : "Avg. 4:23 min to list",
    lang === "de" ? "DSGVO-konform" : "GDPR compliant",
    lang === "de" ? "€2,3 Mrd. Transaktionsvolumen" : "€2.3B in transaction volume",
    lang === "de" ? "Keine versteckten Kosten" : "No hidden costs",
    lang === "de" ? "Direkte Kommunikation" : "Direct communication",
  ];

  return (
    <div className="bg-[var(--bg)]">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-[58fr_42fr] min-h-[580px]">

        {/* Left: dark photo side */}
        <div className="relative flex flex-col justify-end px-8 py-14 sm:px-12 sm:py-16 overflow-hidden min-h-[460px] lg:min-h-0">
          {/* Background */}
          <div className="absolute inset-0 bg-[#0B1E2D]">
            <Image
              src="https://picsum.photos/seed/firmadeal-office/1200/800"
              alt=""
              fill
              className="object-cover opacity-30 mix-blend-luminosity"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B1E2D]/80 via-[#1C3F5E]/50 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-[560px]">
            <p className="font-mono text-[11px] text-white/50 uppercase tracking-[0.2em] mb-5 animate-fade-up">
              {lang === "de" ? "Der DACH-Marktplatz für Unternehmensverkäufe" : "The DACH business marketplace"}
            </p>
            <h1 className="font-fraunces text-[clamp(34px,5vw,56px)] text-white leading-[1.04] mb-5 animate-fade-up animate-fade-up-d1">
              {lang === "de"
                ? "Finden Sie den richtigen Käufer für Ihr Unternehmen."
                : "Find the right buyer for your business."}
            </h1>
            <p className="font-sans text-[17px] text-white/65 max-w-[460px] mb-8 leading-relaxed animate-fade-up animate-fade-up-d2">
              {lang === "de"
                ? "Transparente Inserate. Direkte Kommunikation. Keine Provision."
                : "Transparent listings. Direct communication. Zero commission."}
            </p>

            <div className="flex flex-wrap gap-3 mb-10 animate-fade-up animate-fade-up-d3">
              <Link
                href="/sell"
                className="flex items-center gap-2 bg-white text-[var(--ink)] font-sans font-semibold px-6 py-3 rounded-full hover:bg-[var(--accent-light)] active:scale-[0.98] transition-all duration-150"
              >
                {lang === "de" ? "Unternehmen inserieren" : "List your business"}
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/listings"
                className="flex items-center gap-2 border border-white/30 text-white font-sans font-medium px-6 py-3 rounded-full hover:bg-white/10 active:scale-[0.98] transition-all duration-150"
              >
                {lang === "de" ? "Unternehmen suchen" : "Browse businesses"}
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-5">
              {[
                { icon: <ShieldCheck size={13} />, label: lang === "de" ? "Keine Provision" : "No commission" },
                { icon: <Lock size={13} />,        label: lang === "de" ? "DSGVO-konform" : "GDPR compliant" },
                { icon: <CheckCircle2 size={13} />, label: lang === "de" ? "Verifiziert" : "Verified" },
              ].map((t) => (
                <div key={t.label} className="flex items-center gap-1.5 font-mono text-[11px] text-white/50">
                  {t.icon}
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: valuation widget */}
        <div className="bg-[var(--bg)] flex items-center justify-center p-8 lg:p-12 border-l border-[var(--border)]">
          <ValuationWidget />
        </div>
      </section>

      {/* ── LIVE TICKER ───────────────────────────────────────────────────── */}
      <div className="bg-[var(--ink)] overflow-hidden py-3 border-b border-white/5">
        <div className="animate-marquee">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-6 px-6 font-mono text-[11px] text-white/40 whitespace-nowrap">
              {item}
              <span className="w-1 h-1 rounded-full bg-white/20" />
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-[var(--border)] bg-[var(--surface2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-[var(--border)]">
            {[
              { value: "1.247",    label: lang === "de" ? "Aktive Käufer" : "Active buyers"     },
              { value: "0%",       label: lang === "de" ? "Provision" : "Commission"             },
              { value: "4:23",     label: lang === "de" ? "Min. zum Inserieren" : "Min to list" },
              { value: "€2,3 Mrd", label: lang === "de" ? "Transaktionsvolumen" : "Deal volume" },
            ].map((stat) => (
              <div key={stat.label} className="text-center pl-8 first:pl-0">
                <div className="font-fraunces text-[36px] text-[var(--accent)] leading-none mb-1">
                  {stat.value}
                </div>
                <div className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-[0.15em] mb-2">
              {lang === "de" ? "Live Marktplatz" : "Live marketplace"}
            </p>
            <h2 className="font-fraunces text-[clamp(24px,3.5vw,32px)] text-[var(--ink)]">
              {lang === "de" ? "Aktuelle Inserate" : "Businesses for sale"}
            </h2>
          </div>
          <Link
            href="/listings"
            className="flex items-center gap-1.5 font-sans text-sm font-medium text-[var(--accent)] hover:underline"
          >
            {lang === "de" ? "Alle anzeigen" : "View all"}
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* 2-col asymmetric grid: 1 wide + 3 normal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURED.slice(0, 4).map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 border border-[var(--border)] text-[var(--ink)] font-sans font-medium px-7 py-3 rounded-full hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] active:scale-[0.98] transition-all duration-200"
          >
            {lang === "de" ? "Alle Inserate durchsuchen" : "Browse all listings"}
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── AFFORDABILITY CALCULATOR ──────────────────────────────────────── */}
      <AffordabilityCalculator />

      {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-[0.15em] mb-2">
              {lang === "de" ? "Nach Branche suchen" : "Browse by sector"}
            </p>
            <h2 className="font-fraunces text-[clamp(24px,3.5vw,32px)] text-[var(--ink)]">
              {lang === "de" ? "Finden Sie Ihre Branche" : "Find businesses in your sector"}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CATEGORIES.map(({ label, icon: Icon, count, bg, text }) => (
            <Link
              key={label}
              href={`/listings?category=${encodeURIComponent(label)}`}
              className="group flex flex-col items-center gap-3 p-5 bg-white border border-[var(--border)] rounded-xl hover:border-[var(--accent)] hover:shadow-sm active:scale-[0.98] transition-all duration-200"
            >
              <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                <Icon size={20} className={text} strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <div className="font-sans text-[13px] font-semibold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                  {label}
                </div>
                <div className="font-mono text-[10px] text-[var(--muted)] mt-0.5">
                  {count} {lang === "de" ? "Inserate" : "listings"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── PROCESS ───────────────────────────────────────────────────────── */}
      <section className="bg-[var(--surface2)] border-t border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <p className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-[0.15em] mb-3">
              {lang === "de" ? "Der Prozess" : "The process"}
            </p>
            <h2 className="font-fraunces text-[clamp(24px,3.5vw,36px)] text-[var(--ink)]">
              {lang === "de" ? "Einfach von Anfang bis Abschluss" : "Simple from start to finish"}
            </h2>
            <p className="font-sans text-[15px] text-[var(--muted)] mt-3 max-w-[440px] mx-auto">
              {lang === "de"
                ? "Vier Schritte, um das richtige Unternehmen für Ihre Pläne zu finden"
                : "Four steps to find the right business for your plans"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)]">
            {PROCESS_STEPS.map((step) => (
              <div key={step.n} className="bg-[var(--surface2)] p-8">
                <div className="font-mono text-[11px] text-[var(--accent)] mb-4">{step.n}</div>
                <div className="w-10 h-10 rounded-xl bg-white border border-[var(--border)] flex items-center justify-center mb-5 text-[var(--accent)]">
                  {step.icon}
                </div>
                <h3 className="font-sans text-[15px] font-semibold text-[var(--ink)] mb-2">
                  {lang === "de" ? step.de.title : step.en.title}
                </h3>
                <p className="font-sans text-[13px] text-[var(--muted)] leading-relaxed">
                  {lang === "de" ? step.de.desc : step.en.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-semibold px-7 py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
            >
              {lang === "de" ? "Jetzt starten →" : "Get started →"}
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW A TAKEOVER WORKS (dark accordion) ─────────────────────────── */}
      <section className="bg-[var(--ink)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[42fr_58fr] gap-16 items-start">
            <div>
              <p className="font-mono text-[11px] text-white/40 uppercase tracking-[0.15em] mb-4">
                {lang === "de" ? "Übernahme-Leitfaden" : "Acquisition guide"}
              </p>
              <h2 className="font-fraunces text-[clamp(26px,4vw,40px)] text-white leading-[1.06] mb-5">
                {lang === "de"
                  ? "Wie funktioniert eine Unternehmensübernahme?"
                  : "How does a business acquisition work?"}
              </h2>
              <p className="font-sans text-[15px] text-white/55 leading-relaxed max-w-[360px]">
                {lang === "de"
                  ? "Von der ersten Bewertung bis zur Schlüsselübergabe — ein klarer Pfad in 5 Schritten."
                  : "From initial valuation to key handover — a clear path in 5 steps."}
              </p>
            </div>

            <div>
              {accordion.map((item) => (
                <AccordionItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUE PROPS ───────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
            {[
              {
                icon: <ShieldCheck size={22} className="text-[var(--accent)]" />,
                title: lang === "de" ? "Keine Provision" : "Zero commission",
                desc:  lang === "de" ? "Sie behalten 100% des Verkaufserlöses. Unser Verdienst kommt ausschließlich aus der einmaligen Inseratsgebühr." : "You keep 100% of the sale proceeds. We earn solely from the one-time listing fee.",
              },
              {
                icon: <MessageCircle size={22} className="text-[var(--accent)]" />,
                title: lang === "de" ? "Direkte Kommunikation" : "Direct communication",
                desc:  lang === "de" ? "Käufer kontaktieren Sie direkt ohne Zwischenhändler. Sie entscheiden, mit wem Sie sprechen." : "Buyers contact you directly, no intermediaries. You decide who to engage with.",
              },
              {
                icon: <Lock size={22} className="text-[var(--accent)]" />,
                title: lang === "de" ? "Vertraulich & sicher" : "Confidential & secure",
                desc:  lang === "de" ? "Inserieren Sie anonym bis Sie bereit sind. Alle Daten werden DSGVO-konform verarbeitet." : "List anonymously until you're ready. All data is processed GDPR-compliant.",
              },
            ].map((v, i) => (
              <div key={v.title} className={`p-8 ${i > 0 ? "md:pl-10" : ""}`}>
                <div className="w-11 h-11 bg-[var(--accent-light)] rounded-xl flex items-center justify-center mb-5">
                  {v.icon}
                </div>
                <h3 className="font-fraunces text-[20px] text-[var(--ink)] mb-3">{v.title}</h3>
                <p className="font-sans text-[14px] text-[var(--muted)] leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-[var(--surface2)] border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <p className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-[0.15em] mb-3">FAQ</p>
            <h2 className="font-fraunces text-[clamp(24px,3.5vw,36px)] text-[var(--ink)]">
              {lang === "de" ? "Häufige Fragen" : "Frequently asked questions"}
            </h2>
          </div>
          <div className="bg-white rounded-2xl border border-[var(--border)] px-6 divide-y divide-[var(--border)]">
            {faqs.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ────────────────────────────────────────────────────── */}
      <section className="border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bell size={16} className="text-[var(--accent)]" />
                <span className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide">
                  {lang === "de" ? "Deal-Alarm" : "Deal alerts"}
                </span>
              </div>
              <h2 className="font-fraunces text-[clamp(24px,3.5vw,36px)] text-[var(--ink)] leading-tight mb-4">
                {lang === "de"
                  ? "Neue Inserate direkt in Ihren Posteingang"
                  : "Get new deals directly in your inbox"}
              </h2>
              <p className="font-sans text-[15px] text-[var(--muted)] leading-relaxed max-w-[400px]">
                {lang === "de"
                  ? "Erhalten Sie wöchentlich die besten neuen Inserate passend zu Ihren Kriterien. Abmeldung jederzeit."
                  : "Get the best new listings matching your criteria weekly. Unsubscribe any time."}
              </p>
            </div>
            <div>
              {subscribed ? (
                <div className="flex items-center gap-3 p-6 bg-green-50 border border-green-200 rounded-2xl">
                  <CheckCircle2 size={24} className="text-[var(--green)] flex-shrink-0" />
                  <div>
                    <p className="font-sans text-[15px] font-semibold text-[var(--green)]">
                      {lang === "de" ? "Angemeldet!" : "Subscribed!"}
                    </p>
                    <p className="font-sans text-sm text-[var(--muted)]">
                      {lang === "de"
                        ? "Sie erhalten Ihre erste E-Mail diese Woche."
                        : "You'll receive your first email this week."}
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); if (email) setSubscribed(true); }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={lang === "de" ? "ihre@email.de" : "your@email.com"}
                    required
                    className="flex-1 px-4 py-3.5 border border-[var(--border)] rounded-xl text-sm font-sans outline-none focus:border-[var(--accent)] transition-colors"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-sans font-semibold text-sm px-6 py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all whitespace-nowrap"
                  >
                    {lang === "de" ? "Anmelden →" : "Subscribe →"}
                  </button>
                </form>
              )}
              <p className="font-mono text-[10px] text-[var(--muted)] mt-3">
                {lang === "de"
                  ? "Kein Spam. Keine Weitergabe. DSGVO-konform."
                  : "No spam. No sharing. GDPR compliant."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-[var(--accent)] border-t border-[var(--accent)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[60fr_40fr] gap-10 items-center">
            <div>
              <p className="font-mono text-[11px] text-white/50 uppercase tracking-[0.15em] mb-4">
                {lang === "de" ? "Jetzt starten" : "Get started"}
              </p>
              <h2 className="font-fraunces text-[clamp(28px,4vw,48px)] text-white leading-[1.05]">
                {lang === "de"
                  ? "Inserieren Sie Ihr Unternehmen. Finden Sie den richtigen Käufer."
                  : "List your business. Find the right buyer."}
              </h2>
              <p className="font-sans text-[16px] text-white/60 mt-4 max-w-[420px] leading-relaxed">
                {lang === "de"
                  ? "Join 1.247 aktiven Käufern — 100% DACH, 0% Provision."
                  : "Join 1,247 active buyers — 100% DACH, 0% commission."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-start">
              <Link
                href="/sell"
                className="flex items-center justify-center gap-2 bg-white text-[var(--accent)] font-sans font-semibold px-7 py-4 rounded-full hover:bg-[var(--accent-light)] active:scale-[0.98] transition-all"
              >
                {lang === "de" ? "Kostenlos inserieren →" : "List for free →"}
              </Link>
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2 border border-white/30 text-white font-sans font-medium px-7 py-4 rounded-full hover:bg-white/10 active:scale-[0.98] transition-all"
              >
                {lang === "de" ? "Preise ansehen" : "View pricing"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
