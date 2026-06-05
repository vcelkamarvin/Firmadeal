import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unternehmen kaufen in Deutschland",
  description:
    "Entdecken Sie verfügbare Unternehmen zum Kauf in Deutschland, Österreich und der Schweiz. Direkt vom Eigentümer, ohne Makler.",
  alternates: { canonical: "https://www.firmadeal.de/listings" },
  openGraph: {
    title: "Unternehmen kaufen in Deutschland | Firmadeal.de",
    description: "Entdecken Sie verfügbare Unternehmen zum Kauf. Direkt vom Eigentümer, ohne Makler.",
    url: "https://www.firmadeal.de/listings",
  },
};

export default function ListingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
