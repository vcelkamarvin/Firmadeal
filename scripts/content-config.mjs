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

export const articleTemplate = `
1. H1/Titel = exakte Suchintention.
2. Direkte Antwort in den ersten 2–3 Sätzen (für AI Overviews).
3. ## Wie wird [Branche] in dieser Konstellation bewertet? (mit gerechnetem Beispiel)
4. ## Ablauf / Steuer / Besonderheiten der Nische
5. ## Anonym & ohne Makler verkaufen (Firmadeal-Bezug, dezent)
6. ## Häufige Fragen (4–6 FAQ)
7. Dezenter CTA: kostenlose Bewertung + vertraulich einreichen (/sell).
`;

export const BANNED_PHRASES = [
  "Deutschlands #1", "führender Marktplatz", "garantiert", "100% sicher",
  "in nur wenigen Klicks", "revolutionär", "16.000", "€2,3 Mrd",
];
