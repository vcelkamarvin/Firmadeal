import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preise — Einmalig EUR 87 · Unternehmen inserieren",
  description:
    "Diskreter Unternehmensverkauf mit privatem Investoren-Netzwerk. Einmalig €87, kein Abo, 0% Provision — anonym bis zum Abschluss.",
  alternates: { canonical: "https://www.firmadeal.de/pricing" },
  openGraph: {
    title: "Preise — Einmalig EUR 87 | Firmadeal.de",
    description: "Kein Abo, keine Provision. EUR 87 einmalig für Ihr Unternehmensinserat.",
    url: "https://www.firmadeal.de/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
