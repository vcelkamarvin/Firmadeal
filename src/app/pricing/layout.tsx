import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preise — EUR 39/Monat oder EUR 189/Jahr",
  description:
    "0% Provision. Keine versteckten Kosten. Monatlich kündbar. Inserieren Sie Ihr Unternehmen ab EUR 39/Monat.",
  alternates: { canonical: "https://www.firmadeal.de/pricing" },
  openGraph: {
    title: "Preise — EUR 39/Monat oder EUR 189/Jahr | Firmadeal.de",
    description: "0% Provision. Keine versteckten Kosten. Monatlich kündbar.",
    url: "https://www.firmadeal.de/pricing",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
