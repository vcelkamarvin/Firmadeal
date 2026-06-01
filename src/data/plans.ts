export const PLANS = [
  {
    id: "monthly" as const,
    name: "Firmadeal Listing",
    price: 39,
    period: "month" as const,
    ctaLabel: "7 Tage kostenlos starten →",
    trialLabel: "7 Tage kostenlos",
    highlight: false,
    badge: null,
    badgeColor: null,
    features: [
      "Listing sichtbar im Marktplatz",
      "1.000+ aktive Käufer/Monat kontaktieren Sie direkt",
      "Anonymes Inserat — Ihre Daten bleiben geschützt",
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
    ctaLabel: "Jetzt Jahrespaket starten →",
    trialLabel: "7 Tage kostenlos",
    highlight: true,
    badge: "EMPFOHLEN",
    badgeColor: "green" as const,
    savingsPill: "Sie sparen €279",
    tagline: "Beliebteste Wahl — 59% günstiger",
    features: [
      "Listing sichtbar im Marktplatz",
      "1.000+ aktive Käufer/Monat kontaktieren Sie direkt",
      "Anonymes Inserat — Ihre Daten bleiben geschützt",
      "Automatische Unternehmensbewertung",
      "7-Tage Markttest-Bericht",
      "0% Provision auf den Verkaufspreis",
    ],
    exclusiveFeatures: [
      "Top-Platzierung — Ihr Inserat erscheint vor Monthly-Inseraten",
      "Wöchentlicher Newsletter an 8.000+ aktive Investoren",
    ],
    footerNote:
      "Für ernsthafte Verkäufer — maximale Sichtbarkeit über den gesamten Verkaufsprozess",
  },
];

export type PlanId = (typeof PLANS)[number]["id"];
