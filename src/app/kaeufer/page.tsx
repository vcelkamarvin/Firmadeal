import type { Metadata } from "next";
import KaeuferForm from "./KaeuferForm";

export const metadata: Metadata = {
  title: "Käufer-Netzwerk — Unternehmen kaufen im DACH-Raum | Firmadeal",
  description:
    "Erhalten Sie passende Unternehmen zuerst: Werden Sie Teil des privaten Käufer-Netzwerks von Firmadeal. Off-market Zugang, nach Branche, Region und Ticketgröße — kostenlos & diskret.",
  alternates: { canonical: "https://www.firmadeal.de/kaeufer" },
  openGraph: {
    title: "Käufer-Netzwerk — Unternehmen kaufen im DACH-Raum | Firmadeal",
    description:
      "Passende Unternehmen zuerst erhalten — off-market, nach Branche, Region und Ticketgröße. Kostenlos für Käufer.",
    url: "https://www.firmadeal.de/kaeufer",
    type: "website",
  },
};

export default function KaeuferPage() {
  return <KaeuferForm />;
}
