import type { Metadata } from "next";
import Rechner from "./Rechner";

export const metadata: Metadata = {
  title: "Unternehmenswert berechnen — kostenlos & anonym | Firmadeal",
  description:
    "Was ist Ihr Unternehmen wert? Kostenlose Sofort-Bewertung nach Branche und Region (DACH). Indikativer Unternehmenswert in Sekunden — anonym, ohne Makler, 0% Provision.",
  alternates: { canonical: "https://www.firmadeal.de/unternehmenswert" },
  openGraph: {
    title: "Unternehmenswert berechnen — kostenlos & anonym | Firmadeal",
    description:
      "Kostenlose Sofort-Bewertung nach Branche und Region. Indikativer Unternehmenswert in Sekunden — anonym, ohne Makler.",
    url: "https://www.firmadeal.de/unternehmenswert",
    type: "website",
  },
};

export default function UnternehmenswertPage() {
  return <Rechner />;
}
