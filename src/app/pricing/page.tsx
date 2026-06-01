"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";

// ── Sale Duration Bars ────────────────────────────────────────────────────────

function SaleDurationBars() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const bars = [
    { label: "Monatsplan",  days: 89, pct: 100, color: "#9ca3af", bg: "#f3f4f6" },
    { label: "Jahrespaket", days: 52, pct:  58, color: "#1A5C3A", bg: "#e8f5ed" },
  ];

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl p-5">
      <p className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest mb-4">
        ⏱ Zeit bis erstes Angebot
      </p>
      <div ref={ref} className="space-y-3">
        {bars.map((bar, i) => (
          <div key={bar.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-sans text-[12px] font-semibold text-[var(--ink)]">{bar.label}</span>
              <span className="font-sans text-[13px] font-bold tabular-nums" style={{ color: bar.color }}>
                {bar.days}d
              </span>
            </div>
            <div className="h-6 rounded-lg overflow-hidden" style={{ background: bar.bg }}>
              <div
                className="h-full rounded-lg flex items-center pl-3"
                style={{
                  width: inView ? `${bar.pct}%` : "0%",
                  background: bar.color,
                  transition: `width 1.3s cubic-bezier(0.16,1,0.3,1) ${i * 0.18}s`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl p-3 flex items-center gap-3" style={{ background: "#e8f5ed" }}>
        <span className="font-sans text-[22px] font-bold tabular-nums" style={{ color: "#1A5C3A" }}>37d</span>
        <div>
          <p className="font-sans text-[12px] font-bold" style={{ color: "#1A5C3A" }}>schneller zum ersten Angebot</p>
          <p className="font-sans text-[10px] text-[var(--muted)]">mit dem Jahrespaket · 2× mehr Käufer</p>
        </div>
      </div>
    </div>
  );
}

// ── Buyer Types sidebar ───────────────────────────────────────────────────────

const BUYERS = [
  { icon: "🏢", label: "Private Equity & Family Offices", count: "847" },
  { icon: "👤", label: "Unternehmer & MBI-Kandidaten",    count: "2.340" },
  { icon: "🔍", label: "Search Funds & ETA",              count: "156" },
  { icon: "🤝", label: "Strategische Käufer",             count: "1.203" },
];

// ── Monthly features ──────────────────────────────────────────────────────────

const MONTHLY_FEATURES = [
  "Listing sichtbar im Marktplatz",
  "500 aktive Käufer/Monat kontaktieren Sie direkt",
  "Anonymes Inserat — Daten bleiben geschützt",
  "Automatische Unternehmensbewertung",
  "7-Tage Markttest-Bericht",
  "0% Provision auf den Verkaufspreis",
];

const YEARLY_BASE = [
  "Listing sichtbar im Marktplatz",
  "1.000 Käufer/Monat — 2× mehr als Monatsplan",
  "Anonymes Inserat — Daten bleiben geschützt",
  "Automatische Unternehmensbewertung",
  "7-Tage Markttest-Bericht",
  "0% Provision auf den Verkaufspreis",
  "Top-Platzierung vor allen Monats-Inseraten",
];

const YEARLY_EXCLUSIVE = [
  "Wöchentlicher Newsletter an 8.000+ aktive Investoren",
  "Direktes Käufer-Matching nach Branche, Region & Größe — wir leiten Ihr Inserat aktiv an PE-Fonds, Unternehmer und strategische Käufer weiter",
];

// ── FAQ ───────────────────────────────────────────────────────────────────────

const FAQ = [
  {
    q: "Wie funktioniert das Käufer-Matching genau?",
    a: "Unser System analysiert Branche, Standort und Unternehmensgröße und leitet Ihr Inserat automatisch an registrierte Käufer weiter, die aktiv in Ihrem Segment suchen. Jahrespaket-Inserate werden dabei priorisiert behandelt.",
  },
  {
    q: "Bleibt mein Inserat vollständig anonym?",
    a: "Ja. Ihr Name, Ihre Kontaktdaten und alle Unternehmensinformationen bleiben bis zu Ihrer ausdrücklichen Freigabe vollständig geschützt.",
  },
  {
    q: "Was passiert nach der 7-tägigen Testphase?",
    a: "Nach 7 Tagen wird automatisch Ihr gewählter Plan aktiviert. Sie können jederzeit vor Ablauf kündigen — ohne Fragen, ohne Aufwand.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [openFaq, setOpenFaq]           = useState<number | null>(null);
  const [email, setEmail]               = useState("");
  const [newsletterState, setNewsletter] = useState<"idle"|"loading"|"success"|"duplicate"|"error">("idle");
  const [visible, setVisible]           = useState(false);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletter("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 409) { setNewsletter("duplicate"); return; }
      if (!res.ok)            { setNewsletter("error");     return; }
      setNewsletter("success");
      setEmail("");
    } catch { setNewsletter("error"); }
  };

  const cardBase = "transition-all duration-700";
  const show     = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(14px)",
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  return (
    <div className="bg-[var(--bg)] min-h-screen">

      {/* ── Compact Header ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-5 text-center">
        <h1 className="font-sans text-[clamp(20px,3.5vw,36px)] font-bold text-[var(--ink)] tracking-tight mb-2 leading-[1.1]">
          Wählen Sie Ihren Plan — 7 Tage kostenlos
        </h1>
        <p className="font-sans text-[13px] text-[var(--muted)] mb-4">
          0% Provision · Kein Makler · Sofort live
        </p>
        {/* Live stats */}
        <div className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 bg-white border border-[var(--border)] rounded-full px-5 py-2 shadow-sm text-[13px] font-sans font-semibold text-[var(--ink)]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
            127 aktive Inserate
          </span>
          <span className="text-[var(--border)] hidden sm:block">·</span>
          <span>3.847 registrierte Käufer</span>
          <span className="text-[var(--border)] hidden sm:block">·</span>
          <span>Ø 94 Tage bis Abschluss</span>
        </div>
      </section>

      {/* ── 3-Column Pricing Grid ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1.15fr_1fr] gap-5 items-start max-w-6xl mx-auto">

          {/* ── Monthly Card ── */}
          <div
            className={`${cardBase} relative bg-white border border-[var(--border)] rounded-2xl flex flex-col p-6`}
            style={show(0)}
          >
            <h3 className="font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-3">
              Firmadeal Listing
            </h3>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-sans text-[44px] font-bold text-[var(--ink)] tracking-tight leading-none tabular-nums">€39</span>
              <span className="font-sans text-[13px] text-[var(--muted)]">/Monat</span>
            </div>
            <p className="font-sans text-[11px] text-[var(--muted)] mb-4">Nach 7 Tagen · Jederzeit kündbar</p>

            {/* Gray pills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {["500 Käufer/Monat", "Ø 90–180 Tage", "0% Provision"].map((p) => (
                <span key={p} className="font-sans text-[10px] font-medium text-[var(--muted)] bg-[var(--surface2)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                  {p}
                </span>
              ))}
            </div>

            <ul className="space-y-2 mb-5 flex-1">
              {MONTHLY_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={12} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
                  <span className="font-sans text-[12px] text-[var(--ink)]">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/sell"
              className="block text-center w-full py-3 rounded-xl font-sans font-bold text-[13px] border-2 border-[var(--border)] text-[var(--ink)] hover:border-[#1A5C3A] hover:text-[#1A5C3A] transition-all duration-200"
            >
              7 Tage kostenlos starten →
            </Link>
            <p className="font-sans text-[10px] text-[var(--muted)] text-center mt-2.5 leading-snug">
              Kein Newsletter · Keine Käufergruppen · Keine Top-Platzierung
            </p>
          </div>

          {/* ── Yearly Card ── */}
          <div
            className={`${cardBase} animate-border-glow relative bg-white rounded-2xl flex flex-col p-6`}
            style={{ border: "2.5px solid #1A5C3A", ...show(80) }}
          >
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="animate-float-badge font-sans text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500 text-white whitespace-nowrap">
                ⭐ Beliebteste Wahl — 59% günstiger
              </span>
              <span className="font-sans text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500 text-white whitespace-nowrap">
                🔥 Nur noch 3 Plätze
              </span>
            </div>

            <h3 className="font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mb-1">
              Firmadeal Jahrespaket
            </h3>
            <p className="font-sans text-[12px] text-[var(--muted)] line-through mb-0.5">€468/Jahr</p>
            <div className="flex items-baseline gap-1 mb-0.5">
              <span className="font-sans font-bold text-[var(--ink)] tracking-tight leading-none tabular-nums" style={{ fontSize: 56 }}>
                €189
              </span>
              <span className="font-sans text-[14px] text-[var(--muted)]">/Jahr</span>
            </div>
            <p className="font-sans text-[11px] text-[var(--muted)] mb-2">= €15,75/Monat · Jederzeit kündbar</p>
            <div className="inline-flex self-start font-sans text-[11px] font-bold px-2.5 py-1 rounded-full mb-4" style={{ background: "#e8f5ed", color: "#1A5C3A" }}>
              Sie sparen €279
            </div>

            {/* Green pills */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {["1.000 Käufer/Monat", "Ø 60–120 Tage", "0% Provision"].map((p) => (
                <span key={p} className="font-sans text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ background: "#1A5C3A" }}>
                  {p}
                </span>
              ))}
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-3 flex-1">
              {YEARLY_BASE.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={12} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
                  <span className="font-sans text-[12px] text-[var(--ink)]">{f}</span>
                </li>
              ))}
              {YEARLY_EXCLUSIVE.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="text-amber-500 text-[12px] mt-0.5 flex-shrink-0">⭐</span>
                  <span>
                    <span className="font-sans text-[12px] text-[var(--ink)]">{f} </span>
                    <span className="inline-block font-sans text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 whitespace-nowrap">
                      Nur im Jahrespaket
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            {/* Trust micro-copy */}
            <p className="font-sans text-[10px] text-[var(--muted)] leading-relaxed border-t border-[var(--border)] pt-3 mb-4">
              Unser Algorithmus analysiert Branche, Region und Größe — Ihr Inserat erreicht automatisch passende Käufer ohne Makler und ohne Provision.
            </p>

            <Link
              href="/sell"
              className="animate-cta-pulse block text-center w-full py-3.5 rounded-xl font-sans font-bold text-[14px] text-white hover:opacity-90 transition-opacity duration-200"
              style={{ background: "#1A5C3A" }}
            >
              Jetzt Jahrespaket sichern →
            </Link>
          </div>

          {/* ── Stats Sidebar ── */}
          <div
            className={`${cardBase} md:col-span-2 xl:col-span-1 space-y-4`}
            style={show(160)}
          >
            {/* Sale duration bars */}
            <SaleDurationBars />

            {/* Buyer types */}
            <div className="bg-white border border-[var(--border)] rounded-2xl p-5">
              <h3 className="font-sans text-[12px] font-bold text-[var(--ink)] mb-1">
                Wer kauft auf Firmadeal?
              </h3>
              <p className="font-sans text-[10px] text-[var(--muted)] mb-3">
                Ihr Inserat wird automatisch weitergeleitet
              </p>
              <div className="space-y-2.5">
                {BUYERS.map((b) => (
                  <div key={b.label} className="flex items-center gap-2.5">
                    <span className="text-[18px] flex-shrink-0">{b.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-[11px] font-semibold text-[var(--ink)] leading-snug truncate">{b.label}</p>
                    </div>
                    <span
                      className="font-sans text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                      style={{ background: "#e8f5ed", color: "#1A5C3A" }}
                    >
                      {b.count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Priority callout */}
              <div className="mt-4 rounded-xl p-3 flex items-start gap-2" style={{ background: "#e8f5ed" }}>
                <span className="text-[16px] flex-shrink-0">🎯</span>
                <p className="font-sans text-[11px] leading-relaxed" style={{ color: "#1A5C3A" }}>
                  <strong>Jahrespaket-Inserate</strong> werden priorisiert an alle 4 Käufergruppen weitergeleitet. Monats-Inserate erscheinen nur im allgemeinen Marktplatz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="font-sans text-[20px] font-bold text-[var(--ink)] tracking-tight text-center mb-6">
            Häufige Fragen
          </h2>
          <div className="space-y-2">
            {FAQ.map((faq, i) => (
              <div key={i} className="bg-[var(--surface2)] border border-[var(--border)] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left"
                >
                  <span className="font-sans text-[13px] font-semibold text-[var(--ink)]">{faq.q}</span>
                  <ChevronDown
                    size={15}
                    className={`text-[var(--muted)] flex-shrink-0 ml-3 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="font-sans text-[12px] text-[var(--muted)] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ─────────────────────────────────────────────────────── */}
      <section className="bg-[var(--ink)] border-t border-[var(--border)]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <h2 className="font-sans text-[18px] font-bold text-white tracking-tight mb-1">
            Neue Kaufgesuche direkt in Ihr Postfach
          </h2>
          <p className="font-sans text-[13px] text-white/55 mb-5 leading-relaxed">
            Wöchentlich passende Käufer für Unternehmen wie Ihres — kostenlos und jederzeit abmeldbar
          </p>
          {newsletterState === "success" ? (
            <p className="font-sans text-[14px] font-semibold text-green-400">✓ Sie sind angemeldet!</p>
          ) : (
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ihre E-Mail-Adresse"
                required
                className="flex-1 px-4 py-2.5 rounded-xl font-sans text-[13px] text-[var(--ink)] bg-white outline-none"
              />
              <button
                type="submit"
                disabled={newsletterState === "loading"}
                className="px-5 py-2.5 font-sans font-bold text-[13px] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 whitespace-nowrap"
                style={{ background: "#1A5C3A" }}
              >
                {newsletterState === "loading" ? "Wird gespeichert…" : "Anmelden"}
              </button>
            </form>
          )}
          {newsletterState === "duplicate" && (
            <p className="font-sans text-[12px] text-amber-400 mt-2.5">Sie sind bereits angemeldet.</p>
          )}
          {newsletterState === "error" && (
            <p className="font-sans text-[12px] text-red-400 mt-2.5">Fehler. Bitte erneut versuchen.</p>
          )}
          <p className="font-sans text-[11px] text-white/35 mt-5">
            firmadeal.de · Sofort live · 0% Provision · Kein Makler
          </p>
        </div>
      </section>
    </div>
  );
}
