import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://dgfradkmlelexoaayqfg.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SERVICE_ROLE_KEY) { console.error("Set SUPABASE_SERVICE_ROLE_KEY env var"); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  realtime: { transport: class {} as any },
});

// ─── Unsplash photo IDs per category ────────────────────────────────────────
const PHOTOS: Record<string, string[]> = {
  gastronomie:    ["1414235077428-338989a2e8c0", "1466978913421-dad2ebd01d17", "1555396273-367ea4eb4db5"],
  handwerk:       ["1558618666-fcd25c85cd64", "1504328345606-18bbc8c9d7d1", "1581092160607-ee22621dd758"],
  gesundheit:     ["1629909613654-28e377c37b09", "1519494026892-80bbd2d6fd0d", "1576091160550-2173dba999ef"],
  it_tech:        ["1497366216548-37526070297c", "1522071820081-009f0129c71c", "1498050108023-c5249f4df085"],
  ecommerce:      ["1586528116311-ad8dd3c8310d", "1556742049-0cfed4f6a45d", "1553413077-190dd305871c"],
  produktion:     ["1565793298595-6a879b1d9492", "1504917595217-d4dc5ebe6122", "1581091226825-a6a2a5aee158"],
  immobilien:     ["1560518883-ce09059eeffa", "1486325212027-8081e485255e", "1582407947304-fd86f28320be"],
  dienstleistungen: ["1521791136064-7986c2920216", "1507679799987-c73779587ccf", "1450101499163-c8848c66ca85"],
  einzelhandel:   ["1556742049-0cfed4f6a45d", "1553413077-190dd305871c", "1586528116311-ad8dd3c8310d"],
};

function photo(category: string, idx: number): string[] {
  const ids = PHOTOS[category] ?? PHOTOS.dienstleistungen;
  const id = ids[idx % 3];
  return [`https://images.unsplash.com/photo-${id}?w=800&h=600&fit=crop`];
}

function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function plan(): string {
  const r = Math.random();
  if (r < 0.6) return "basic";
  if (r < 0.9) return "advanced";
  return "premium";
}

// ─── 50 listings ────────────────────────────────────────────────────────────
const LISTINGS_RAW = [
  // ── GASTRONOMIE (10) ──
  {
    i: 0, category: "gastronomie",
    title: "Traditionelle Bäckerei mit 3 Filialen in Nürnberg",
    city: "Nürnberg", region: "Bayern", country: "DE",
    asking_price: 480000, annual_revenue: 920000, ebitda: 148000, employees: 22, founded_year: 1994,
    description: "Inhabergeführte Bäckerei mit 30 Jahren Geschichte und treuer Stammkundschaft. Alle drei Filialen sind in bester Lage mit langfristigen Mietverträgen gesichert. Das Team von 22 Mitarbeitern arbeitet seit Jahren eingespielt zusammen.",
    business_model: "Tagesfrische Backwaren und Konditoreiprodukte über drei Filialen im Stadtgebiet.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 1, category: "gastronomie",
    title: "Italienisches Restaurant im Münchner Glockenbachviertel",
    city: "München", region: "Bayern", country: "DE",
    asking_price: 320000, annual_revenue: 680000, ebitda: 102000, employees: 12, founded_year: 2008,
    description: "Authentisches Restaurant mit 60 Sitzplätzen und ausgezeichneter Küche. Das Lokal hat sich über 15 Jahre eine starke Stammgästebasis aufgebaut und wird regelmäßig in lokalen Restaurantführern empfohlen. Vollständige Küchenausstattung und Mobiliar inklusive.",
    business_model: "À-la-carte-Restaurant mit Mittagsmenü und Abendkarte, ergänzt durch Catering-Aufträge.",
    reason_for_sale: "Neues Projekt",
  },
  {
    i: 2, category: "gastronomie",
    title: "Café und Coffeeshop in der Hamburger Innenstadt",
    city: "Hamburg", region: "Hamburg", country: "DE",
    asking_price: 195000, annual_revenue: 410000, ebitda: 72000, employees: 8, founded_year: 2015,
    description: "Moderner Coffeeshop mit 40 Sitzplätzen und angesagter Einrichtung in Toplagen. Digitale Bestellsysteme und ein loyaler Kundenstamm aus der umliegenden Bürogemeinschaft. Eigenmarke für Kaffeespezialitäten mit Onlineshop.",
    business_model: "Spezialitätenkaffee und hausgemachte Backwaren mit Fokus auf die Mittagspause und Remote-Worker.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 3, category: "gastronomie",
    title: "Pizzeria mit Lieferservice in Köln-Ehrenfeld",
    city: "Köln", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 145000, annual_revenue: 390000, ebitda: 62000, employees: 9, founded_year: 2012,
    description: "Etablierte Pizzeria mit eigenem Lieferservice und starker Präsenz auf Lieferplattformen. Kundenbewertung von 4,7 Sternen auf über 1.200 Bewertungen. Modernisierte Küche mit Steinofen wurde 2021 vollständig erneuert.",
    business_model: "Vor-Ort-Gastronomie und Lieferservice über eigene App sowie Drittplattformen.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 4, category: "gastronomie",
    title: "Griechisches Restaurant in Stuttgart-Mitte",
    city: "Stuttgart", region: "Baden-Württemberg", country: "DE",
    asking_price: 260000, annual_revenue: 560000, ebitda: 89000, employees: 14, founded_year: 2002,
    description: "Familiengeführtes Restaurant mit 80 Sitzplätzen und 22 Jahren Tradition im Stuttgarter Gastronomieumfeld. Langfristiger Mietvertrag bis 2031 gesichert. Regelmäßige Firmenveranstaltungen und Gruppenreservierungen machen 35 % des Umsatzes aus.",
    business_model: "Griechische Küche mit Mittagstisch, Abendkarte und Veranstaltungsbewirtschaftung.",
    reason_for_sale: "Gesundheitliche Gründe",
  },
  {
    i: 5, category: "gastronomie",
    title: "Bistro und Weinbar in Frankfurt-Sachsenhausen",
    city: "Frankfurt am Main", region: "Hessen", country: "DE",
    asking_price: 220000, annual_revenue: 480000, ebitda: 82000, employees: 10, founded_year: 2010,
    description: "Trendiges Bistro mit kuratierterer Weinkarte und 50 Innen- sowie 20 Außenplätzen. Starke Social-Media-Präsenz mit 8.500 Instagram-Followern. Lieferanten für Naturweine und lokale Produkte sind vertraglich gebunden.",
    business_model: "Abendgastronomie mit Weinverkostungen und monatlichen Wine-Tasting-Events.",
    reason_for_sale: "Neues Projekt",
  },
  {
    i: 6, category: "gastronomie",
    title: "Frühstückscafé und Brunch-Lokal in Leipzig",
    city: "Leipzig", region: "Sachsen", country: "DE",
    asking_price: 120000, annual_revenue: 310000, ebitda: 52000, employees: 7, founded_year: 2017,
    description: "Beliebtes Brunch-Lokal mit 45 Sitzplätzen und konzeptstarker Marke. Das Café ist Mittwoch bis Sonntag geöffnet und erzielt hohe Auslastung durch Stammgäste und Wochenend-Touristen. Wartelisten an Wochenenden von bis zu 45 Minuten.",
    business_model: "Frühstück und Mittagsbrunch mit saisonaler Karte und regionalen Bio-Zutaten.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 7, category: "gastronomie",
    title: "Sushi-Restaurant mit zwei Standorten in Düsseldorf",
    city: "Düsseldorf", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 540000, annual_revenue: 1100000, ebitda: 187000, employees: 28, founded_year: 2009,
    description: "Zwei gut laufende Sushi-Restaurants in zentraler Lage mit erfahrenem Küchenchef und eingeübten Teams. Beide Standorte haben langjährige Mietverträge und umfangreiche Küchenausstattung. Eigene Lieferflotte mit 4 Fahrzeugen.",
    business_model: "Premium-Sushi und japanische Küche, kombiniert mit Mitnahme- und Lieferservice.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 8, category: "gastronomie",
    title: "Konditorei und Café in Salzburg Altstadt",
    city: "Salzburg", region: "Salzburg", country: "AT",
    asking_price: 380000, annual_revenue: 750000, ebitda: 127000, employees: 18, founded_year: 1997,
    description: "Traditionsreiche Konditorei in touristisch stark frequentierter Altstadtlage. Eigene Rezepturen seit 27 Jahren, darunter mehrfach ausgezeichnete Mozarttorten. Saisonale Schwankungen durch Tourismus führen zu hohen Sommer- und Weihnachtsumsätzen.",
    business_model: "Konditorei mit Vor-Ort-Café und Versand von Spezialitäten österreichweit.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 9, category: "gastronomie",
    title: "Burger-Restaurant mit Lieferlizenz in Berlin-Mitte",
    city: "Berlin", region: "Berlin", country: "DE",
    asking_price: 175000, annual_revenue: 420000, ebitda: 67000, employees: 11, founded_year: 2019,
    description: "Modernes Burger-Konzept mit hohem Lieferanteil (60 % Lieferando und Eigenliefer). Vollständig digitalisierter Bestellprozess mit eigenem POS-System. Das Konzept ist skalierbar und wurde für eine mögliche Expansion von Anfang an konzipiert.",
    business_model: "Fast-Casual-Burger-Konzept mit Vor-Ort-Konsum und starkem Lieferkanal.",
    reason_for_sale: "Neues Projekt",
  },

  // ── HANDWERK (8) ──
  {
    i: 10, category: "handwerk",
    title: "KFZ-Werkstatt mit TÜV-Stützpunkt in Hannover",
    city: "Hannover", region: "Niedersachsen", country: "DE",
    asking_price: 680000, annual_revenue: 1450000, ebitda: 247000, employees: 18, founded_year: 1991,
    description: "Etablierte Kfz-Werkstatt mit eigenem TÜV-Stützpunkt und einer Stammkundschaft von über 2.400 Fahrzeughaltern. Moderne Hebebühnen und Diagnosetechnik wurden 2022 vollständig erneuert. Zwei zertifizierte Meister im Team sichern die Qualitätsstandards.",
    business_model: "Kfz-Reparaturen und Hauptuntersuchungen für Privat- und Firmenkunden.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 11, category: "handwerk",
    title: "Sanitär- und Heizungsbetrieb in der Rhein-Main-Region",
    city: "Frankfurt am Main", region: "Hessen", country: "DE",
    asking_price: 820000, annual_revenue: 1800000, ebitda: 306000, employees: 22, founded_year: 1988,
    description: "Vollständig ausgelasteter SHK-Betrieb mit Rahmenverträgen bei mehreren Hausverwaltungen und Immobiliengesellschaften. Fuhrpark mit 12 voll ausgestatteten Servicefahrzeugen. Wartezeiten von 4–6 Wochen zeigen die hohe Nachfrage.",
    business_model: "Wartung, Reparatur und Neuinstallation für Privat- und Gewerbekunden sowie Hausverwaltungen.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 12, category: "handwerk",
    title: "Elektrobetrieb mit Schwerpunkt Photovoltaik in München",
    city: "München", region: "Bayern", country: "DE",
    asking_price: 950000, annual_revenue: 2100000, ebitda: 378000, employees: 25, founded_year: 2003,
    description: "Wachstumsstarker Elektrobetrieb, der sich frühzeitig auf PV-Anlagen und Wallbox-Installationen spezialisiert hat. Vollständig ausgelasteter Auftragsbestand bis Ende 2026. Anerkannter Installationspartner für drei Solarmodulhersteller.",
    business_model: "Elektroinstallation und PV-Anlagen für Privat- und Gewerbeobjekte im Großraum München.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 13, category: "handwerk",
    title: "Schreinerei und Innenausbau in Freiburg",
    city: "Freiburg im Breisgau", region: "Baden-Württemberg", country: "DE",
    asking_price: 420000, annual_revenue: 890000, ebitda: 151000, employees: 12, founded_year: 1999,
    description: "Spezialisierte Schreinerei mit eigener CNC-Fertigung für Maßmöbel und Innenausbau. Kundenstamm besteht hauptsächlich aus Architekten und Bauträgern mit langfristigen Kooperationsverträgen. Ausstellungsraum von 200 m² in bester Lage.",
    business_model: "Maßanfertigungen im Innenausbau und Möbelbau für private und gewerbliche Auftraggeber.",
    reason_for_sale: "Gesundheitliche Gründe",
  },
  {
    i: 14, category: "handwerk",
    title: "Malerbetrieb mit Wärmedämmspezialisierung in Dortmund",
    city: "Dortmund", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 360000, annual_revenue: 780000, ebitda: 125000, employees: 14, founded_year: 2001,
    description: "Malermeisterbetrieb mit starker Zusatzqualifikation in Wärmedämmverbundsystemen und BAFA-zertifizierter Beratung. Auftragsvolumen zu 40 % aus öffentlicher Hand (Schulen, Gemeinden). Fuhrpark und Arbeitsbühnen vollständig vorhanden.",
    business_model: "Malerarbeiten und energetische Sanierung für Wohn- und Gewerbeobjekte.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 15, category: "handwerk",
    title: "Dachdeckerbetrieb mit 8 Mitarbeitern in Magdeburg",
    city: "Magdeburg", region: "Sachsen-Anhalt", country: "DE",
    asking_price: 290000, annual_revenue: 620000, ebitda: 99000, employees: 8, founded_year: 2005,
    description: "Meisterbetrieb mit Spezialkenntnissen im Flachdachbereich und Klempnerarbeiten. Starke regionale Reputation durch über 400 erfolgreiche Projekte. Auftragsbestand ist stets 3–4 Monate im Voraus gefüllt.",
    business_model: "Dachdeckerarbeiten und Flachdachsanierungen für Privat- und Gewerbeobjekte.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 16, category: "handwerk",
    title: "Kältetechnik und Klimaanlagen-Service in Wien",
    city: "Wien", region: "Wien", country: "AT",
    asking_price: 740000, annual_revenue: 1620000, ebitda: 275000, employees: 19, founded_year: 1996,
    description: "Etablierter Kältetechnikbetrieb mit Wartungsverträgen bei 85 Gewerbeobjekten und Supermärkten. Eigenentwickeltes Fernwartungssystem ermöglicht präventive Wartung und reduziert Ausfallzeiten. Stark wachsend durch steigende Klimanachfrage.",
    business_model: "Installation, Wartung und Reparatur von Kälte- und Klimaanlagen für Gewerbekunden.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 17, category: "handwerk",
    title: "Fliesenleger-Betrieb mit Showroom in Augsburg",
    city: "Augsburg", region: "Bayern", country: "DE",
    asking_price: 195000, annual_revenue: 430000, ebitda: 73000, employees: 6, founded_year: 2007,
    description: "Fliesen- und Natursteinverlegebetrieb mit eigener Musterausstellung auf 120 m². Vertrauensvolle Zusammenarbeit mit drei regionalen Bauträgern seit über 10 Jahren. Spezialisierung auf Großformatfliesen und Feinsteinzeug.",
    business_model: "Verlegung und Beratung für Privat- und Gewerbeprojekte im Raum Augsburg.",
    reason_for_sale: "Neues Projekt",
  },

  // ── GESUNDHEIT (7) ──
  {
    i: 18, category: "gesundheit",
    title: "Zahnarztpraxis mit zwei Behandlungszimmern in Hamburg",
    city: "Hamburg", region: "Hamburg", country: "DE",
    asking_price: 1200000, annual_revenue: 980000, ebitda: 294000, employees: 8, founded_year: 2004,
    description: "Moderne Zahnarztpraxis mit digitaler Röntgenanlage, CEREC-System und digitalem Patientenmanagement. Praxis hat eine Warteliste von über 200 Neupatienten. Vollständig digitalisiert mit eigenem Patientenportal und Online-Terminbuchung.",
    business_model: "Zahnärztliche Versorgung mit Schwerpunkt Ästhetische Zahnmedizin und Implantologie.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 19, category: "gesundheit",
    title: "Physiotherapiepraxis mit 4 Behandlungsräumen in Berlin",
    city: "Berlin", region: "Berlin", country: "DE",
    asking_price: 480000, annual_revenue: 620000, ebitda: 111000, employees: 9, founded_year: 2011,
    description: "Gut ausgelastete Physiotherapiepraxis mit Zulassung für alle gesetzlichen und privaten Krankenversicherungen. Auslastung liegt bei 95 % mit mehrwöchiger Wartezeit. Spezialisierungen in Sportphysiotherapie und manueller Therapie.",
    business_model: "Physiotherapie für Kassenpatienten und Selbstzahler mit ergänzenden Wellnessangeboten.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 20, category: "gesundheit",
    title: "Allgemeinarztpraxis in München-Schwabing",
    city: "München", region: "Bayern", country: "DE",
    asking_price: 680000, annual_revenue: 520000, ebitda: 156000, employees: 5, founded_year: 2001,
    description: "Einzelpraxis mit 1.800 aktiven Kassenpatienten und sehr stabilen Umsätzen. Praxis ist vollständig digitalisiert, Patientenkartei auf aktuellem Stand. Arzt ist bereit, den Nachfolger intensiv einzuführen.",
    business_model: "Hausärztliche Grundversorgung mit Kassenarztzulassung in begehrter Münchner Stadtlage.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 21, category: "gesundheit",
    title: "Kieferorthopädische Praxis in Stuttgart",
    city: "Stuttgart", region: "Baden-Württemberg", country: "DE",
    asking_price: 1450000, annual_revenue: 1100000, ebitda: 330000, employees: 12, founded_year: 2006,
    description: "Etablierte kieferorthopädische Praxis mit digitalem 3D-Scan, Invisalign-Partnerstatus und vollem Terminkalender. Praxis betreut ca. 420 aktive Behandlungsfälle gleichzeitig. Starke Empfehlungsrate aus dem bestehenden Patientenstamm.",
    business_model: "Kieferorthopädische Behandlungen für Kinder, Jugendliche und Erwachsene.",
    reason_for_sale: "Gesundheitliche Gründe",
  },
  {
    i: 22, category: "gesundheit",
    title: "Optiker-Fachgeschäft mit Praxis in Zürich",
    city: "Zürich", region: "Zürich", country: "CH",
    asking_price: 890000, annual_revenue: 780000, ebitda: 172000, employees: 7, founded_year: 1998,
    description: "Traditionsreiches Optikfachgeschäft mit angeschlossener Augenarztkooperation und Kontaktlinsen-Service. Hohe Markentreue in der Zürcher Kundschaft mit durchschnittlichem Wiederkauf-Zyklus von 2 Jahren. Exklusivpartner für zwei Luxusbrillenlabels.",
    business_model: "Brillen und Kontaktlinsen für Selbstzahler und Kassenversicherte im Premiumsegment.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 23, category: "gesundheit",
    title: "Ergotherapiepraxis mit Hausbesuchen in Köln",
    city: "Köln", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 220000, annual_revenue: 310000, ebitda: 62000, employees: 5, founded_year: 2013,
    description: "Ergotherapiepraxis mit breitem Behandlungsspektrum und eigenem Hausbesuchsdienst im Stadtgebiet Köln. Verträge mit allen großen Kassen, Spezialisierung auf pädiatrische Ergotherapie. Auslastung dauerhaft über 90 %.",
    business_model: "Ergotherapeutische Behandlungen mit Heimversorgung für Kinder und Senioren.",
    reason_for_sale: "Neues Projekt",
  },
  {
    i: 24, category: "gesundheit",
    title: "Podologiepraxis und Fußpflegezentrum in Dresden",
    city: "Dresden", region: "Sachsen", country: "DE",
    asking_price: 130000, annual_revenue: 210000, ebitda: 46000, employees: 4, founded_year: 2009,
    description: "Podologische Praxis mit medizinischer Zulassung und einem festen Patientenstamm überwiegend aus dem Bereich Diabetologie. Kooperationsvereinbarungen mit zwei Diabeteszentren der Stadt. Moderne Behandlungsausrüstung vollständig vorhanden.",
    business_model: "Medizinische Fußpflege und podologische Behandlungen für Kassenärzte und Selbstzahler.",
    reason_for_sale: "Kein Nachfolger",
  },

  // ── IT & TECH (6) ──
  {
    i: 25, category: "it_tech",
    title: "B2B SaaS-Plattform für Handwerksbetriebe (ARR €420k)",
    city: "München", region: "Bayern", country: "DE",
    asking_price: 2100000, annual_revenue: 580000, ebitda: 174000, employees: 7, founded_year: 2018,
    description: "Skalierbare SaaS-Plattform für Auftragsmanagement und digitale Rechnungsstellung im Handwerk. Über 240 zahlende Abonnenten mit monatlicher Churn-Rate unter 2 %. Net Revenue Retention liegt bei 118 % dank Upselling-Modul.",
    business_model: "Monatliche Abonnements in drei Tarifen (€49/99/199) mit optionalen Zusatzmodulen.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 26, category: "it_tech",
    title: "Digitalagentur mit 12 Festkunden in Hamburg",
    city: "Hamburg", region: "Hamburg", country: "DE",
    asking_price: 640000, annual_revenue: 1100000, ebitda: 198000, employees: 11, founded_year: 2014,
    description: "Full-Service-Digitalagentur mit starkem Fokus auf E-Commerce und Performance Marketing. Zwölf langjährige Bestandskunden decken 70 % des Umsatzes ab und verlängern jährlich automatisch. Team aus 11 Spezialisten mit niedrigem Turnover.",
    business_model: "Monatliche Retainer für SEO, SEA und Webentwicklung kombiniert mit Projektumsätzen.",
    reason_for_sale: "Neues Projekt",
  },
  {
    i: 27, category: "it_tech",
    title: "IT-Systemhaus und Managed Services Provider in Köln",
    city: "Köln", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 1800000, annual_revenue: 3200000, ebitda: 576000, employees: 38, founded_year: 2001,
    description: "Profitables Systemhaus mit 65 Managed-Service-Verträgen für mittelständische Unternehmen. Monatlich wiederkehrende Umsätze decken 55 % der Gesamterlöse. Zertifizierter Microsoft- und Cisco-Partner mit eigenem Rechenzentrum.",
    business_model: "IT-Dienstleistungen, Managed Services und Cloud-Migration für KMU.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 28, category: "it_tech",
    title: "Webdesign und App-Entwicklung Studio in Berlin",
    city: "Berlin", region: "Berlin", country: "DE",
    asking_price: 380000, annual_revenue: 680000, ebitda: 122000, employees: 8, founded_year: 2016,
    description: "Kreativstudio spezialisiert auf Startup-Kunden und Branding für Tech-Unternehmen. Portfolio mit über 80 abgeschlossenen Projekten und durchgängig positiven Bewertungen. Aktiver Talent-Pool mit 4 geprüften Freelancern für skalierbare Projektabwicklung.",
    business_model: "Projektbasierte Webentwicklung und App-Design mit optionalem Wartungsvertrag.",
    reason_for_sale: "Neues Projekt",
  },
  {
    i: 29, category: "it_tech",
    title: "Cybersecurity-Beratung für KMU in Düsseldorf",
    city: "Düsseldorf", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 920000, annual_revenue: 1400000, ebitda: 308000, employees: 14, founded_year: 2012,
    description: "Spezialisiertes Sicherheitsberatungsunternehmen mit CISM-zertifizierten Beratern und regelmäßigen Rahmenvertragspartnern aus dem Mittelstand. Penetration Testing, ISO-27001-Beratung und DSGVO-Compliance als Kernleistungen. Sehr hohe Marge durch Expertenpositioning.",
    business_model: "Sicherheitsaudits und Compliance-Beratung auf Retainer- und Projektbasis.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 30, category: "it_tech",
    title: "E-Learning Plattform für berufliche Weiterbildung",
    city: "Frankfurt am Main", region: "Hessen", country: "DE",
    asking_price: 1500000, annual_revenue: 820000, ebitda: 246000, employees: 9, founded_year: 2017,
    description: "B2B-E-Learning-Plattform mit 58 lizenzierten Unternehmenskunden aus DACH. Über 12.000 aktive Lernende, Content-Bibliothek mit 400 Kursen. Automatisierte Lizenzabrechnung und Lernfortschrittsberichte für HR-Abteilungen.",
    business_model: "Jahreslizenzen pro Nutzer (€99–149) für Unternehmen und Bildungseinrichtungen.",
    reason_for_sale: "Strategischer Verkauf",
  },

  // ── EINZELHANDEL (5) ──
  {
    i: 31, category: "einzelhandel",
    title: "Damenboutique mit treuer Stammkundschaft in Bonn",
    city: "Bonn", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 180000, annual_revenue: 420000, ebitda: 67000, employees: 5, founded_year: 2006,
    description: "Inhabergeführte Damenboutique mit kuratiertem Sortiment aus europäischen Designerlabels. Kundenbindungsprogramm mit 1.200 aktiven Mitgliedern sichert stabile Umsätze. Instagramkanal mit 6.400 Followern und regelmäßigen Lookbook-Posts.",
    business_model: "Stationärer Einzelhandel ergänzt durch kleinen Online-Shop mit 20 % Online-Anteil.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 32, category: "einzelhandel",
    title: "Sportgeschäft und Bikeshop in Innsbruck",
    city: "Innsbruck", region: "Tirol", country: "AT",
    asking_price: 340000, annual_revenue: 680000, ebitda: 109000, employees: 8, founded_year: 2004,
    description: "Sportfachhandel mit starker Fahrrad- und Wintersporthaltung in Tourismuslage. E-Bike-Beratung und -service hat sich in den letzten 3 Jahren zum wichtigsten Wachstumstreiber entwickelt. Reparaturwerkstatt generiert stabile Zusatzumsätze.",
    business_model: "Stationärer Sportfachhandel mit Reparaturservice und saisonaler Vermietung.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 33, category: "einzelhandel",
    title: "Buchhandlung mit Café in Heidelberg",
    city: "Heidelberg", region: "Baden-Württemberg", country: "DE",
    asking_price: 230000, annual_revenue: 510000, ebitda: 71000, employees: 7, founded_year: 1999,
    description: "Kultige Buchhandlung mit integriertem Café und lebhaftem Veranstaltungsprogramm (Lesungen, Buchclubs). Starke Kooperation mit der Universität Heidelberg generiert stabile studentische Kundschaft. Partnerschaft mit lokalem Verlag für Eigenveranstaltungen.",
    business_model: "Buchverkauf, Café-Betrieb und Veranstaltungsformat als ganzheitliches Kulturkonzept.",
    reason_for_sale: "Neues Projekt",
  },
  {
    i: 34, category: "einzelhandel",
    title: "Naturkostladen und Reformhaus in Freiburg",
    city: "Freiburg im Breisgau", region: "Baden-Württemberg", country: "DE",
    asking_price: 160000, annual_revenue: 380000, ebitda: 57000, employees: 5, founded_year: 2011,
    description: "Gut positionierter Naturkostladen mit hohem Bio-Anteil und lokalen Lieferanten. Wöchentliche Gemüsekisten über eigene App mit 240 Abonnenten. Lage in studentisch geprägtem Stadtteil sichert junge und wachsende Kundschaft.",
    business_model: "Stationärer Reformhaus-Einzelhandel mit Abo-Gemüsekiste und Onlinebestellung.",
    reason_for_sale: "Gesundheitliche Gründe",
  },
  {
    i: 35, category: "einzelhandel",
    title: "Baby- und Kinderfachgeschäft in Karlsruhe",
    city: "Karlsruhe", region: "Baden-Württemberg", country: "DE",
    asking_price: 210000, annual_revenue: 490000, ebitda: 78000, employees: 6, founded_year: 2008,
    description: "Spezialisiertes Kinderfachgeschäft mit Markensortiment und persönlicher Beratungsleistung. Kinderwagen-Testparcours und Umtauschservice als Alleinstellungsmerkmale. Bewertungsschnitt von 4,9 Sternen auf Google mit über 340 Rezensionen.",
    business_model: "Fachhandel für Baby- und Kinderartikel mit eigenem Online-Shop.",
    reason_for_sale: "Renteneintritt",
  },

  // ── DIENSTLEISTUNGEN (5) ──
  {
    i: 36, category: "dienstleistungen",
    title: "Steuerberatungskanzlei mit 180 Mandanten in Nürnberg",
    city: "Nürnberg", region: "Bayern", country: "DE",
    asking_price: 860000, annual_revenue: 720000, ebitda: 216000, employees: 9, founded_year: 2003,
    description: "Inhabergeführte Steuerberatungskanzlei mit stabilem Mandantenstamm aus kleinen und mittelständischen Betrieben. Durchschnittliche Mandantenbeziehung dauert 9 Jahre. Vollständige DATEV-Integration und digitaler Dokumentenaustausch.",
    business_model: "Steuerberatung und Jahresabschlüsse auf Jahreshonorar-Basis mit langfristigen Mandatsverhältnissen.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 37, category: "dienstleistungen",
    title: "Gebäudereinigung mit Wartungsverträgen in Leipzig",
    city: "Leipzig", region: "Sachsen", country: "DE",
    asking_price: 420000, annual_revenue: 980000, ebitda: 147000, employees: 34, founded_year: 2007,
    description: "Gebäudereinigungsunternehmen mit 38 aktiven Wartungsverträgen bei Bürogebäuden, Schulen und medizinischen Einrichtungen. Vertragsvolumen sichert 85 % der Umsätze planbar. Moderne Reinigungsmaschinen und Spezialgeräte im Fuhrpark.",
    business_model: "Regelmäßige Gebäudereinigung auf Monatspauschalbasis für Gewerbe und öffentliche Einrichtungen.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 38, category: "dienstleistungen",
    title: "Fahrschule mit 4 Fahrzeugen in Stuttgart",
    city: "Stuttgart", region: "Baden-Württemberg", country: "DE",
    asking_price: 240000, annual_revenue: 380000, ebitda: 76000, employees: 5, founded_year: 2010,
    description: "Gut frequentierte Fahrschule mit 4 Fahrzeugen und drei Fahrlehrern. Theoriestunden werden vollständig online angeboten — Umsatzpotenzial deutlich über Marktdurchschnitt. Google-Bewertung von 4,8 Sternen mit 280 Rezensionen.",
    business_model: "Fahrlehrbetrieb für alle Führerscheinklassen mit Online-Theorie-Modul.",
    reason_for_sale: "Neues Projekt",
  },
  {
    i: 39, category: "dienstleistungen",
    title: "Personalvermittlung für Pflegeberufe in Frankfurt",
    city: "Frankfurt am Main", region: "Hessen", country: "DE",
    asking_price: 1100000, annual_revenue: 2400000, ebitda: 384000, employees: 16, founded_year: 2013,
    description: "Wachstumsstarke Personalvermittlung mit Fokus auf Fachkräfte in der Alten- und Krankenpflege. Netzwerk von über 350 aktiven Kandidaten in DACH sowie Partnerschaften in Polen und Rumänien. Rahmenverträge mit 12 Pflegeheimträgern.",
    business_model: "Vermittlungsgebühren und Interim-Personalüberlassung für Pflegeeinrichtungen.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 40, category: "dienstleistungen",
    title: "Eventplanung und Catering-Koordination in Düsseldorf",
    city: "Düsseldorf", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 310000, annual_revenue: 640000, ebitda: 102000, employees: 7, founded_year: 2008,
    description: "Full-Service-Eventagentur mit Spezialisierung auf Firmenveranstaltungen und Produktpräsentationen. Partnernetzwerk von 18 Lieferanten (Catering, AV-Technik, Dekoration) sichert reibungslose Abwicklung. 70 % Stammkunden aus der Düsseldorfer Wirtschaft.",
    business_model: "Projektbasierte Eventorganisation und Catering-Koordination für B2B-Kunden.",
    reason_for_sale: "Kein Nachfolger",
  },

  // ── PRODUKTION (5) ──
  {
    i: 41, category: "produktion",
    title: "Metallbauunternehmen mit CNC-Anlage in Essen",
    city: "Essen", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 1300000, annual_revenue: 2800000, ebitda: 476000, employees: 32, founded_year: 1993,
    description: "Mittelständischer Metallbauer mit modernem Maschinenpark (CNC-Dreh- und Fräsmaschinen, Laseranlage 2023). Beliefert 8 OEM-Kunden aus dem Maschinenbau mit Rahmenverträgen. Kapazitätsauslastung dauerhaft bei 87 %.",
    business_model: "Lohnfertigung von Präzisionsteilen für Maschinen- und Anlagenbau.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 42, category: "produktion",
    title: "Druckerei und Verpackungsspezialist in Nürnberg",
    city: "Nürnberg", region: "Bayern", country: "DE",
    asking_price: 780000, annual_revenue: 1600000, ebitda: 256000, employees: 21, founded_year: 2000,
    description: "Etablierte Druckerei mit Spezialisierung auf Verpackungsdruck und Folienprägung. Langfristige Rahmenaufträge von 5 Lebensmittelunternehmen. Digitaldruck-Kapazitäten wurden 2021 ausgebaut für Kleinstauflagen.",
    business_model: "Druck- und Verpackungslösungen für Lebensmittel- und Konsumgüterhersteller.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 43, category: "produktion",
    title: "Lebensmittelproduktion: Bioprodukte und Müsli-Herstellung",
    city: "Stuttgart", region: "Baden-Württemberg", country: "DE",
    asking_price: 920000, annual_revenue: 1950000, ebitda: 312000, employees: 18, founded_year: 2009,
    description: "BIO-zertifizierter Lebensmittelhersteller mit Eigenmarke und White-Label-Produktion für 4 Handelsketten. IFS-Food-Zertifizierung aktiv. Produktionsanlage mit 1.800 t Jahreskapazität in modernem Werk mit HACCP-Konzept.",
    business_model: "Eigenmarkenproduktion und OEM-Herstellung für Bio-Lebensmittelhändler.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 44, category: "produktion",
    title: "Kunststoffverarbeitung und Spritzguss in Regensburg",
    city: "Regensburg", region: "Bayern", country: "DE",
    asking_price: 2200000, annual_revenue: 4100000, ebitda: 656000, employees: 45, founded_year: 1986,
    description: "Erfahrener Kunststoffverarbeiter mit 14 Spritzgussmaschinen bis 1.000 t Schließkraft. Langfristige Lieferverträge mit drei Tier-1-Automobilzulieferern. Werkzeugbau im Haus sichert kurze Rüstzeiten und hohe Flexibilität.",
    business_model: "Serienproduktion von Kunststoffkomponenten für Automotive und Medizintechnik.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 45, category: "produktion",
    title: "Schokoladen-Manufaktur mit Webshop in Basel",
    city: "Basel", region: "Basel-Stadt", country: "CH",
    asking_price: 480000, annual_revenue: 720000, ebitda: 144000, employees: 9, founded_year: 2014,
    description: "Handwerkliche Schokoladen-Manufaktur mit eigenem Webshop, Café und B2B-Vertrieb an Hotels und Feinkosthändler. Mehrfach ausgezeichnet bei internationalen Chocolatier-Wettbewerben. Onlineumsatz 38 % mit starkem Wachstum.",
    business_model: "Manufakturschokolade im Direktvertrieb und über Premium-Handelspartner in DACH.",
    reason_for_sale: "Neues Projekt",
  },

  // ── IMMOBILIEN (4) ──
  {
    i: 46, category: "immobilien",
    title: "Immobilienmakler mit Bestandsverwaltung in München",
    city: "München", region: "Bayern", country: "DE",
    asking_price: 1600000, annual_revenue: 1800000, ebitda: 504000, employees: 12, founded_year: 2005,
    description: "Etabliertes Maklerbüro mit Fokus auf Wohnimmobilien und einem Verwaltungsbestand von 320 Einheiten. Jahresprovisionsvolumen stabil über €1,5 Mio. dank breitem Netzwerk und exklusiven Bauträgervereinbarungen. CRM vollständig digitalisiert.",
    business_model: "Immobilienvermittlung und -verwaltung für Privat- und institutionelle Investoren.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 47, category: "immobilien",
    title: "Hausverwaltung mit 420 Einheiten in Frankfurt",
    city: "Frankfurt am Main", region: "Hessen", country: "DE",
    asking_price: 2400000, annual_revenue: 1200000, ebitda: 360000, employees: 8, founded_year: 1998,
    description: "Hausverwaltung mit 420 verwalteten Einheiten in Frankfurt und Umgebung. Alle Eigentümergemeinschaften vertraglich gebunden mit durchschnittlicher Vertragslaufzeit von 5 Jahren. Digitale Eigentümerportal-Software mit 95 % Nutzungsrate.",
    business_model: "WEG- und Mietverwaltung auf monatlicher Pauschalbasis pro Einheit.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 48, category: "immobilien",
    title: "Gewerbemakler und Projektentwicklungsberatung in Hamburg",
    city: "Hamburg", region: "Hamburg", country: "DE",
    asking_price: 1100000, annual_revenue: 980000, ebitda: 245000, employees: 7, founded_year: 2009,
    description: "Spezialisierte Gewerbeimmobilienvermittlung mit langjährigen Beziehungen zu Projektentwicklern, Fonds und Family Offices. Durchschnittliche Transaktionsgröße €4,2 Mio. Beratungsauftrag sichert Honorarumsatz zwischen Transaktionen.",
    business_model: "Exklusivmandate für Gewerbeimmobilienvermittlung kombiniert mit Portfolioberatung.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 49, category: "immobilien",
    title: "Immobilienmakler für Ferienimmobilien in Tirol",
    city: "Innsbruck", region: "Tirol", country: "AT",
    asking_price: 680000, annual_revenue: 540000, ebitda: 135000, employees: 5, founded_year: 2011,
    description: "Spezialmakler für Ferienimmobilien, Chalets und Skigebiet-Liegenschaften in Tirol und Vorarlberg. Kundenstamm aus DACH, Benelux und UK. Online-Listings auf vier internationalen Plattformen mit 28.000 monatlichen Besuchern.",
    business_model: "Käufer- und Verkäuferprovision für internationale Ferienimmobilientransaktionen.",
    reason_for_sale: "Neues Projekt",
  },
];

// ─── Plan distribution helper ────────────────────────────────────────────────
function assignPlan(idx: number): { plan: string; featured: boolean } {
  // 60% basic, 30% advanced, 10% premium
  const r = (idx * 37 + 13) % 100; // deterministic but spread
  if (r < 60) return { plan: "basic",    featured: false };
  if (r < 90) return { plan: "advanced", featured: false };
  return { plan: "premium", featured: true };
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Get first user's ID
  const { data: users, error: userErr } = await supabase.auth.admin.listUsers();
  if (userErr) {
    console.error("Could not list users:", userErr.message);
    process.exit(1);
  }
  const userId = users.users[0]?.id ?? null;
  console.log(`Using user_id: ${userId ?? "null (no users found)"}`);

  // 2. Build rows
  const rows = LISTINGS_RAW.map((l) => {
    const { plan, featured } = assignPlan(l.i);
    const imgs = photo(l.category, l.i);
    const viewsCount = rnd(40, 650);
    const inquiriesCount = rnd(1, 18);
    const transferabilityScore = rnd(45, 88);

    return {
      user_id:                userId,
      status:                 "active" as const,
      type_of_operation:      "vollstaendige_uebertragung" as const,
      category:               l.category,
      city:                   l.city,
      region:                 l.region,
      country:                l.country,
      title:                  l.title,
      description:            l.description,
      business_model:         l.business_model,
      reason_for_sale:        l.reason_for_sale,
      asking_price:           l.asking_price,
      price_confidential:     false,
      annual_revenue:         l.annual_revenue,
      ebitda:                 l.ebitda,
      employees:              l.employees,
      founded_year:           l.founded_year,
      status_business:        "active_profitable" as const,
      plan,
      featured,
      views_count:            viewsCount,
      inquiries_count:        inquiriesCount,
      images:                 imgs,
      transferability_score:  transferabilityScore,
      show_phone:             false,
    };
  });

  // 3. Insert in batches of 10
  let inserted = 0;
  for (let i = 0; i < rows.length; i += 10) {
    const batch = rows.slice(i, i + 10);
    const { error } = await supabase.from("listings").insert(batch);
    if (error) {
      console.error(`Batch ${i}–${i + batch.length - 1} failed:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`✓ Inserted batch ${i}–${i + batch.length - 1} (${inserted} total)`);
    }
  }

  console.log(`\nDone — ${inserted}/${rows.length} listings inserted.`);
}

main();
