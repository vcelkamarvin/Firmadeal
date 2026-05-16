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
                ? "Der führende Marktplatz für Unternehmensverkäufe in Deutschland, Österreich und der Schweiz."
                : "The leading marketplace for business sales in Germany, Austria and Switzerland."}
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-white/30 mb-4">
              {lang === "de" ? "Marktplatz" : "Marketplace"}
            </h4>
            <ul className="space-y-2">
              {[
                { href: "/listings", de: "Inserate durchsuchen", en: "Browse listings" },
                { href: "/sell",     de: "Inserat aufgeben",     en: "Post listing"    },
                { href: "/pricing",  de: "Preise",               en: "Pricing"         },
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
                { de: "Über uns",    en: "About us"       },
                { de: "Datenschutz", en: "Privacy policy" },
                { de: "AGB",         en: "Terms"          },
                { de: "Impressum",   en: "Imprint"        },
              ].map((l) => (
                <li key={l.de}>
                  <Link href="#" className="font-sans text-[13px] text-white/50 hover:text-white transition-colors">
                    {lang === "de" ? l.de : l.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-white/25">
            © {new Date().getFullYear()} Firmadeal GmbH · {lang === "de" ? "Alle Rechte vorbehalten" : "All rights reserved"}
          </p>
          <p className="font-mono text-[11px] text-white/25">
            DE · AT · CH — DACH-Marktplatz
          </p>
        </div>
      </div>
    </footer>
  );
}
