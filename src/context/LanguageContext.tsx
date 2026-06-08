"use client";

import React, { createContext, useContext, useState } from "react";

type Language = "de" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navbar
  "nav.search_placeholder": {
    de: "Branche oder Region suchen...",
    en: "Search industry or region...",
  },
  "nav.all_categories": { de: "Alle Kategorien", en: "All Categories" },
  "nav.search": { de: "Suchen", en: "Search" },
  "nav.login": { de: "Anmelden", en: "Sign in" },
  "nav.post_listing": { de: "Inserat aufgeben →", en: "Post listing →" },
  // Hero
  "hero.eyebrow": {
    de: "Der deutsche Marktplatz für Unternehmensverkäufe",
    en: "The German marketplace for business sales",
  },
  "hero.h1": {
    de: "Finden Sie den richtigen Käufer für Ihr Unternehmen.",
    en: "Find the right buyer for your business.",
  },
  "hero.subtitle": {
    de: "Transparente Inserate. Direkte Kommunikation. Keine Provision.",
    en: "Transparent listings. Direct communication. Zero commission.",
  },
  "hero.cta_primary": { de: "Jetzt inserieren →", en: "List now →" },
  "hero.cta_secondary": { de: "Unternehmen suchen", en: "Browse businesses" },
  "hero.trust_commission": { de: "0% Provision", en: "0% Commission" },
  "hero.trust_dach": { de: "deutschlandweit", en: "Germany-wide" },
  "hero.trust_verified": { de: "Verifizierte Inserate", en: "Verified listings" },
  "hero.trust_time": { de: "Ø 4 Min. zum Inserieren", en: "Ø 4 min to list" },
  // Stats
  "stats.buyers": { de: "Aktive Käufer", en: "Active buyers" },
  "stats.commission": { de: "Provision", en: "Commission" },
  "stats.create": { de: "Inserat erstellen", en: "Create listing" },
  "stats.costs": { de: "Versteckte Kosten", en: "Hidden costs" },
  // Listings
  "listings.featured": { de: "Aktuelle Inserate", en: "Featured listings" },
  "listings.view_all": { de: "Alle anzeigen →", en: "View all →" },
  "listings.contact": { de: "Kontakt aufnehmen", en: "Get in touch" },
  "listings.on_request": { de: "Auf Anfrage", en: "On request" },
  "listings.featured_badge": { de: "Featured", en: "Featured" },
  // Categories
  "categories.title": { de: "Nach Branche suchen", en: "Browse by industry" },
  "categories.listings": { de: "Inserate", en: "listings" },
  // Value props
  "value.title": { de: "Warum Firmadeal?", en: "Why Firmadeal?" },
  "value.commission_title": { de: "Keine Provision", en: "Zero commission" },
  "value.commission_desc": {
    de: "Sie behalten 100% des Verkaufserlöses",
    en: "You keep 100% of the sale proceeds",
  },
  "value.direct_title": {
    de: "Direkte Kommunikation",
    en: "Direct communication",
  },
  "value.direct_desc": {
    de: "Käufer kontaktieren Sie direkt, Sie entscheiden wer",
    en: "Buyers contact you directly, you decide who",
  },
  "value.safe_title": { de: "Vertraulich & sicher", en: "Confidential & safe" },
  "value.safe_desc": {
    de: "Anonym inserieren bis Sie bereit sind",
    en: "List anonymously until you're ready",
  },
  // CTA section
  "cta.title": {
    de: "Bereit, Ihr Unternehmen zu verkaufen?",
    en: "Ready to sell your business?",
  },
  "cta.button": {
    de: "Jetzt kostenlos inserieren →",
    en: "List for free now →",
  },
  // Auth
  "auth.email": { de: "E-Mail-Adresse", en: "Email address" },
  "auth.password": { de: "Passwort", en: "Password" },
  "auth.login_title": { de: "Willkommen zurück", en: "Welcome back" },
  "auth.login_button": { de: "Anmelden", en: "Sign in" },
  "auth.register_title": { de: "Konto erstellen", en: "Create account" },
  "auth.register_button": { de: "Registrieren", en: "Register" },
  "auth.google": { de: "Mit Google anmelden", en: "Continue with Google" },
  "auth.no_account": { de: "Noch kein Konto?", en: "No account yet?" },
  "auth.have_account": { de: "Bereits ein Konto?", en: "Already have an account?" },
  "auth.register_link": { de: "Jetzt registrieren", en: "Register now" },
  "auth.login_link": { de: "Anmelden", en: "Sign in" },
  // Dashboard
  "dashboard.welcome": { de: "Willkommen,", en: "Welcome," },
  "dashboard.new_listing": { de: "Neues Inserat →", en: "New listing →" },
  "dashboard.active": { de: "Aktive Inserate", en: "Active listings" },
  "dashboard.views": { de: "Gesamtansichten", en: "Total views" },
  "dashboard.inquiries": { de: "Anfragen", en: "Inquiries" },
  "dashboard.since": { de: "Aktiv seit", en: "Active since" },
  "dashboard.no_listings": {
    de: "Noch kein Inserat? Jetzt starten →",
    en: "No listing yet? Start now →",
  },
  // Common
  "common.founded": { de: "Gegründet", en: "Founded" },
  "common.employees": { de: "Mitarbeiter", en: "Employees" },
  "common.revenue": { de: "Jahresumsatz", en: "Annual revenue" },
  "common.status": { de: "Status", en: "Status" },
  "common.active_profitable": {
    de: "Aktiv & Profitabel",
    en: "Active & Profitable",
  },
  "common.in_development": { de: "In Entwicklung", en: "In development" },
  "common.restructuring": { de: "Sanierungsbedarf", en: "Needs restructuring" },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "de",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("de");

  const t = (key: string): string => {
    return translations[key]?.[lang] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
