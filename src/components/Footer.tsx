"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { lang } = useLanguage();
  const de = lang === "de";

  return (
    <footer className="bg-[var(--ink)] text-white">
      {/* ── Columns ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-baseline gap-0 mb-3">
              <span className="font-sans text-[19px] font-bold text-white tracking-tight">Firmadeal</span>
              <span className="font-sans text-[19px] font-bold text-white/30">.de</span>
            </div>
            <p className="font-sans text-[13.5px] text-white/55 max-w-xs leading-relaxed">
              {de
                ? "Der diskrete Marktplatz für Unternehmensnachfolge in Deutschland, Österreich und der Schweiz — mit privatem Investoren-Netzwerk."
                : "The discreet marketplace for business succession in Germany, Austria and Switzerland — with a private investor network."}
            </p>
            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mt-5">
              {["0 % Provision", "Anonym", "Einmalig €87", "Kein Makler"].map((t) => (
                <span key={t} className="font-sans text-[12px] text-white/70 border border-white/15 rounded-full px-3 py-1">
                  {t}
                </span>
              ))}
            </div>
            <a href="mailto:info@firmadeal.de" className="inline-block font-sans text-[13px] text-white/50 hover:text-white transition-colors mt-5">
              info@firmadeal.de
            </a>
          </div>

          {/* Marktplatz */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/35 mb-4">
              {de ? "Marktplatz" : "Marketplace"}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/listings", de: "Auswahl ansehen", en: "View selection" },
                { href: "/unternehmenswert", de: "Unternehmenswert berechnen", en: "Value your company" },
                { href: "/kaufgesuche", de: "Aktuelle Kaufgesuche", en: "Buyer requests" },
                { href: "/kaeufer", de: "Für Käufer", en: "For buyers" },
                { href: "/sell", de: "Unternehmen einreichen", en: "Submit business" },
                { href: "/pricing", de: "Preise", en: "Pricing" },
                { href: "/blog", de: "Blog", en: "Blog" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-sans text-[13.5px] text-white/55 hover:text-white transition-colors">
                    {de ? l.de : l.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Rechtliches */}
          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/35 mb-4">
              {de ? "Rechtliches" : "Legal"}
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: "/datenschutz", de: "Datenschutz", en: "Privacy policy" },
                { href: "/agb", de: "AGB", en: "Terms" },
                { href: "/impressum", de: "Impressum", en: "Imprint" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-sans text-[13.5px] text-white/55 hover:text-white transition-colors">
                    {de ? l.de : l.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-white/30">
            © {new Date().getFullYear()} Firmadeal.de · {de ? "Alle Rechte vorbehalten" : "All rights reserved"}
          </p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-white/30">DE · AT · CH</span>
            <a
              href="https://www.linkedin.com/company/firmadeal"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-white/30 hover:text-white/70 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
