// Shared data for programmatic SEO pages: /unternehmenswert/[branche]/[region]
// `calc` MUST match the option keys used inside Rechner.tsx exactly.

export type Branche = {
  slug: string;
  calc: string;   // key inside Rechner BRANCHEN map
  label: string;  // clean public label for SEO/headlines
  m: [number, number]; // EBITDA multiple range
  kw: string[];   // keywords used to match blog posts ↔ this Branche (internal linking)
};

export type Region = {
  slug: string;
  name: string;   // key inside Rechner REGIONEN map + display
  f: number;      // regional factor
};

export const BRANCHEN: Branche[] = [
  { slug: "pflegedienst",     calc: "Pflegedienst",                label: "Pflegedienst",            m: [4.0, 6.0], kw: ["pflegedienst", "pflege", "ambulante pflege"] },
  { slug: "arztpraxis",       calc: "Arztpraxis (Kassensitz)",     label: "Arztpraxis",              m: [3.5, 5.5], kw: ["arztpraxis", "kassensitz", "zahnarztpraxis"] },
  { slug: "steuerkanzlei",    calc: "Steuerkanzlei",               label: "Steuerkanzlei",           m: [4.5, 7.0], kw: ["steuerkanzlei", "steuerberater", "kanzlei"] },
  { slug: "kfz-werkstatt",    calc: "KFZ-Werkstatt",               label: "KFZ-Werkstatt",           m: [2.5, 4.0], kw: ["kfz-werkstatt", "kfz", "werkstatt", "autohaus"] },
  { slug: "baeckerei",        calc: "Bäckerei / Café",             label: "Bäckerei",                m: [2.0, 3.5], kw: ["baeckerei", "bäckerei", "baecker", "cafe"] },
  { slug: "friseursalon",     calc: "Friseursalon",                label: "Friseursalon",            m: [1.5, 3.0], kw: ["friseursalon", "friseur"] },
  { slug: "physiotherapie",   calc: "Physiotherapie-Praxis",       label: "Physiotherapie-Praxis",   m: [3.0, 4.5], kw: ["physiotherapie", "physio"] },
  { slug: "online-shop",      calc: "Online-Shop / E-Commerce",    label: "Online-Shop",             m: [2.5, 4.5], kw: ["online-shop", "onlineshop", "e-commerce", "ecommerce"] },
  { slug: "restaurant",       calc: "Restaurant / Gastronomie",    label: "Restaurant",              m: [1.5, 3.0], kw: ["restaurant", "gastronomie", "gastro"] },
  { slug: "elektro-handwerk", calc: "Elektro- / SHK-Handwerk",     label: "Elektro- & SHK-Betrieb",  m: [3.0, 5.0], kw: ["elektro-handwerk", "elektrobetrieb", "elektro", "shk"] },
  { slug: "it-dienstleister", calc: "IT-Dienstleister / Agentur",  label: "IT-Dienstleister",        m: [4.0, 7.0], kw: ["it-dienstleister", "softwarehaus", "it-agentur", "agentur"] },
  { slug: "hotel",            calc: "Hotel / Pension",             label: "Hotel",                   m: [3.5, 6.0], kw: ["hotel", "pension", "hotellerie"] },
  { slug: "reinigungsfirma",  calc: "Reinigungsfirma",             label: "Reinigungsfirma",         m: [2.5, 4.0], kw: ["reinigungsfirma", "gebaeudereinigung", "gebäudereinigung", "reinigung"] },
  { slug: "logistik",         calc: "Logistik / Spedition",        label: "Spedition",               m: [3.0, 5.0], kw: ["spedition", "logistik", "fuhrpark"] },
  { slug: "produktion",       calc: "Produktion / Maschinenbau",   label: "Produktionsbetrieb",      m: [4.0, 6.5], kw: ["produktion", "maschinenbau", "fertigung"] },
];

// Task A (doorway pages): only the largest markets stay indexable until each
// regional page carries genuinely distinct benchmark data (Task B). The other 11
// Bundesländer are noindex,follow so Google isn't asked to index 16 near-identical
// variants per Branche. Referenced by generateMetadata AND sitemap.ts.
export const INDEXABLE_REGION_SLUGS = new Set<string>([
  "nordrhein-westfalen", "bayern", "baden-wuerttemberg", "hessen", "berlin",
]);

// Normalised keyword match: does this blog post (slug/title/excerpt) belong to a Branche?
const normKw = (s: string) => s.toLowerCase().replace(/[^a-z0-9äöüß]/g, "");
export function brancheForText(text: string): Branche | undefined {
  const hay = normKw(text);
  return BRANCHEN.find((b) => b.kw.some((k) => hay.includes(normKw(k))));
}

export const REGIONEN: Region[] = [
  { slug: "bayern",                 name: "Bayern",                 f: 1.05 },
  { slug: "baden-wuerttemberg",     name: "Baden-Württemberg",      f: 1.05 },
  { slug: "nordrhein-westfalen",    name: "Nordrhein-Westfalen",    f: 1.00 },
  { slug: "hessen",                 name: "Hessen",                 f: 1.02 },
  { slug: "berlin",                 name: "Berlin",                 f: 1.00 },
  { slug: "hamburg",                name: "Hamburg",                f: 1.05 },
  { slug: "niedersachsen",          name: "Niedersachsen",          f: 0.98 },
  { slug: "rheinland-pfalz",        name: "Rheinland-Pfalz",        f: 0.98 },
  { slug: "sachsen",                name: "Sachsen",                f: 0.95 },
  { slug: "schleswig-holstein",     name: "Schleswig-Holstein",     f: 0.97 },
  { slug: "brandenburg",            name: "Brandenburg",            f: 0.95 },
  { slug: "thueringen",             name: "Thüringen",              f: 0.93 },
  { slug: "sachsen-anhalt",         name: "Sachsen-Anhalt",         f: 0.93 },
  { slug: "mecklenburg-vorpommern", name: "Mecklenburg-Vorpommern", f: 0.92 },
  { slug: "saarland",               name: "Saarland",               f: 0.96 },
  { slug: "bremen",                 name: "Bremen",                 f: 0.99 },
];

export const getBranche = (slug: string) => BRANCHEN.find((b) => b.slug === slug);
export const getRegion = (slug: string) => REGIONEN.find((r) => r.slug === slug);
