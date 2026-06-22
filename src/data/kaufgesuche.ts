export interface Kaufgesuch {
  id: number;
  typ: "Search Fund" | "Family Office" | "Strategischer Käufer" | "Private Equity" | "MBI-Kandidat";
  icon: string;
  branche: string;
  region: string;
  umsatz?: string;
  ebitda?: string;
  zusatz: string;
  aktiv: string;
}

export const KAUFGESUCHE: Kaufgesuch[] = [
  {
    id: 1,
    typ: "Search Fund",
    icon: "🔍",
    branche: "SaaS / IT",
    region: "DACH",
    umsatz: "1–5 Mio. €",
    ebitda: "300k–1 Mio. €",
    zusatz: "Mehrheit, langfristig",
    aktiv: "Aktiv seit 3 Tagen",
  },
  {
    id: 2,
    typ: "Family Office",
    icon: "🏢",
    branche: "Handwerk / Bau",
    region: "Süddeutschland",
    ebitda: "0,5–2 Mio. €",
    zusatz: "Nachfolge",
    aktiv: "Aktiv seit 1 Woche",
  },
  {
    id: 3,
    typ: "Strategischer Käufer",
    icon: "🤝",
    branche: "E-Commerce",
    region: "Deutschland",
    umsatz: "2–10 Mio. €",
    zusatz: "Add-on Akquisition",
    aktiv: "Aktiv seit 5 Tagen",
  },
  {
    id: 4,
    typ: "Private Equity",
    icon: "💼",
    branche: "Gesundheit / Pflege",
    region: "DACH",
    ebitda: "> 1 Mio. €",
    zusatz: "Buy-and-build",
    aktiv: "Aktiv seit 2 Wochen",
  },
  {
    id: 5,
    typ: "MBI-Kandidat",
    icon: "👤",
    branche: "Dienstleistungen",
    region: "NRW",
    umsatz: "bis 3 Mio. €",
    zusatz: "Operative Nachfolge",
    aktiv: "Aktiv seit 4 Tagen",
  },
  {
    id: 6,
    typ: "Family Office",
    icon: "🏢",
    branche: "Produktion / Maschinenbau",
    region: "Bayern",
    ebitda: "0,5–3 Mio. €",
    zusatz: "Mehrheit oder Vollübernahme",
    aktiv: "Aktiv seit 6 Tagen",
  },
  {
    id: 7,
    typ: "Search Fund",
    icon: "🔍",
    branche: "Dienstleistungen B2B",
    region: "DACH",
    umsatz: "1–8 Mio. €",
    zusatz: "Mehrheitsbeteiligung",
    aktiv: "Aktiv seit 2 Tagen",
  },
];
