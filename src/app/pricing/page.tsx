"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import PricingCards from "@/components/PricingCards";

const BUYER_TYPES = [
  {
    icon: "\ud83c\udfe2",
    title: "Private Equity & Family Offices",
    desc: "847 aktive PE-Investoren und Family Offices im DACH-Raum suchen Unternehmen ab \u20ac500K Umsatz",
  },
  {
    icon: "\ud83d\udc64",
    title: "Unternehmer & MBI-Kandidaten",
    desc: "2.340 erfahrene Manager suchen ein Unternehmen zum Kauf",
  },
  {
    icon: "\ud83d\udd0d",
    title: "Search Funds",
    desc: "156 Search Fund Manager durchsuchen aktiv den DACH-Mittelstand",
  },
  {
    icon: "\ud83e\udd1d",
    title: "Strategische K\u00e4ufer",
    desc: "1.203 Unternehmen suchen \u00dcbernahmetargets f\u00fcr Wachstum",
  },
];

const FAQ = [
  {
    q: "Wie lange dauert ein Verkauf durchschnittlich?",
    a: "Die durchschnittliche Verkaufsdauer auf Firmadeal betr\u00e4gt 3\u20139 Monate, abh\u00e4ngig von Branche, Preis und Marktlage. Mit dem Jahrespaket erhalten Sie Top-Platzierung und Newsletter-Reichweite, was die Kontaktaufnahme deutlich beschleunigt.",
  },
  {
    q: "Bleibt mein Inserat vollst\u00e4ndig anonym?",
    a: "Ja. Ihr Inserat ist vollst\u00e4ndig anonym \u2014 kein Unternehmensname, keine pers\u00f6nlichen Daten werden ohne Ihre Freigabe sichtbar. Interessierte K\u00e4ufer kontaktieren Sie \u00fcber unser gesch\u00fctztes Nachrichtensystem.",
  },
  {
    q: "Was passiert nach der kostenlosen Testphase?",
    a: "Nach 7 Tagen wird Ihr gew\u00e4hlter Plan automatisch aktiviert und abgerechnet (\u20ac39/Monat oder \u20ac189/Jahr). Sie k\u00f6nnen jederzeit vor Ablauf der Testphase k\u00fcndigen \u2014 ohne Kosten.",
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
      if (res.status === 409) {
        setNewsletterState("duplicate");
        return;
      }
      if (!res.ok) {
        setNewsletterState("error");
        return;
      }
      setNewsletterState("success");
      setEmail("");
    } catch {
      setNewsletterState("error");
    }
  };

  return (
    <div className="bg-[var(--bg)] min-h-screen">

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center">
        <h1 className="font-sans text-[clamp(28px,5vw,50px)] font-bold text-[var(--ink)] tracking-tight mb-4 leading-[1.05]">
          Ihr Unternehmen verkaufen &mdash;<br />einfach und ohne Makler
        </h1>
        <p className="font-sans text-[17px] text-[var(--muted)] max-w-[440px] mx-auto leading-relaxed">
          W\u00e4hlen Sie Ihren Plan. 7 Tage kostenlos testen.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <PricingCards />
      </section>

      {/* Wer kauft auf Firmadeal? */}
      <section className="bg-white border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-sans text-[22px] font-bold text-[var(--ink)] tracking-tight text-center mb-2">
            Wer kauft auf Firmadeal?
          </h2>
          <p className="font-sans text-[14px] text-[var(--muted)] text-center mb-10">
            Ihr Inserat wird automatisch nach Branche und Region an passende K\u00e4ufer weitergeleitet.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {BUYER_TYPES.map((b) => (
              <div key={b.title} className="bg-[var(--surface2)] rounded-2xl p-6">
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-sans text-[15px] font-bold text-[var(--ink)] mb-2">{b.title}</h3>
                <p className="font-sans text-[13px] text-[var(--muted)] leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[var(--ink)]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="font-sans text-[22px] font-bold text-white tracking-tight mb-2">
            Neue Kaufgesuche direkt in Ihr Postfach
          </h2>
          <p className="font-sans text-[14px] text-white/60 mb-6 leading-relaxed">
            W\u00f6chentlich die besten neuen Inserate passend zu Ihren Kriterien. Jederzeit abmeldbar.
          </p>
          {newsletterState === "success" ? (
            <p className="font-sans text-[15px] font-semibold text-green-400">
              \u2713 Sie sind angemeldet!
            </p>
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
                {newsletterState === "loading" ? "Wird gespeichert\u2026" : "Anmelden"}
              </button>
            </form>
          )}
          {newsletterState === "duplicate" && (
            <p className="font-sans text-[13px] text-amber-400 mt-3">
              Sie sind bereits angemeldet.
            </p>
          )}
          {newsletterState === "error" && (
            <p className="font-sans text-[13px] text-red-400 mt-3">
              Fehler. Bitte versuchen Sie es erneut.
            </p>
          )}
          <p className="font-sans text-[12px] text-white/40 mt-6">
            firmaDeal.de \u00b7 Sofort live \u00b7 0% Provision \u00b7 Kein Makler
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[var(--surface2)] border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="font-sans text-[22px] font-bold text-[var(--ink)] tracking-tight text-center mb-8">
            H\u00e4ufige Fragen
          </h2>
          <div className="space-y-2">
            {FAQ.map((faq, i) => (
              <div key={i} className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-sans text-[14px] font-semibold text-[var(--ink)]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-[var(--muted)] flex-shrink-0 ml-3 transition-transform duration-200 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="font-sans text-[13px] text-[var(--muted)] leading-relaxed">
                      {faq.a}
                    </p>
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
