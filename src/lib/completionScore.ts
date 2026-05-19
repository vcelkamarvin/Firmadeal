export interface ScoreItem {
  key: string;
  label: string;
  points: number;
  filled: boolean;
  hint: string;
  impact: string;
}

interface Listing {
  title?: string | null;
  description?: string | null;
  images?: string[] | null;
  ebitda?: number | null;
  transferability_score?: number | null;
  phone?: string | null;
  asking_price?: number | null;
}

export function calcCompletionScore(listing: Listing): {
  score: number;
  items: ScoreItem[];
  topMissing: ScoreItem | null;
} {
  const items: ScoreItem[] = [
    {
      key:    "transferability",
      label:  "Übertragbarkeit",
      points: 20,
      filled: listing.transferability_score != null,
      hint:   "Übertragbarkeitsanalyse ausfüllen",
      impact: "+22% mehr Anfragen",
    },
    {
      key:    "images",
      label:  "Fotos",
      points: 15,
      filled: (listing.images?.length ?? 0) > 0,
      hint:   "Mindestens 1 Foto hinzufügen",
      impact: "+15% mehr Aufrufe",
    },
    {
      key:    "description",
      label:  "Beschreibung",
      points: 15,
      filled: (listing.description?.length ?? 0) > 50,
      hint:   "Beschreibung der Tätigkeit ausfüllen",
      impact: "+18% mehr Anfragen",
    },
    {
      key:    "ebitda",
      label:  "EBITDA",
      points: 15,
      filled: (listing.ebitda ?? 0) > 0,
      hint:   "EBITDA / Jahresgewinn ergänzen",
      impact: "+31% mehr Anfragen",
    },
    {
      key:    "price",
      label:  "Kaufpreis",
      points: 15,
      filled: (listing.asking_price ?? 0) > 0,
      hint:   "Kaufpreis oder \"Auf Anfrage\" setzen",
      impact: "+12% mehr Aufrufe",
    },
    {
      key:    "phone",
      label:  "Telefon",
      points: 10,
      filled: (listing.phone?.length ?? 0) > 5,
      hint:   "Telefonnummer hinzufügen",
      impact: "+9% mehr Direktkontakte",
    },
    {
      key:    "title",
      label:  "Titel",
      points: 10,
      filled: (listing.title?.length ?? 0) > 10,
      hint:   "Aussagekräftigen Titel vergeben",
      impact: "+8% mehr Klicks",
    },
  ];

  const score = items.reduce((sum, item) => sum + (item.filled ? item.points : 0), 0);
  const topMissing = items.filter((i) => !i.filled).sort((a, b) => b.points - a.points)[0] ?? null;

  return { score, items, topMissing };
}
