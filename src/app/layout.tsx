import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import ClarityScript from "@/components/ClarityScript";

export const metadata: Metadata = {
  title: {
    default: "Firmadeal.de – Unternehmen kaufen & verkaufen im DACH-Raum",
    template: "%s | Firmadeal",
  },
  description:
    "Der direkte Marktplatz für Unternehmensverkäufe in Deutschland, Österreich und der Schweiz. 0% Provision. Über 50 Inserate. Direkt vom Eigentümer.",
  keywords: [
    "Unternehmensverkauf",
    "Firmenkauf",
    "Unternehmen kaufen",
    "Unternehmen verkaufen",
    "DACH",
    "Deutschland",
    "Österreich",
    "Schweiz",
    "Nachfolge",
    "Unternehmenstransaktion",
  ],
  openGraph: {
    title: "Firmadeal.de – Unternehmen kaufen & verkaufen im DACH-Raum",
    description:
      "Der direkte Marktplatz für Unternehmensverkäufe in Deutschland, Österreich und der Schweiz. 0% Provision. Über 50 Inserate. Direkt vom Eigentümer.",
    locale: "de_DE",
    type:   "website",
    url:    "https://www.firmadeal.de",
  },
  alternates: { canonical: "https://www.firmadeal.de" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen flex flex-col">
        <LanguageProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
          <ClarityScript />
        </LanguageProvider>
      </body>
    </html>
  );
}
