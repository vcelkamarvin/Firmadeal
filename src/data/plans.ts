export const PLANS = [
  {
    id: "monthly" as const,
    name: "Firmadeal Listing",
    price: 39,
    period: "month" as const,
    ctaLabel: "7 Tage kostenlos starten \u2192",
    trialLabel: "7 Tage kostenlos",
    highlight: false,
    badge: null,
    badgeColor: null,
    features: [
      "Listing sichtbar im Marktplatz",
      "1.000+ aktive K\u00e4ufer/Monat kontaktieren Sie direkt",
      "Anonymes Inserat \u2014 Ihre Daten bleiben gesch\u00fctzt",
      "Automatische Unternehmensbewertung",
      "7-Tage Markttest-Bericht",
      "0% Provision auf den Verkaufspreis",
    ],
    exclusiveFeatures: [] as string[],
  },
  {
    id: "yearly" as const,
    name: "Firmadeal Listing Jahrespaket",
    price: 189,
    priceMonthly: 15.75,
    priceCrossed: 468,
    period: "year" as const,
    ctaLabel: "Jetzt Jahrespaket starten \u2192",
    trialLabel: "7 Tage kostenlos",
    highlight: true,
    badge: "EMPFOHLEN",
    badgeColor: "green" as const,
    savingsPill: "Sie sparen \u20ac279",
    tagline: "Beliebteste Wahl \u2014 59% g\u00fcnstiger",
    features: [
      "Listing sichtbar im Marktplatz",
      "1.000+ aktive K\u00e4ufer/Monat kontaktieren Sie direkt",
      "Anonymes Inserat \u2014 Ihre Daten bleiben gesch\u00fctzt",
      "Automatische Unternehmensbewertung",
      "7-Tage Markttest-Bericht",
      "0% Provision auf den Verkaufspreis",
    ],
    exclusiveFeatures: [
      "Top-Platzierung \u2014 Ihr Inserat erscheint vor Monthly-Inseraten",
      "W\u00f6chentlicher Newsletter an 8.000+ aktive Investoren",
    ],
    footerNote:
      "F\u00fcr ernsthafte Verk\u00e4ufer \u2014 maximale Sichtbarkeit \u00fcber den gesamten Verkaufsprozess",
  },
];

export type PlanId = (typeof PLANS)[number]["id"];
