"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="bg-[var(--ink)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-baseline gap-0 mb-3">
              <span className="font-sans text-[18px] font-bold text-white tracking-tight">Firmadeal</span>
              <span className="font-sans text-[18px] font-bold text-white/30">.de</span>
            </div>
            <p className="font-sans text-[13px] text-white/50 max-w-xs leading-relaxed">
              {lang === "de"
                ? "Diskreter Unternehmensverkauf in Deutschland, Österreich und der Schweiz — mit privatem Investoren-Netzwerk."
                : "Discreet business sales in Germany, Austria and Switzerland — with a private investor network."}
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-4">
              {lang === "de" ? "Marktplatz" : "Marketplace"}
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/listings", de: "Auswahl ansehen", en: "View selection" },
                { href: "/unternehmenswert", de: "Unternehmenswert berechnen", en: "Value your company" },
                { href: "/kaeufer", de: "Für Käufer", en: "For buyers" },
                { href: "/sell", de: "Unternehmen einreichen", en: "Submit business" },
                { href: "/pricing", de: "Preise", en: "Pricing" },
                { href: "/blog", de: "Blog", en: "Blog" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-sans text-[13px] text-white/50 hover:text-white transition-colors">
                    {lang === "de" ? l.de : l.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-4">
              {lang === "de" ? "Unternehmen" : "Company"}
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/datenschutz", de: "Datenschutz", en: "Privacy policy" },
                { href: "/agb", de: "AGB", en: "Terms" },
                { href: "/impressum", de: "Impressum", en: "Imprint" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-sans text-[13px] text-white/50 hover:text-white transition-colors">
                    {lang === "de" ? l.de : l.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-white/25">
            © {new Date().getFullYear()} Firmadeal · {lang === "de" ? "Alle Rechte vorbehalten" : "All rights reserved"}
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://www.linkedin.com/company/firmadeal"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-white/25 hover:text-white/60 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <p className="font-mono text-[11px] text-white/25">
              DE · AT · CH — deutscher Marktplatz
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
