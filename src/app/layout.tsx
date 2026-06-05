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
    default: "Firmadeal.de — Unternehmen verkaufen ohne Makler",
    template: "%s | Firmadeal.de",
  },
  description:
    "Der DACH-Marktplatz für Unternehmensverkäufe. Verkaufen Sie Ihre Firma direkt an Käufer — 0% Provision, anonym, sofort live. 7 Tage kostenlos.",
  keywords: [
    "Firma verkaufen",
    "Unternehmen verkaufen",
    "Unternehmensverkauf ohne Makler",
    "Firma verkaufen Deutschland",
    "Betrieb verkaufen",
    "Nachfolger finden",
    "Unternehmensübertragung",
    "Firma verkaufen Bayern",
    "Unternehmen kaufen Deutschland",
    "Firmadeal",
    "GmbH verkaufen",
    "Mittelstand verkaufen",
    "Unternehmensnachfolge",
    "Betriebsübergabe",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Firmadeal.de — Unternehmen verkaufen ohne Makler | DACH",
    description: "Der führende Marktplatz für den Kauf und Verkauf von Unternehmen im DACH-Raum. 0% Provision, anonym, direkt an Käufer. 7 Tage kostenlos testen.",
    url: "https://www.firmadeal.de",
    siteName: "Firmadeal.de",
    locale: "de_DE",
    type: "website",
    images: [{
      url: "https://www.firmadeal.de/opengraph-image.png",
      width: 1200,
      height: 630,
      alt: "Firmadeal — Unternehmen verkaufen ohne Makler",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Firmadeal.de — Unternehmen verkaufen ohne Makler",
    description: "0% Provision. Anonym. 7 Tage kostenlos.",
    images: ["https://www.firmadeal.de/opengraph-image.png"],
  },
  alternates: { canonical: "https://www.firmadeal.de" },
  verification: {
    google: "ADD_YOUR_GOOGLE_SEARCH_CONSOLE_ID",
  },
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
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Firmadeal.de",
    url: "https://www.firmadeal.de",
    description: "DACH-Marktplatz für Unternehmensverkäufe",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.firmadeal.de/listings?q={search_term}",
      "query-input": "required name=search_term",
    },
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Firmadeal.de",
    url: "https://www.firmadeal.de",
    logo: "https://www.firmadeal.de/logo.png",
    description: "Unternehmensmarktplatz für den DACH-Raum — Unternehmen kaufen und verkaufen ohne Provision.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "info@firmadeal.de",
      contactType: "customer service",
      availableLanguage: "German",
    },
    areaServed: ["DE", "AT", "CH"],
  };

  return (
    <html lang="de">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
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
