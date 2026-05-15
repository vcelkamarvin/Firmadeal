import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Firmadeal – Der DACH-Marktplatz für Unternehmensverkäufe",
    template: "%s | Firmadeal",
  },
  description:
    "Kaufen und verkaufen Sie Unternehmen in Deutschland, Österreich und der Schweiz. Keine Provision. Transparente Inserate. Direkte Kommunikation.",
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
    title: "Firmadeal – Der DACH-Marktplatz für Unternehmensverkäufe",
    description:
      "Kaufen und verkaufen Sie Unternehmen in Deutschland, Österreich und der Schweiz. Keine Provision.",
    locale: "de_DE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <LanguageProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
