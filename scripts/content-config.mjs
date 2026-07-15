// The "skills" as data: brand memory, verified facts, template, banned phrases.
// Edit these to tune voice and (critically) to keep figures real and sourced.
// Everything the generator is allowed to claim numerically should live in eeatFacts.

export const brandMemory = `
Firmadeal ist ein diskreter Unternehmensverkauf mit privatem Investoren-Netzwerk.
- Die meisten Mandate laufen vertraulich/off-market; eine kuratierte Auswahl ist öffentlich.
- Modell: einmalig €87, 0% Provision, kein Makler, anonym bis zum Abschluss.
- Ton: sachlich, vertrauenswürdig, kompetent, KEIN Hype, keine Superlative, keine Verkaufsfloskeln.
- Zielgruppe: Inhaber von KMU in DACH, die verkaufen oder eine Nachfolge regeln wollen.
- Verboten: erfundene Statistiken, "#1"/"führend"-Behauptungen, gefälschte Testimonials.
- Jeder Artikel verlinkt natürlich auf /sell (vertraulich einreichen) und /listings (Auswahl).
`;

// Real, citable figures only. Replace placeholders with sources you trust before scaling.
// If a branche isn't listed, the generator gets the general block and must avoid specific multiples.
const FACTS = {
  general: `
- Unternehmensbewertung KMU erfolgt meist über EBIT-/EBITDA-Multiple oder Ertragswert (Quelle: IDW S1; DUB KMU Multiples).
- Asset Deal vs. Share Deal unterscheiden sich steuerlich und haftungsrechtlich erheblich (Quelle: IHK-Merkblätter Unternehmensnachfolge).
- In Deutschland stehen laut KfW jährlich Zehntausende Unternehmensnachfolgen an (Quelle: KfW-Nachfolgemonitoring — konkrete Jahreszahl nur mit aktueller Quelle nennen).
- Verkaufsprozesse dauern typischerweise mehrere Monate bis über ein Jahr (Quelle: DIHK/IHK Nachfolgereports).
`,
  "Arztpraxis": `- Praxiswert = materieller Wert + ideeller Wert (Goodwill); Kassensitz ist eigenständig bewertungsrelevant (Quelle: Ärztekammer/KBV-Bewertungshinweise, modifizierte Ertragswertmethode).`,
  "Steuerkanzlei": `- Bewertung oft als Faktor auf den Jahresumsatz/Mandantenstamm; Mandantenbindung ist zentral (Quelle: BStBK-Hinweise zur Kanzleibewertung).`,
  "Bäckerei": `- Handwerksbetriebe: Substanzwert + Ertragswert; Standort und Filialstruktur prägen den Preis (Quelle: Handwerkskammer-Nachfolgeberatung).`,
};

export function eeatFacts(branche) {
  return `${FACTS.general}\n${FACTS[branche] || "(Keine branchenspezifischen Multiples hinterlegt — KEINE konkreten Multiples erfinden, allgemein bleiben.)"}`;
}

// Authoritative German sources to cite as real external backlinks (boosts E-E-A-T).
export const externalSources = `
- IHK (Industrie- und Handelskammer) Nachfolge: https://www.ihk.de/
- KfW Nachfolgemonitoring: https://www.kfw.de/
- Statistisches Bundesamt (Destatis): https://www.destatis.de/
- IDW (Bewertungsstandard IDW S1): https://www.idw.de/
- Gesetze im Internet (z. B. HGB, UmwG, EStG): https://www.gesetze-im-internet.de/
- BStBK (Kanzleibewertung): https://www.bstbk.de/
Verlinke nur, was inhaltlich zur Nische passt. Nutze beschreibenden deutschen Ankertext, keine nackten URLs.
`;

export const articleTemplate = `
1. Direkte Antwort in den ersten 2–3 Sätzen (für AI Overviews / Featured Snippet).
2. ## Wie wird [Branche] in dieser Konstellation bewertet? — Methode + GERECHNETES Beispiel (Zahlen).
3. ## Was den Wert in dieser Nische besonders beeinflusst (branchenspezifische Faktoren).
4. ## Ablauf des Verkaufs Schritt für Schritt.
5. ## Steuer & rechtliche Besonderheiten (Asset vs. Share Deal, mit Quelle).
6. ## Häufige Fehler / worauf Käufer achten.
7. ## Anonym & ohne Makler verkaufen — dezenter Firmadeal-Bezug + interner Link /sell.
8. ## Häufige Fragen — 4–6 FAQ.
9. Abschluss-CTA: kostenlose Bewertung (/#bewertung) + vertraulich einreichen (/sell).
Tabellen (Markdown) für Bewertungs-Beispiele nutzen, wo sinnvoll.
`;

export const BANNED_PHRASES = [
  "Deutschlands #1", "führender Marktplatz", "garantiert", "100% sicher",
  "in nur wenigen Klicks", "revolutionär", "16.000", "€2,3 Mrd",
];

// ── Content-type diversification (Task D) ────────────────────────────────────
// "[Branche] verkaufen" is a transactional query Google serves to marketplaces
// (dub.de, kleinanzeigen, nexxt-change) — a guide can't win it. These types cover
// the INFORMATIONAL intent where calculators/guides actually rank, and each feeds
// the /unternehmenswert calculator pages. `verkaufen` is kept as the legacy default
// so untyped queue entries still work exactly as before.
// Each type sets: the blog_posts category, the target keyword family, and the angle.
export const CONTENT_TYPES = {
  verkaufen: {
    category: "verkauf",
    keyword: '"[Branche] verkaufen" (transaktional — nur nutzen, wenn kein Vertikal-Spezialist die SERP hält)',
    focus: articleTemplate, // the original per-branche template
  },
  wert: {
    category: "bewertung",
    keyword: 'informativ: "was ist ein/e [Branche] wert", "[Branche] Wert berechnen"',
    focus: `Suchintention: der Leser will WISSEN, was sein Betrieb wert ist — er will (noch) nicht verkaufen. Beratender, erklärender Ton, KEIN Verkaufsdruck.
- Direkte Antwort mit realistischer Wertspanne in den ersten 2-3 Sätzen.
- ## Wie wird ein/e [Branche] bewertet? — Methode (EBITDA-Multiple / Ertragswert) + ein klar gekennzeichnetes GERECHNETES Beispiel.
- ## Was den Wert nach oben oder unten treibt — branchenspezifische Werttreiber.
- ## Selbst berechnen — verweise als natürlichen Markdown-Link auf den kostenlosen Bewertungsrechner unter /unternehmenswert.`,
  },
  steuer: {
    category: "ratgeber",
    keyword: 'informativ: "[Branche] verkaufen steuer", "veräußerungsgewinn versteuern"',
    focus: `Suchintention: die steuerlichen Folgen des Verkaufs verstehen. Hinweis einbauen: keine Steuerberatung, im Zweifel Steuerberater.
- ## Was wird besteuert? Veräußerungsgewinn = Verkaufspreis minus Buchwert/Kosten.
- ## Freibetrag & ermäßigter Steuersatz (§16, §34 EStG) — mit Quelle gesetze-im-internet.de; NUR die Regeln nennen, keine erfundenen Prozent-/Eurozahlen als Statistik.
- ## Asset Deal vs. Share Deal aus Steuersicht.
- ## Ein klar als Annahme gekennzeichnetes GERECHNETES Beispiel.
- Verlinke /unternehmenswert als Ausgangspunkt für die Wert-Basis.`,
  },
  ablauf: {
    category: "nachfolge",
    keyword: 'informativ: "[Branche] verkaufen ablauf", "unternehmensnachfolge schritte"',
    focus: `Suchintention: den Prozess/Ablauf verstehen.
- ## Ablauf in klaren, nummerierten Schritten (Vorbereitung → Bewertung → Käufersuche → Due Diligence → Abschluss).
- ## Realistischer Zeitrahmen (Monate bis über ein Jahr) mit Quelle.
- ## Typische Fehler / Stolpersteine in dieser Branche.
- Verlinke /unternehmenswert (Wert ermitteln) natürlich im Fluss.`,
  },
  konzept: {
    category: "ratgeber",
    keyword: 'informativ: der Konzeptbegriff selbst (z. B. "EBITDA-Multiplikator", "Asset Deal Share Deal Unterschied", "Earn-Out")',
    focus: `Dies ist ein BRANCHEN-ÜBERGREIFENDER Konzept-Erklärartikel — KEINE einzelne Branche. Der Titel nennt das zu erklärende Konzept.
- Erkläre das Konzept klar und korrekt, verständlich für KMU-Inhaber.
- Nutze 2-3 UNTERSCHIEDLICHE Branchen als kurze Beispiele, damit der Artikel nicht wie eine Branchenseite wirkt.
- Mindestens ein klar gekennzeichnetes GERECHNETES Beispiel.
- ## Wann ist das relevant? und ## Häufige Missverständnisse.
- Verlinke /unternehmenswert (Rechner) natürlich im Fließtext.`,
  },
};

// Map a niche to its content type: explicit `type`, else derive from the legacy
// `intent`, else the transactional default.
const INTENT_TO_TYPE = { verkaufen: "verkaufen", bewerten: "wert", kaufen: "verkaufen", nachfolge: "ablauf", ablauf: "ablauf" };
export function typeOf(niche) {
  return (niche.type && CONTENT_TYPES[niche.type]) ? niche.type : (INTENT_TO_TYPE[niche.intent] || "verkaufen");
}
export const categoryOf = (niche) => CONTENT_TYPES[typeOf(niche)].category;
