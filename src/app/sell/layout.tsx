import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Firma verkaufen — Kostenlos inserieren",
  description:
    "Inserieren Sie Ihr Unternehmen in 5 Minuten. 7 Tage kostenlos, 0% Provision, anonym bis zum Abschluss.",
  alternates: { canonical: "https://www.firmadeal.de/sell" },
  openGraph: {
    title: "Firma verkaufen — Kostenlos inserieren | Firmadeal.de",
    description: "Inserieren Sie Ihr Unternehmen in 5 Minuten. 7 Tage kostenlos, 0% Provision, anonym bis zum Abschluss.",
    url: "https://www.firmadeal.de/sell",
  },
};

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
