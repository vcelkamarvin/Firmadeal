import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unternehmen vertraulich einreichen — Einmalig €87",
  description:
    "Vertrauliche Einreichung in 5 Minuten. Einmalig €87, 0% Provision, anonym bis zum Abschluss. Wir bringen Ihr Unternehmen vor geprüfte Investoren.",
  alternates: { canonical: "https://www.firmadeal.de/sell" },
  openGraph: {
    title: "Unternehmen vertraulich einreichen | Firmadeal.de",
    description: "Vertrauliche Einreichung in 5 Minuten. Einmalig €87, 0% Provision, anonym bis zum Abschluss.",
    url: "https://www.firmadeal.de/sell",
  },
};

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
