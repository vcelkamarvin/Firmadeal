import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://dgfradkmlelexoaayqfg.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SERVICE_ROLE_KEY) { console.error("Set SUPABASE_SERVICE_ROLE_KEY env var"); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  realtime: { transport: class {} as any },
});

const PHOTOS: Record<string, string[]> = {
  gastronomie:      ["1414235077428-338989a2e8c0", "1466978913421-dad2ebd01d17", "1555396273-367ea4eb4db5"],
  handwerk:         ["1558618666-fcd25c85cd64", "1504328345606-18bbc8c9d7d1", "1581092160607-ee22621dd758"],
  gesundheit:       ["1629909613654-28e377c37b09", "1519494026892-80bbd2d6fd0d", "1576091160550-2173dba999ef"],
  it_tech:          ["1497366216548-37526070297c", "1522071820081-009f0129c71c", "1498050108023-c5249f4df085"],
  einzelhandel:     ["1556742049-0cfed4f6a45d", "1553413077-190dd305871c", "1586528116311-ad8dd3c8310d"],
  dienstleistungen: ["1521791136064-7986c2920216", "1507679799987-c73779587ccf", "1450101499163-c8848c66ca85"],
};

function photo(category: string, idx: number): string[] {
  const ids = PHOTOS[category] ?? PHOTOS.dienstleistungen;
  return [`https://images.unsplash.com/photo-${ids[idx % 3]}?w=800&h=600&fit=crop`];
}
function rnd(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function assignPlan(idx: number) {
  const r = (idx * 53 + 17) % 100;
  if (r < 60) return { plan: "basic",    featured: false };
  if (r < 90) return { plan: "advanced", featured: false };
  return { plan: "premium", featured: true };
}

const LISTINGS_RAW = [
  // ── GASTRONOMIE (10) ──
  {
    i: 0, category: "gastronomie",
    title: "Asiatisches Fusion-Restaurant in Hannover-Mitte",
    city: "Hannover", region: "Niedersachsen", country: "DE",
    asking_price: 290000, annual_revenue: 620000, ebitda: 99000, employees: 14, founded_year: 2013,
    description: "Modernes Fusionsrestaurant mit Konzept aus japanischer und peruanischer Küche in bester Hannoverscher Innenstadtlage. 65 Sitzplätze, vollständig renoviert 2022. Eigene Cocktailbar generiert 18 % Zusatzumsatz.",
    business_model: "À-la-carte-Restaurant mit Cocktailbar und privaten Reservierungen für Gruppenevents.",
    reason_for_sale: "Neues Projekt",
  },
  {
    i: 1, category: "gastronomie",
    title: "Frühstückscafé und Bäckerei in Bremen-Schwachhausen",
    city: "Bremen", region: "Bremen", country: "DE",
    asking_price: 175000, annual_revenue: 395000, ebitda: 63000, employees: 9, founded_year: 2016,
    description: "Beliebtestes Frühstückscafé im Bremer Villenviertel mit hausgemachten Backwaren und einer treuen Stammkundschaft aus der umliegenden Wohnbevölkerung. Bio-zertifizierte Zutaten und regionale Lieferanten. Wartelisten an Wochenenden.",
    business_model: "Frühstück und Brunch täglich bis 15 Uhr, ergänzt durch Catering für Privatfeiern.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 2, category: "gastronomie",
    title: "Thai-Restaurant mit Take-Away in Münster",
    city: "Münster", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 195000, annual_revenue: 440000, ebitda: 70000, employees: 10, founded_year: 2014,
    description: "Authentisches Thai-Restaurant mit 55 Sitzplätzen und stark frequentiertem Take-Away-Schalter. Mittagsmenü an Wochentagen mit 40 % Auslastung durch Bürogemeinschaft. Bewertung 4,6 Sterne bei 890 Google-Rezensionen.",
    business_model: "Vor-Ort-Restaurant und Take-Away-Service für Mittagszeit und Abend.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 3, category: "gastronomie",
    title: "Steakhouse mit Grillterrasse in Bielefeld",
    city: "Bielefeld", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 380000, annual_revenue: 820000, ebitda: 131000, employees: 17, founded_year: 2008,
    description: "Etabliertes Steakhouse mit 80 Innen- und 40 Außenplätzen auf gepflegter Terrasse. US-Prime-Beef-Sortiment als Alleinstellungsmerkmal. Firmenevents machen 30 % des Jahresumsatzes aus, Vorausbuchungen bis zu 3 Monate.",
    business_model: "Premium-Steakhouse für Privat- und Geschäftskunden mit Veranstaltungsservice.",
    reason_for_sale: "Gesundheitliche Gründe",
  },
  {
    i: 4, category: "gastronomie",
    title: "Vietnamesisches Restaurant in Wiesbaden",
    city: "Wiesbaden", region: "Hessen", country: "DE",
    asking_price: 160000, annual_revenue: 360000, ebitda: 58000, employees: 8, founded_year: 2017,
    description: "Frisches, lichtdurchflutetes Restaurant mit 50 Sitzplätzen und modernem Interieur. Starke Bewertung auf Google und TripAdvisor mit 4,7 Durchschnitt. Vollständige Küchenausstattung sowie Mobiliar Eigentum des Verkäufers.",
    business_model: "Authentische vietnamesische Küche für Mittagstisch und Abendgastronomie.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 5, category: "gastronomie",
    title: "Dönerimbiss mit Franchise-Potenzial in Mannheim",
    city: "Mannheim", region: "Baden-Württemberg", country: "DE",
    asking_price: 120000, annual_revenue: 290000, ebitda: 52000, employees: 6, founded_year: 2015,
    description: "Gut laufender Dönerimbiss in belebter Fußgängerzone mit Eigenrezeptur und loyaler Stammkundschaft. Betrieb ist vollständig digitalisiert (Kassensystem, Online-Bestellung). Konzept eignet sich für Franchising oder zweiten Standort.",
    business_model: "Schnellservice-Gastronomie mit eigenem Lieferradius von 3 km.",
    reason_for_sale: "Neues Projekt",
  },
  {
    i: 6, category: "gastronomie",
    title: "Weinrestaurant mit Weinkeller in Erfurt",
    city: "Erfurt", region: "Thüringen", country: "DE",
    asking_price: 310000, annual_revenue: 670000, ebitda: 107000, employees: 13, founded_year: 2005,
    description: "Gehobenes Weinrestaurant mit eigenem Weinkeller (ca. 4.500 Flaschen) in historischen Stadtmauern. Kooperationspartner mit thüringischen Weingütern. Regelmäßige Weinproben und Menüveranstaltungen sichern wiederkehrende Gästegruppen.",
    business_model: "Fine-Dining-Restaurant mit kuratierter Weinkarte und monatlichen Degustationsmenüs.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 7, category: "gastronomie",
    title: "Fischrestaurant am Hafen in Rostock",
    city: "Rostock", region: "Mecklenburg-Vorpommern", country: "DE",
    asking_price: 425000, annual_revenue: 890000, ebitda: 142000, employees: 19, founded_year: 2001,
    description: "Traditionsreiche Fischgastronomie mit einzigartiger Hafenaussicht und direktem Kontakt zu lokalen Fischern. Hochsaison durch Tourismus Juli–September mit Vollauslastung. Eigene Räucherkammer als Produktionsvorteil.",
    business_model: "Saisonale Fischgastronomie mit Eigenräucherei und Fischverkauf an Endkunden.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 8, category: "gastronomie",
    title: "Eiscafé und Gelateria in Kiel",
    city: "Kiel", region: "Schleswig-Holstein", country: "DE",
    asking_price: 140000, annual_revenue: 320000, ebitda: 54000, employees: 7, founded_year: 2011,
    description: "Beliebtes Eiscafé mit eigenem Gelato-Labor und 42 selbst hergestellten Sorten pro Saison. Etabliertes Catering für Veranstaltungen in der Kieler Sailing-Week. Standort in Innenstadt mit langer Mietvertragslaufzeit.",
    business_model: "Eisverkauf vor Ort und Cateringeinsatz bei saisonalen Events.",
    reason_for_sale: "Gesundheitliche Gründe",
  },
  {
    i: 9, category: "gastronomie",
    title: "Cocktailbar und Lounge in Karlsruhe-Innenstadt",
    city: "Karlsruhe", region: "Baden-Württemberg", country: "DE",
    asking_price: 185000, annual_revenue: 410000, ebitda: 65000, employees: 8, founded_year: 2016,
    description: "Trendy Cocktailbar mit 70 Plätzen und DJ-Podium für Wochenend-Events. Monatliche Themenabende mit festem Publikum aus der Karlsruher Studierendenschaft. Konzession für Getränkeausschank bis 4 Uhr vorhanden.",
    business_model: "Abendgastronomie und Nachtlokal mit Event-Veranstaltungen und Privatbuchungen.",
    reason_for_sale: "Strategischer Verkauf",
  },

  // ── HANDWERK (8) ──
  {
    i: 10, category: "handwerk",
    title: "Tischler und Innenausbau-Betrieb in Hannover",
    city: "Hannover", region: "Niedersachsen", country: "DE",
    asking_price: 320000, annual_revenue: 690000, ebitda: 117000, employees: 10, founded_year: 2003,
    description: "Tischlereibetrieb mit eigenem CNC-Bearbeitungszentrum und Showroom. Schwerpunkt auf Ladenbau und Büroeinrichtung für regionale Unternehmen. Rahmenverträge mit zwei Immobilienunternehmen für laufende Projekte.",
    business_model: "Maßanfertigungen im Möbel- und Ladenbau für Gewerbe- und Privatkunden.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 11, category: "handwerk",
    title: "Heizung und Sanitär GmbH in Dortmund",
    city: "Dortmund", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 680000, annual_revenue: 1480000, ebitda: 251000, employees: 19, founded_year: 1996,
    description: "Etablierter SHK-Betrieb mit eigenem Kundendienst und Bereitschaftsdienst. Jahresabonnements für Heizungswartung bei 380 Privathaushalten sichern planbares Grundeinkommen. Zertifizierter Viessmann- und Bosch-Partner.",
    business_model: "Wartung, Reparatur und Neuinstallation mit Jahresservice-Verträgen.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 12, category: "handwerk",
    title: "Elektro- und Gebäudetechnik in Bielefeld",
    city: "Bielefeld", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 510000, annual_revenue: 1120000, ebitda: 190000, employees: 15, founded_year: 2000,
    description: "Elektrobetrieb mit starkem Fokus auf Industrie- und Gewerbeinstallationen. Rahmenvertrag mit Bielefelder Industriepark sichert 35 % Grundauslastung. Fuhrpark mit 8 voll ausgestatteten Fahrzeugen.",
    business_model: "Elektroinstallation und Gebäudetechnik für Industrie und Gewerbe.",
    reason_for_sale: "Gesundheitliche Gründe",
  },
  {
    i: 13, category: "handwerk",
    title: "Dach- und Fassadenbetrieb in Rostock",
    city: "Rostock", region: "Mecklenburg-Vorpommern", country: "DE",
    asking_price: 280000, annual_revenue: 590000, ebitda: 100000, employees: 9, founded_year: 2006,
    description: "Spezialisierter Dachdecker und Fassadenbauer mit Erfahrung in Küstenklima-Bauten und Reetdächern. Starke Auftragslage durch wachsenden Tourismussektor in Mecklenburg-Vorpommern. Saisonale Peaks April bis Oktober vollständig ausgebucht.",
    business_model: "Dachdeckerarbeiten und Fassadensanierungen für Privat- und Gewerbe.",
    reason_for_sale: "Neues Projekt",
  },
  {
    i: 14, category: "handwerk",
    title: "Metallbau und Schlosserei in Mannheim",
    city: "Mannheim", region: "Baden-Württemberg", country: "DE",
    asking_price: 450000, annual_revenue: 970000, ebitda: 165000, employees: 14, founded_year: 1998,
    description: "Schlosserei und Metallbaubetrieb mit Schweißwerkstatt und Laseranlage. Spezialist für Geländer, Tore und individuelle Stahlkonstruktionen. Kundenstamm aus Architekten und gewerblichen Immobilieneigentümern.",
    business_model: "Individuelle Metallbau-Lösungen für Wohn- und Gewerbeimmobilien.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 15, category: "handwerk",
    title: "Maler und Lackierer GmbH in Wiesbaden",
    city: "Wiesbaden", region: "Hessen", country: "DE",
    asking_price: 240000, annual_revenue: 510000, ebitda: 87000, employees: 10, founded_year: 2004,
    description: "Malerbetrieb mit Spezialisierung auf hochwertige Wohnimmobilien und Denkmalpflege. Langjährige Zusammenarbeit mit drei renommierten Architekturstudios in Wiesbaden. Vollständig zertifiziert für Keim-Mineralfarben und Kalkputztechniken.",
    business_model: "Premium-Malerarbeiten für Privatkunden und Denkmalpflegeprojekte.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 16, category: "handwerk",
    title: "Gartenbau und Landschaftspflege in Münster",
    city: "Münster", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 380000, annual_revenue: 820000, ebitda: 139000, employees: 18, founded_year: 2001,
    description: "Garten- und Landschaftsbaubetrieb mit 95 Dauerpflegeverträgen für Wohnanlagen, Firmensitze und Privatgärten. Eigenentwickelter Mähroboter-Service als skalierbares Zusatzprodukt. Fuhrpark mit 6 Fahrzeugen und Spezialgeräten.",
    business_model: "Gartenpflege-Abonnements und Neugestaltungsprojekte für Privat und Gewerbe.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 17, category: "handwerk",
    title: "Stuckateur und Trockenbau in Karlsruhe",
    city: "Karlsruhe", region: "Baden-Württemberg", country: "DE",
    asking_price: 195000, annual_revenue: 420000, ebitda: 71000, employees: 7, founded_year: 2009,
    description: "Stuckateurbetrieb mit Spezialisierung auf Trockenbau-Systemlösungen für Neubauprojekte. Rahmenvertrag mit zwei regionalen Generalunternehmern sichert kontinuierliche Auslastung. Meister und Gesellen mit hohem Qualitätsbewusstsein.",
    business_model: "Stuckateur- und Trockenbauarbeiten auf Projekt- und Rahmenbasis.",
    reason_for_sale: "Renteneintritt",
  },

  // ── GESUNDHEIT (7) ──
  {
    i: 18, category: "gesundheit",
    title: "Hausarztpraxis mit zwei Ärzten in Bremen",
    city: "Bremen", region: "Bremen", country: "DE",
    asking_price: 890000, annual_revenue: 780000, ebitda: 234000, employees: 8, founded_year: 2003,
    description: "Gut etablierte Gemeinschaftspraxis mit zwei Kassenarztzulassungen und 2.400 aktiven Patienten. Vollständig digitalisiert, eigenem Labor und Ultraschalldiagnostik. Neue Praxissoftware reduziert Verwaltungsaufwand um 40 %.",
    business_model: "Hausärztliche Versorgung für Kassenpatienten mit Privatpatientenoption.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 19, category: "gesundheit",
    title: "Orthopädische Praxis in Hannover",
    city: "Hannover", region: "Niedersachsen", country: "DE",
    asking_price: 780000, annual_revenue: 640000, ebitda: 192000, employees: 7, founded_year: 2007,
    description: "Orthopädische Facharztpraxis mit MRT-Kooperation und Sportmedizin-Zertifizierung. Enge Zusammenarbeit mit zwei Sportvereinen als Mannschaftsarzt sichert regelmäßigen Patientenstrom. Vollständig für Kassenpatienten und Selbstzahler zugelassen.",
    business_model: "Orthopädische Versorgung mit Schwerpunkt Sportmedizin und manuelle Therapie.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 20, category: "gesundheit",
    title: "Logopädie-Praxis mit 3 Behandlungsräumen in Dortmund",
    city: "Dortmund", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 260000, annual_revenue: 360000, ebitda: 79000, employees: 6, founded_year: 2010,
    description: "Logopädiepraxis mit kassenärztlicher Zulassung und Warteliste von 8 Wochen. Spezialisierung auf pädiatrische Sprachentwicklungsstörungen und Stimmtherapie für Erwachsene. Kooperation mit zwei Grundschulen für regelmäßige Reihenuntersuchungen.",
    business_model: "Logopädische Behandlungen für Kassen- und Privatpatienten.",
    reason_for_sale: "Neues Projekt",
  },
  {
    i: 21, category: "gesundheit",
    title: "Psychotherapie-Praxis in Wiesbaden",
    city: "Wiesbaden", region: "Hessen", country: "DE",
    asking_price: 420000, annual_revenue: 380000, ebitda: 114000, employees: 4, founded_year: 2012,
    description: "Approbierte psychotherapeutische Praxis mit Zulassung für Verhaltenstherapie und tiefenpsychologische Methoden. Warteliste von über 6 Monaten zeigt enormen Bedarf. Online-Therapieoptionen wurden 2021 integriert.",
    business_model: "Ambulante Psychotherapie für Erwachsene und Jugendliche, Kassen- und Privat.",
    reason_for_sale: "Gesundheitliche Gründe",
  },
  {
    i: 22, category: "gesundheit",
    title: "Fitnessstudio und Personal-Training-Center in Mannheim",
    city: "Mannheim", region: "Baden-Württemberg", country: "DE",
    asking_price: 560000, annual_revenue: 720000, ebitda: 144000, employees: 14, founded_year: 2009,
    description: "Premiumfitnessstudio mit 420 aktiven Mitgliedern und Personal-Training-Konzept. Eigener Juice-Bar-Bereich und Saunalandschaft. Monatliche Mitgliederzahl wächst kontinuierlich seit der Renovierung 2023.",
    business_model: "Mitgliedschaften ab €49/Monat kombiniert mit Personal-Training-Paketen.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 23, category: "gesundheit",
    title: "Augenoptiker mit Optometrie in Münster",
    city: "Münster", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 490000, annual_revenue: 580000, ebitda: 127000, employees: 8, founded_year: 2004,
    description: "Optikfachgeschäft mit Optometrie-Service, Kontaktlinsenversorgung und eigenem Labor. Kooperation mit einem Augenarzt im selben Gebäude erhöht Patientenfrequenz deutlich. Exclusivvertrag für zwei hochpreisige Designermarken.",
    business_model: "Brillen und Kontaktlinsen mit Optometrie-Dienstleistung für Selbstzahler.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 24, category: "gesundheit",
    title: "Heilpraktikerpraxis und Naturheilkunde in Erfurt",
    city: "Erfurt", region: "Thüringen", country: "DE",
    asking_price: 175000, annual_revenue: 240000, ebitda: 62000, employees: 3, founded_year: 2008,
    description: "Naturheilkundepraxis mit Schwerpunkt TCM, Akupunktur und Homöopathie. Gut vernetzt in der Erfurter Gesundheitscommunity mit regelmäßigen Überweisungen von Hausärzten. Eigenentwickelter Online-Symptomcheck als Aquisetool.",
    business_model: "Einzelpraxis für ganzheitliche Medizin mit Selbstzahlerpatienten.",
    reason_for_sale: "Kein Nachfolger",
  },

  // ── EINZELHANDEL (5) ──
  {
    i: 25, category: "einzelhandel",
    title: "Weinhandlung und Vinothek in Wiesbaden",
    city: "Wiesbaden", region: "Hessen", country: "DE",
    asking_price: 280000, annual_revenue: 540000, ebitda: 86000, employees: 5, founded_year: 2007,
    description: "Weinhandlung mit Vinothek und eigenem Degustationsraum für bis zu 16 Personen. Curated Selection aus Deutschland, Frankreich und Italien. Monatlicher Weinabo-Service mit 180 aktiven Abonnenten.",
    business_model: "Weinverkauf, Abo-Service und Verkostungsveranstaltungen für Privat und Unternehmen.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 26, category: "einzelhandel",
    title: "Haushaltswarenhandel mit Online-Shop in Münster",
    city: "Münster", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 220000, annual_revenue: 480000, ebitda: 77000, employees: 6, founded_year: 2010,
    description: "Spezialisierter Haushaltswarenhändler mit stationärem Geschäft und stark wachsendem Online-Shop (45 % Online-Anteil). Eigene Marke für Küchenutensilien mit über 2.400 Bestandskunden. Amazon-Seller-Status mit 4,8-Stern-Bewertung.",
    business_model: "Multichannel-Einzelhandel für Küchenartikel und Haushaltsprodukte.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 27, category: "einzelhandel",
    title: "Schmuck und Uhrengeschäft in Erfurt-Innenstadt",
    city: "Erfurt", region: "Thüringen", country: "DE",
    asking_price: 390000, annual_revenue: 680000, ebitda: 109000, employees: 6, founded_year: 1995,
    description: "Traditionsreiches Juweliergeschäft mit 30-jähriger Geschichte in der Erfurter Krämerbrücke. Autorisierter Händler für Tissot, Citizen und Swarovski. Hoher Wiederverkaufsanteil und Reparaturservice als stabiles Zusatzgeschäft.",
    business_model: "Schmuck- und Uhrenverkauf mit Reparaturservice und Eigenkreationen.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 28, category: "einzelhandel",
    title: "Outdoorausrüstung und Bergsport in Rostock",
    city: "Rostock", region: "Mecklenburg-Vorpommern", country: "DE",
    asking_price: 195000, annual_revenue: 420000, ebitda: 67000, employees: 5, founded_year: 2012,
    description: "Outdoorfachgeschäft mit Fokus auf Wasser- und Bergsport, Kanu und Kajak. Vermietservice für Wassersport-Equipment generiert stabile Saisonerträge. Partnerschaft mit lokalen Outdoor-Guides für Paketangebote.",
    business_model: "Fachhandel und Verleihservice für Outdoor- und Wassersportausrüstung.",
    reason_for_sale: "Neues Projekt",
  },
  {
    i: 29, category: "einzelhandel",
    title: "Schreibwaren und Bürobedarfshandel in Bielefeld",
    city: "Bielefeld", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 150000, annual_revenue: 340000, ebitda: 54000, employees: 4, founded_year: 2003,
    description: "Gut sortiertes Fachgeschäft für Schreibwaren, Bürobedarf und Kunstmaterialien. Feste Kooperationsverträge mit drei Schulen und einer Kunsthochschule als Großabnehmer. Online-Shop mit 1.800 Produkten seit 2020.",
    business_model: "Stationärer Fachhandel mit B2B-Großkundenverträgen und Online-Vertrieb.",
    reason_for_sale: "Renteneintritt",
  },

  // ── IT & TECH (5) ──
  {
    i: 30, category: "it_tech",
    title: "SEO-Agentur mit 18 Retainer-Kunden in Hannover",
    city: "Hannover", region: "Niedersachsen", country: "DE",
    asking_price: 720000, annual_revenue: 1100000, ebitda: 242000, employees: 12, founded_year: 2013,
    description: "Spezialisierte SEO- und Content-Marketing-Agentur mit 18 langfristigen Retainer-Verträgen. Monatlich wiederkehrende Umsätze decken 88 % der Einnahmen. Eigene Keyword-Tracking-Software als IP und Kundenbindungsmerkmal.",
    business_model: "SEO-Retainer und Content-Produktion für mittelständische E-Commerce-Unternehmen.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 31, category: "it_tech",
    title: "Cloud-Migrations-Agentur für KMU in Dortmund",
    city: "Dortmund", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 1100000, annual_revenue: 1800000, ebitda: 360000, employees: 18, founded_year: 2015,
    description: "AWS- und Azure-zertifizierte Cloud-Agentur mit Fokus auf Migration und Managed Services für KMU. 42 aktive Managed-Service-Kunden zahlen monatliche Pauschalen. Stark wachsendes Geschäft durch zunehmende Digitalisierung im Mittelstand.",
    business_model: "Cloud-Migrations-Projekte und monatliche Managed-Service-Verträge.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 32, category: "it_tech",
    title: "Softwareentwicklung für Logistik-Branche in Bremen",
    city: "Bremen", region: "Bremen", country: "DE",
    asking_price: 2800000, annual_revenue: 2200000, ebitda: 528000, employees: 22, founded_year: 2011,
    description: "Nischensoftware-Unternehmen mit proprietärer TMS-Lösung (Transport-Management-System) für 12 Speditionskunden. ARR von €1,8 Mio. vollständig aus SaaS-Verträgen. Patentierter Algorithmus für Routenoptimierung als technisches Alleinstellungsmerkmal.",
    business_model: "SaaS-TMS mit Jahreslizenzen und Implementierungsdienstleistungen.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 33, category: "it_tech",
    title: "UX/UI Design Studio in Mannheim",
    city: "Mannheim", region: "Baden-Württemberg", country: "DE",
    asking_price: 480000, annual_revenue: 780000, ebitda: 172000, employees: 9, founded_year: 2016,
    description: "Design-Studio mit Fokus auf komplexe B2B-Softwareprodukte und Enterprise-UX. Arbeitet ausschließlich auf Empfehlungsbasis mit einer Warteliste von 3–4 Monaten. Interne Design-System-Bibliothek als übertragbarer Asset.",
    business_model: "UX-Projekte und Design-System-Aufbau auf Retainer- und Projektbasis.",
    reason_for_sale: "Neues Projekt",
  },
  {
    i: 34, category: "it_tech",
    title: "Webshop-Agentur Shopify-Spezialist in Münster",
    city: "Münster", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 560000, annual_revenue: 890000, ebitda: 196000, employees: 10, founded_year: 2017,
    description: "Shopify-Plus-Partner-Agentur mit 28 aktiven E-Commerce-Kunden. Eigene App-Bibliothek mit 5 Shopify-Extensions im Partner-Store. Stark in Mode-, Beauty- und Lifestyle-Brands positioniert.",
    business_model: "Shopify-Entwicklungsprojekte und monatliche Wartungs-Retainer.",
    reason_for_sale: "Strategischer Verkauf",
  },

  // ── DIENSTLEISTUNGEN (5) ──
  {
    i: 35, category: "dienstleistungen",
    title: "Unternehmensberatung für KMU in Hannover",
    city: "Hannover", region: "Niedersachsen", country: "DE",
    asking_price: 680000, annual_revenue: 920000, ebitda: 230000, employees: 8, founded_year: 2010,
    description: "Strategische Unternehmensberatung für mittelständische Industrie- und Handwerksbetriebe. Schwerpunkte: Prozessoptimierung, Nachfolgeplanung und Finanzierungsberatung. Netzwerk mit 12 Bankpartnern und 5 M&A-Kanzleien für cross-referral.",
    business_model: "Beratungsmandate auf Tages- und Pauschalbasis für Unternehmen 2–50 Mio. Umsatz.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 36, category: "dienstleistungen",
    title: "Buchhaltungs- und Lohnbüro in Bielefeld",
    city: "Bielefeld", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 390000, annual_revenue: 520000, ebitda: 156000, employees: 7, founded_year: 2006,
    description: "Buchhaltungs- und Lohnbüro mit 95 aktiven Mandanten aus Handel und Handwerk. Vollständig DATEV-basiert mit Cloud-Buchführung und digitaler Belegübermittlung. Sehr geringer Mandantenwechsel (< 3 % p.a.).",
    business_model: "Monatliche Pauschalen für Buchführung und Lohnabrechnung.",
    reason_for_sale: "Kein Nachfolger",
  },
  {
    i: 37, category: "dienstleistungen",
    title: "Sicherheitsdienst und Objektschutz in Dortmund",
    city: "Dortmund", region: "Nordrhein-Westfalen", country: "DE",
    asking_price: 820000, annual_revenue: 1900000, ebitda: 285000, employees: 48, founded_year: 2008,
    description: "IHK-geprüfter Sicherheitsdienst mit 38 Bewachungsverträgen für Einkaufszentren, Industrieobjekte und Veranstaltungen. Eigene Alarmzentrale mit 24/7-Monitoring. Sicherheitsausrüstung im Wert von €280.000 inklusive.",
    business_model: "Dauerbewachung auf Monatsbasis und projektbezogene Veranstaltungssicherheit.",
    reason_for_sale: "Strategischer Verkauf",
  },
  {
    i: 38, category: "dienstleistungen",
    title: "Werbeagentur und Druckerei in Rostock",
    city: "Rostock", region: "Mecklenburg-Vorpommern", country: "DE",
    asking_price: 340000, annual_revenue: 640000, ebitda: 115000, employees: 9, founded_year: 2005,
    description: "Vollservice-Werbeagentur mit eigenem Digitaldruck. Stammkunden aus Tourismus und Regionalhandel. Produktionsausstattung vollständig im Eigentum — kein Outsourcing nötig.",
    business_model: "Agenturleistungen und Druckproduktion für regionale Unternehmen.",
    reason_for_sale: "Renteneintritt",
  },
  {
    i: 39, category: "dienstleistungen",
    title: "Umzugsunternehmen mit Lagerlogistik in Kiel",
    city: "Kiel", region: "Schleswig-Holstein", country: "DE",
    asking_price: 310000, annual_revenue: 720000, ebitda: 129000, employees: 16, founded_year: 2003,
    description: "Etabliertes Umzugsunternehmen mit Möbellager von 800 m². Kooperationsverträge mit zwei Wohnungsbaugesellschaften sichern planbare Auftragslagen. Fuhrpark mit 5 Möbelwagen, davon 2 mit Hebebühne.",
    business_model: "Privat- und Gewerbeumzüge mit Einlagerungsservice.",
    reason_for_sale: "Kein Nachfolger",
  },
];

async function main() {
  const { data: users } = await supabase.auth.admin.listUsers();
  const userId = users?.users[0]?.id ?? null;
  console.log(`Using user_id: ${userId ?? "null"}`);

  const rows = LISTINGS_RAW.map((l) => {
    const { plan, featured } = assignPlan(l.i);
    return {
      user_id:               userId,
      status:                "active" as const,
      type_of_operation:     "vollstaendige_uebertragung" as const,
      category:              l.category,
      city:                  l.city,
      region:                l.region,
      country:               l.country,
      title:                 l.title,
      description:           l.description,
      business_model:        l.business_model,
      reason_for_sale:       l.reason_for_sale,
      asking_price:          l.asking_price,
      price_confidential:    false,
      annual_revenue:        l.annual_revenue,
      ebitda:                l.ebitda,
      employees:             l.employees,
      founded_year:          l.founded_year,
      status_business:       "active_profitable" as const,
      plan,
      featured,
      views_count:           rnd(40, 650),
      inquiries_count:       rnd(1, 18),
      images:                photo(l.category, l.i),
      transferability_score: rnd(45, 88),
      show_phone:            false,
    };
  });

  let inserted = 0;
  for (let i = 0; i < rows.length; i += 10) {
    const batch = rows.slice(i, i + 10);
    const { error } = await supabase.from("listings").insert(batch);
    if (error) {
      console.error(`Batch ${i}–${i + batch.length - 1} failed:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`✓ Batch ${i}–${i + batch.length - 1} (${inserted} total)`);
    }
  }

  const { count } = await supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active");
  console.log(`\nDone — ${inserted}/40 inserted. Total active listings: ${count}`);
}

main();
