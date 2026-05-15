export type ListingStatus = "draft" | "active" | "paused" | "expired";
export type BusinessStatus = "active_profitable" | "in_development" | "restructuring";
export type ListingPlan = "base" | "plus" | "premium";
export type OperationType =
  | "vollstaendige_uebertragung"
  | "unternehmensuebertragung"
  | "gewerbeimmobilie"
  | "anteilsuebertragung"
  | "unternehmensverpachtung"
  | "immobilienvermietung";

export interface Listing {
  id: string;
  user_id: string;
  status: ListingStatus;
  type_of_operation: OperationType;
  category: string;
  city: string;
  region: string;
  country: string;
  title: string;
  description: string;
  asking_price: number | null;
  price_confidential: boolean;
  annual_revenue: number | null;
  ebitda: number | null;
  employees: number | null;
  founded_year: number | null;
  business_model: string | null;
  competition: string | null;
  assets_included: string | null;
  reason_for_sale: string | null;
  company_name: string | null;
  vat_number: string | null;
  phone: string | null;
  show_phone: boolean;
  status_business: BusinessStatus;
  plan: ListingPlan | null;
  plan_expires_at: string | null;
  featured: boolean;
  views_count: number;
  inquiries_count: number;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  id: string;
  listing_id: string;
  sender_email: string;
  sender_name: string;
  message: string;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  listing_id: string;
  stripe_session_id: string;
  plan: ListingPlan;
  amount: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  created_at: string;
}

export interface WizardData {
  // Step 1
  type_of_operation: OperationType | "";
  category: string;
  city: string;
  region: string;
  country: string;
  vat_number: string;
  company_name: string;
  founded_year: string;
  // Step 2
  title: string;
  asking_price: string;
  price_confidential: boolean;
  description: string;
  images: File[];
  phone: string;
  show_phone: boolean;
  reason_for_sale: string;
  status_business: BusinessStatus | "";
  business_model: string;
  competition: string;
  assets_included: string;
  // Step 3 - review only
  // Step 4 - plan selection
  plan: ListingPlan | "";
}

export const CATEGORIES = [
  "Gastronomie",
  "Einzelhandel",
  "Produktion",
  "Dienstleistungen",
  "IT & Tech",
  "Gesundheit",
  "Handwerk",
  "Immobilien",
  "E-Commerce",
  "Bildung",
  "Transport & Logistik",
  "Finanzen & Versicherung",
  "Medien & Marketing",
  "Landwirtschaft",
  "Energie",
];

export const DACH_REGIONS = [
  // Germany
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
  // Austria
  "Wien",
  "Niederösterreich",
  "Oberösterreich",
  "Salzburg (AT)",
  "Tirol",
  "Vorarlberg",
  "Steiermark",
  "Kärnten",
  "Burgenland",
  // Switzerland
  "Zürich (CH)",
  "Bern (CH)",
  "Luzern (CH)",
  "Basel-Stadt (CH)",
  "Genf (CH)",
];
