"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import PricingCards from "@/components/PricingCards";

const BUYER_TYPES = [
  {
    icon: "🏢",
    title: "Private Equity & Family Offices",
    desc: "847 aktive PE-Investoren und Family Offices im DACH-Raum suchen Unternehmen ab €500K Umsatz — bevorzugt über das Jahrespaket weitergeleitet",
  },
  {
    icon: "👤",
    title: "Unternehmer & MBI-Kandidaten",
    desc: "2.340 erfahrene Manager und Nachfolger suchen aktiv ein Unternehmen zum Kauf in ihrer Wunschregion",
  },
  {
    icon: "🔍",
    title: "Search Funds & ETA",
    desc: "156 Search Fund Manager durchsuchen wöchentlich neue Inserate im DACH-Mittelstand",
  },
  {
    icon: "🤝",
    title: "Strategische Käufer",
    desc: "1.203 Unternehmen suchen Übernahmetargets für Wachstum durch Akquisition in ihrer Branche",
  },
];

const FAQ = [
  {
    q: "Wie funktioniert das Käufer-Matching genau?",
    a: "Unser System analysiert Branche, Standort und Unternehmensgröße und leitet Ihr Inserat automatisch an registrierte Käufer weiter, die aktiv in Ihrem Segment suchen. Jahrespaket-Inserate werden dabei priorisiert behandelt.",
  },
  {
    q: "Bleibt mein Inserat vollständig anonym?",
    a: "Ja. Ihr Name, Ihre Kontaktdaten und Unternehmensinformationen bleiben bis zu Ihrer ausdrücklichen Freigabe vollständig geschützt.",
  },
  {
    q: "Was passiert nach der 7-tägigen Testphase?",
    a: "Nach 7 Tagen wird automatisch Ihr gewählter Plan aktiviert. Sie können jederzeit vor Ablauf kündigen — ohne Fragen, ohne Aufwand.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletterState] = useState<
    "idle" | "loading" | "success" | "duplicate" | "error"
  >("idle");

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 409) { setNewsletterState("duplicate"); return; }
      if (!res.ok) { setNewsletterState("error"); return; }
      setNewsletterState("success");
      setEmail("");
    } catch {
      setNewsletterState("error");
    }
  };

  return (
    <div className="bg-[var(--bg)] min-h-screen">

      {/* ── Hero Header ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-6 text-center">
        {/* Trial pill */}
        <div className="inline-flex items-center gap-2 bg-[var(--accent-light)] border border-[var(--accent)]/25 rounded-full px-4 py-1.5 mb-5 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
          <span className="font-sans text-[12px] font-semibold text-[var(--accent)]">
            7 Tage kostenlos — Karte erforderlich · Keine Abbuchung in der Testphase
          </span>
        </div>

        <h1 className="font-sans text-[clamp(28px,5vw,52px)] font-bold text-[var(--ink)] tracking-tight mb-4 leading-[1.05] animate-fade-up animate-fade-up-d1">
          Wählen Sie Ihren Plan —<br />7 Tage kostenlos testen
        </h1>
        <p className="font-sans text-[16px] text-[var(--muted)] max-w-[500px] mx-auto leading-relaxed mb-7 animate-fade-up animate-fade-up-d2">
          Verkaufen Sie Ihr Unternehmen direkt an geprüfte Käufer. Keine Provision. Kein Makler. Sofort live.
        </p>

        {/* Live stats bar */}
        <div className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-white border border-[var(--border)] rounded-full px-5 py-2.5 shadow-sm animate-fade-up animate-fade-up-d2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse-dot" />
            <span className="font-sans text-[13px] font-semibold text-[var(--ink)]">127 aktive Inserate</span>
          </div>
          <span className="text-[var(--border)] hidden sm:block">·</span>
          <span className="font-sans text-[13px] font-semibold text-[var(--ink)]">3.847 registrierte Käufer</span>
          <span className="text-[var(--border)] hidden sm:block">·</span>
          <span className="font-sans text-[13px] font-semibold text-[var(--ink)]">Ø 94 Tage bis zum Abschluss</span>
        </div>
      </section>

      {/* ── Pricing Cards ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">
        <PricingCards />
      </section>

      {/* ── Wer kauft auf Firmadeal? ── */}
      <section className="bg-white border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-sans text-[22px] font-bold text-[var(--ink)] tracking-tight text-center mb-2">
            Wer kauft auf Firmadeal?
          </h2>
          <p className="font-sans text-[14px] text-[var(--muted)] text-center mb-10">
            Ihr Inserat wird automatisch nach Branche und Region an passende Käufer weitergeleitet
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            {BUYER_TYPES.map((b) => (
              <div
                key={b.title}
                className="bg-[var(--surface2)] rounded-2xl p-6 hover:shadow-md transition-shadow duration-200"
              >
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-sans text-[15px] font-bold text-[var(--ink)] mb-2">{b.title}</h3>
                <p className="font-sans text-[13px] text-[var(--muted)] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          {/* Priority callout */}
          <div
            className="rounded-2xl p-5 flex items-start gap-3"
            style={{ background: "#e8f5ed", border: "1.5px solid #1A5C3A" }}
          >
            <span className="text-[22px] flex-shrink-0 mt-0.5">🎯</span>
            <p className="font-sans text-[13px] leading-relaxed" style={{ color: "#1A5C3A" }}>
              <strong>Jahrespaket-Inserate</strong> werden priorisiert an alle 4 Käufergruppen weitergeleitet. Monats-Inserate erscheinen nur im allgemeinen Marktplatz.
            </p>
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="bg-[var(--ink)]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="font-sans text-[22px] font-bold text-white tracking-tight mb-2">
            Neue Kaufgesuche direkt in Ihr Postfach
          </h2>
          <p className="font-sans text-[14px] text-white/60 mb-6 leading-relaxed">
            Wöchentlich passende Käufer für Unternehmen wie Ihres — kostenlos und jederzeit abmeldbar
          </p>
          {newsletterState === "success" ? (
            <p className="font-sans text-[15px] font-semibold text-green-400">✓ Sie sind angemeldet!</p>
          ) : (
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ihre E-Mail-Adresse"
                required
                className="flex-1 px-4 py-3 rounded-xl font-sans text-[14px] text-[var(--ink)] bg-white outline-none"
              />
              <button
                type="submit"
                disabled={newsletterState === "loading"}
                className="px-6 py-3 font-sans font-bold text-[14px] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 whitespace-nowrap"
                style={{ background: "#1A5C3A" }}
              >
                {newsletterState === "loading" ? "Wird gespeichert…" : "Anmelden"}
              </button>
            </form>
          )}
          {newsletterState === "duplicate" && (
            <p className="font-sans text-[13px] text-amber-400 mt-3">Sie sind bereits angemeldet.</p>
          )}
          {newsletterState === "error" && (
            <p className="font-sans text-[13px] text-red-400 mt-3">Fehler. Bitte versuchen Sie es erneut.</p>
          )}
          <p className="font-sans text-[12px] text-white/40 mt-6">
            firmadeal.de · Sofort live · 0% Provision · Kein Makler
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-[var(--surface2)] border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="font-sans text-[22px] font-bold text-[var(--ink)] tracking-tight text-center mb-8">
            Häufige Fragen
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
                    className={`text-[var(--muted)] flex-shrink-0 ml-3 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
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
