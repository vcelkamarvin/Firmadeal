import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Ratgeber für Unternehmenskauf & -verkauf",
  description:
    "Experten-Tipps zu Unternehmensverkauf, Unternehmensnachfolge und Firmenkauf. Fundiertes Wissen für Käufer und Verkäufer in Deutschland.",
  alternates: { canonical: "https://www.firmadeal.de/blog" },
  openGraph: {
    title: "Blog — Ratgeber Unternehmensverkauf | Firmadeal.de",
    description: "Experten-Tipps zu Unternehmensverkauf, Nachfolge und Firmenkauf.",
    url: "https://www.firmadeal.de/blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
