import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import ListingDetailClient from "./ListingDetailClient";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function fmt(n: number) {
  return new Intl.NumberFormat("de-DE").format(n);
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;
  const { data: l } = await db()
    .from("listings")
    .select("title, category, city, annual_revenue, asking_price, description, images")
    .eq("id", id)
    .single();

  if (!l) return { title: "Inserat nicht gefunden | Firmadeal" };

  const parts = [
    `${l.category} in ${l.city} kaufen.`,
    l.annual_revenue ? `Jahresumsatz: €${fmt(l.annual_revenue)}.` : null,
    l.asking_price   ? `Kaufpreis: €${fmt(l.asking_price)}.`     : null,
    "Direkt vom Eigentümer, 0% Provision.",
  ].filter(Boolean).join(" ");

  const ogImage = l.images?.[0] ?? "https://www.firmadeal.de/og-default.png";

  return {
    title: l.title,
    description: parts,
    openGraph: {
      title:       l.title,
      description: parts,
      images:      [{ url: ogImage, width: 1200, height: 630, alt: l.title }],
      type:        "website",
      url:         `https://www.firmadeal.de/listings/${id}`,
    },
    alternates: { canonical: `https://www.firmadeal.de/listings/${id}` },
  };
}

export default async function ListingDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data: l } = await db()
    .from("listings")
    .select("title, description, asking_price, category, city")
    .eq("id", id)
    .single();

  const jsonLd = l
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: l.title,
        description: l.description ?? undefined,
        category: l.category,
        offers: l.asking_price
          ? {
              "@type": "Offer",
              price: l.asking_price,
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
              areaServed: l.city,
            }
          : undefined,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ErrorBoundary>
        <ListingDetailClient />
      </ErrorBoundary>
    </>
  );
}
