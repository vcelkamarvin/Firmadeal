"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { Listing } from "@/lib/types";
import { CATEGORY_ICONS } from "@/lib/mockData";
import { useLanguage } from "@/context/LanguageContext";

interface ListingCardProps {
  listing: Listing;
}

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `€${(price / 1000000).toFixed(1).replace(".", ",")} Mio.`;
  }
  return `€${price.toLocaleString("de-DE")}`;
}

function statusLabel(status: string, lang: string): string {
  const labels: Record<string, Record<string, string>> = {
    active_profitable: { de: "Aktiv & Profitabel", en: "Active & Profitable" },
    in_development: { de: "In Entwicklung", en: "In development" },
    restructuring: { de: "Sanierungsbedarf", en: "Needs restructuring" },
  };
  return labels[status]?.[lang] ?? status;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const { lang, t } = useLanguage();
  const icon = CATEGORY_ICONS[listing.category] ?? "🏢";

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <div className="bg-white border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)] hover:shadow-[0_4px_20px_rgba(28,63,94,0.08)] transition-all duration-200 h-full flex flex-col">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-[10px] bg-[var(--accent-light)] text-[var(--accent)] rounded-full px-2 py-1 uppercase tracking-wide">
            {listing.category}
          </span>
          {listing.featured && (
            <span className="font-mono text-[10px] bg-amber-50 text-amber-700 rounded-full px-2 py-1">
              {t("listings.featured_badge")}
            </span>
          )}
        </div>

        {/* Image */}
        <div className="relative w-full h-[180px] rounded-lg overflow-hidden bg-[var(--surface2)] mb-3 flex-shrink-0">
          {listing.images && listing.images.length > 0 ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-5xl">
              {icon}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1">
          <h3 className="font-sans text-[15px] font-semibold text-[var(--ink)] line-clamp-2 leading-snug mb-1">
            {listing.title}
          </h3>

          <div className="flex items-center gap-1 font-mono text-[11px] text-[var(--muted)] mb-3">
            <MapPin size={11} />
            <span>
              {listing.city}, {listing.country}
            </span>
          </div>

          {/* Price */}
          <div className="mb-3">
            {listing.price_confidential || !listing.asking_price ? (
              <span className="font-fraunces text-[20px] text-[var(--muted)]">
                {t("listings.on_request")}
              </span>
            ) : (
              <span className="font-fraunces text-[22px] text-[var(--ink)]">
                {formatPrice(listing.asking_price)}
              </span>
            )}
          </div>

          <div className="border-t border-[var(--border)] my-0" />

          {/* Stats */}
          <div className="flex items-center gap-4 font-mono text-[11px] text-[var(--muted)] mt-3 mb-4">
            <span>{listing.category}</span>
            {listing.founded_year && (
              <>
                <span>·</span>
                <span>Gegr. {listing.founded_year}</span>
              </>
            )}
            <span>·</span>
            <span>{statusLabel(listing.status_business, lang)}</span>
          </div>

          {/* CTA */}
          <button className="mt-auto w-full border border-[var(--border)] rounded-lg py-2.5 text-sm font-sans text-[var(--ink)] group-hover:bg-[var(--accent-light)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-all duration-200">
            {t("listings.contact")}
          </button>
        </div>
      </div>
    </Link>
  );
}
