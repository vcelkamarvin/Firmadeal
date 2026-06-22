"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";

const BUYERS = [
  { icon: "🏢", label: "Private Equity & Family Offices" },
  { icon: "👤", label: "Unternehmer & MBI-Kandidaten"    },
  { icon: "🔍", label: "Search Funds & ETA"              },
  { icon: "🤝", label: "Strategische Käufer"             },
];

const FEATURES = [
  "Aufnahme in unser privates Investoren-Netzwerk",
  "Gezielte Ansprache passender Käufer (PE, Family Offices, Search Funds, Strategen)",
  "Optional: kuratierte öffentliche Listung für mehr Reichweite",
  "Anonymes Profil — Ihre Daten bleiben geschützt",
  "Automatische Unternehmensbewertung",
  "0% Provision auf den Verkaufspreis",
];

const FAQ = [
  {
    q: "Wie funktioniert das Käufer-Matching genau?",
    a: "Unser Team analysiert Branche, Standort und Unternehmensgröße und spricht passende Käufer aus unserem privaten Netzwerk direkt an.",
  },
  {
    q: "Bleibt mein Inserat vollständig anonym?",
    a: "Ja. Ihr Name, Ihre Kontaktdaten und alle Unternehmensinformationen bleiben bis zu Ihrer ausdrücklichen Freigabe vollständig geschützt.",
  },
  {
    q: "Gibt es ein Abo oder versteckte Kosten?",
    a: "Nein. Sie zahlen einmalig €87 — kein Abo, keine Verlängerung, keine Provision auf den Verkaufspreis.",
  },
  {
    q: "Warum sehe ich nur wenige öffentliche Inserate?",
    a: "Die meisten Mandate sind vertraulich und werden nicht öffentlich gezeigt — das schützt Verkäufer und Mitarbeiter. Öffentlich erscheint nur eine kuratierte Auswahl.",
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletter] = useState<"idle"|"loading"|"success"|"duplicate"|"error">("idle");
  const [visible, setVisible] = useState(false);

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

  const show = (delay: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(14px)",
    transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
  });

  return (
    <div className="bg-[var(--bg)] min-h-screen">

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-5 text-center">
        <h1 className="font-sans text-[clamp(20px,3.5vw,36px)] font-bold text-[var(--ink)] tracking-tight mb-2 leading-[1.1]">
          Vertrauliche Einreichung — einmalig €87
        </h1>
        <p className="font-sans text-[13px] text-[var(--muted)] mb-4">
          0% Provision · Kein Abo · Anonym
        </p>
        <div className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 bg-white border border-[var(--border)] rounded-full px-5 py-2 shadow-sm text-[13px] font-sans font-semibold text-[var(--ink)]">
          <span>0% Provision</span>
          <span className="text-[var(--border)] hidden sm:block">·</span>
          <span>Kein Abo</span>
          <span className="text-[var(--border)] hidden sm:block">·</span>
          <span>Anonym bis zum Abschluss</span>
        </div>
      </section>

      {/* Pricing + Sidebar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5 items-start max-w-5xl mx-auto">

          {/* Pricing Card */}
          <div
            className="animate-border-glow relative bg-white rounded-2xl flex flex-col p-8"
            style={{ border: "2.5px solid #1A5C3A", ...show(0) }}
          >
            <h3 className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest mb-4">
              Vertrauliche Einreichung
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

            <div className="flex flex-wrap gap-1.5 mb-6">
              {["Gezielte Ansprache passender Käufer", "Privates Netzwerk", "0% Provision"].map((p) => (
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

            <Link
              href="/sell"
              className="animate-cta-pulse block text-center w-full py-4 rounded-xl font-sans font-bold text-[15px] text-white hover:opacity-90 transition-opacity duration-200"
              style={{ background: "#1A5C3A" }}
            >
              Unternehmen vertraulich einreichen →
            </Link>
          </div>

          {/* Sidebar */}
          <div className="space-y-4" style={show(100)}>
            {/* Buyer types */}
            <div className="bg-white border border-[var(--border)] rounded-2xl p-5">
              <h3 className="font-sans text-[12px] font-bold text-[var(--ink)] mb-1">
                Wer kauft auf Firmadeal?
              </h3>
              <p className="font-sans text-[10px] text-[var(--muted)] mb-3">
                Wir gleichen Ihr Profil gezielt ab
              </p>
              <div className="space-y-2.5">
                {BUYERS.map((b) => (
                  <div key={b.label} className="flex items-center gap-2.5">
                    <span className="text-[18px] flex-shrink-0">{b.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-[11px] font-semibold text-[var(--ink)] leading-snug truncate">{b.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust block */}
            <div className="bg-white border border-[var(--border)] rounded-2xl p-5">
              <p className="font-sans text-[11px] text-[var(--muted)] leading-relaxed">
                Wir gleichen Ihr Profil gezielt mit passenden Käufern ab — diskret, ohne Makler und ohne Provision.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
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

      {/* Newsletter */}
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
