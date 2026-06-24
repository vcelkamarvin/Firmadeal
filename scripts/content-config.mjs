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
