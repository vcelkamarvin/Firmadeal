"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { lang } = useLanguage();

  return (
    <footer className="bg-[var(--ink)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-baseline gap-0.5 mb-3">
              <span className="font-fraunces text-xl text-white">Firmadeal</span>
              <span className="font-fraunces text-xl text-white/40">.de</span>
            </div>
            <p className="font-sans text-sm text-white/60 max-w-xs leading-relaxed">
              {lang === "de"
                ? "Der führende Marktplatz für Unternehmensverkäufe in Deutschland, Österreich und der Schweiz."
                : "The leading marketplace for business sales in Germany, Austria and Switzerland."}
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-white/40 mb-4">
              {lang === "de" ? "Marktplatz" : "Marketplace"}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/listings" className="font-sans text-sm text-white/70 hover:text-white transition-colors">
                  {lang === "de" ? "Inserate durchsuchen" : "Browse listings"}
                </Link>
              </li>
              <li>
                <Link href="/sell" className="font-sans text-sm text-white/70 hover:text-white transition-colors">
                  {lang === "de" ? "Inserat aufgeben" : "Post listing"}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="font-sans text-sm text-white/70 hover:text-white transition-colors">
                  {lang === "de" ? "Preise" : "Pricing"}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-white/40 mb-4">
              {lang === "de" ? "Unternehmen" : "Company"}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="font-sans text-sm text-white/70 hover:text-white transition-colors">
                  {lang === "de" ? "Über uns" : "About us"}
                </Link>
              </li>
              <li>
                <Link href="#" className="font-sans text-sm text-white/70 hover:text-white transition-colors">
                  {lang === "de" ? "Datenschutz" : "Privacy policy"}
                </Link>
              </li>
              <li>
                <Link href="#" className="font-sans text-sm text-white/70 hover:text-white transition-colors">
                  {lang === "de" ? "AGB" : "Terms of service"}
                </Link>
              </li>
              <li>
                <Link href="#" className="font-sans text-sm text-white/70 hover:text-white transition-colors">
                  Impressum
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-white/30">
            © {new Date().getFullYear()} Firmadeal GmbH · {lang === "de" ? "Alle Rechte vorbehalten" : "All rights reserved"}
          </p>
          <p className="font-mono text-xs text-white/30">
            🇩🇪 🇦🇹 🇨🇭 DACH-Marktplatz
          </p>
        </div>
      </div>
    </footer>
  );
}
