import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import ClarityScript from "@/components/ClarityScript";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Firmadeal.de – Unternehmen kaufen & verkaufen im DACH-Raum",
    template: "%s | Firmadeal",
  },
  description:
    "Der direkte Marktplatz für Unternehmensverkäufe in Deutschland, Österreich und der Schweiz. 60+ Inserate. 0% Provision. Direkt vom Eigentümer. Jetzt 7 Tage kostenlos inserieren.",
  keywords: [
    "Unternehmensverkauf",
    "Firmenkauf",
    "Unternehmen kaufen",
    "Unternehmen verkaufen",
    "Firma kaufen",
    "Firma verkaufen",
    "Unternehmensmarktplatz",
    "Unternehmensnachfolge",
    "Betriebsübergabe",
    "DACH",
    "Deutschland",
    "Österreich",
    "Schweiz",
    "Nachfolge",
    "Unternehmenstransaktion",
    "Firmenverkauf",
    "GmbH verkaufen",
    "Mittelstand verkaufen",
  ],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    title: "Firmadeal.de – Unternehmen kaufen & verkaufen in Deutschland",
    description:
      "60+ Inserate. 0% Provision. Direkt vom Eigentümer.",
    locale: "de_DE",
    type:   "website",
    url:    "https://www.firmadeal.de",
  },
  alternates: { canonical: "https://www.firmadeal.de" },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Firmadeal.de",
    url: "https://www.firmadeal.de",
    description: "Unternehmensmarktplatz für den DACH-Raum — Unternehmen kaufen und verkaufen ohne Provision.",
    areaServed: ["DE", "AT", "CH"],
  };

  return (
    <html lang="de">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
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
