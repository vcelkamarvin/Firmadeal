import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import ClarityScript from "@/components/ClarityScript";
import GA4Script from "@/components/GA4Script";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Firmadeal.de — Unternehmensnachfolge: den richtigen Nachfolger finden",
    template: "%s | Firmadeal.de",
  },
  description:
    "Übergeben Sie Ihr Lebenswerk in die richtigen Hände. Firmadeal hilft Ihnen diskret, den passenden Nachfolger zu finden — aus einem Netzwerk geprüfter Käufer. Nachfolgern helfen wir beim Zugang zu Übernahmefinanzierung. Ohne Makler, 0 % Provision, €87 einmalig.",
  keywords: [
    "Unternehmensnachfolge",
    "Nachfolger finden",
    "Nachfolge Unternehmen",
    "Betriebsübergabe",
    "Unternehmen übergeben",
    "Unternehmen übernehmen",
    "Nachfolge ohne Makler",
    "Übernahmefinanzierung",
    "Firma verkaufen",
    "Unternehmen verkaufen",
    "Unternehmensverkauf ohne Makler",
    "GmbH verkaufen",
    "Mittelstand Nachfolge",
    "Firmadeal",
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
    title: "Firmadeal.de — Unternehmensnachfolge: den richtigen Nachfolger finden",
    description: "Ihr Lebenswerk in die richtigen Hände: diskret den passenden Nachfolger finden — Netzwerk geprüfter Käufer, Finanzierungshilfe für Nachfolger. Ohne Makler, 0 % Provision.",
    url: "https://www.firmadeal.de",
    siteName: "Firmadeal.de",
    locale: "de_DE",
    type: "website",
    images: [{
      url: "https://www.firmadeal.de/opengraph-image.png",
      width: 1200,
      height: 630,
      alt: "Firmadeal — Unternehmensnachfolge, den richtigen Nachfolger finden",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Firmadeal.de — Unternehmensnachfolge: den richtigen Nachfolger finden",
    description: "Ihr Lebenswerk in die richtigen Hände. Diskret den passenden Nachfolger finden — ohne Makler, 0 % Provision.",
    images: ["https://www.firmadeal.de/opengraph-image.png"],
  },
  alternates: {
    canonical: "https://www.firmadeal.de",
    languages: {
      "de-DE": "https://www.firmadeal.de",
      "de-AT": "https://www.firmadeal.de",
      "de-CH": "https://www.firmadeal.de",
      "x-default": "https://www.firmadeal.de",
    },
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
    description: "Marktplatz für Unternehmensnachfolge in Deutschland, Österreich und der Schweiz",
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
    description: "Marktplatz für Unternehmensnachfolge in DACH — Nachfolger finden, Unternehmen übergeben und übernehmen, ohne Provision.",
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
        {/* GA4 Consent Mode v2 defaults — must run before gtag.js loads */}
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'wait_for_update': 500
          });
        `}} />
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
          <GA4Script />
        </LanguageProvider>
      </body>
    </html>
  );
}
