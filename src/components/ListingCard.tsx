"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, TrendingUp, Calendar, MessageSquare } from "lucide-react";
import { Listing } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

interface ListingCardProps {
  listing: Listing;
  featured?: boolean;
}

function fmt(price: number): string {
  if (price >= 1_000_000) return `€${(price / 1_000_000).toFixed(1).replace(".", ",")} Mio.`;
  if (price >= 1_000)     return `€${(price / 1_000).toFixed(0)}k`;
  return `€${price}`;
}

function multiple(price: number | null, revenue: number | null): string | null {
  if (!price || !revenue || revenue === 0) return null;
  const m = price / revenue;
  return `${m.toFixed(1)}x`;
}

function daysAgo(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

const STATUS_CONFIG = {
  active_profitable: { de: "Aktiv & Profitabel",  en: "Profitable",        dot: "bg-[var(--green)]" },
  in_development:    { de: "In Entwicklung",       en: "In Development",    dot: "bg-amber-400" },
  restructuring:     { de: "Sanierungsbedarf",     en: "Restructuring",     dot: "bg-[var(--red)]" },
} as const;

export default function ListingCard({ listing, featured = false }: ListingCardProps) {
  const { lang, t } = useLanguage();
  const rev_multiple = multiple(listing.asking_price, listing.annual_revenue);
  const days = daysAgo(listing.created_at);
  const status = STATUS_CONFIG[listing.status_business];

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <article className="bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:border-[var(--accent)] hover:shadow-[0_4px_24px_rgba(28,63,94,0.08)] transition-all duration-200 h-full flex flex-col">

        {/* Image */}
        <div className="relative w-full h-[180px] bg-[var(--surface2)] flex-shrink-0 overflow-hidden">
          {listing.images?.[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <TrendingUp size={32} className="text-[var(--border)]" />
            </div>
          )}
          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="font-mono text-[10px] bg-white/95 text-[var(--accent)] rounded-full px-2 py-0.5 border border-[var(--border)] uppercase tracking-wide">
              {listing.category}
            </span>
            {listing.featured && (
              <span className="font-mono text-[10px] bg-amber-500 text-white rounded-full px-2 py-0.5">
                Featured
              </span>
            )}
          </div>
          {/* Days on market */}
          <div className="absolute top-3 right-3">
            <span className="font-mono text-[10px] bg-white/90 text-[var(--muted)] rounded-full px-2 py-0.5">
              {days}d
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">

          {/* Status row */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
            <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wide">
              {lang === "de" ? status.de : status.en}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-sans text-[15px] font-semibold text-[var(--ink)] line-clamp-2 leading-snug mb-2 group-hover:text-[var(--accent)] transition-colors">
            {listing.title}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 font-mono text-[11px] text-[var(--muted)] mb-4">
            <MapPin size={11} className="flex-shrink-0" />
            <span>{listing.city}, {listing.country === "DE" ? "Deutschland" : listing.country === "AT" ? "Österreich" : "Schweiz"}</span>
          </div>

          {/* Price + multiple */}
          <div className="flex items-baseline gap-2 mb-3">
            {listing.price_confidential || !listing.asking_price ? (
              <span className="font-fraunces text-[20px] text-[var(--muted)]">Auf Anfrage</span>
            ) : (
              <>
                <span className="font-fraunces text-[22px] text-[var(--ink)]">
                  {fmt(listing.asking_price)}
                </span>
                {rev_multiple && (
                  <span className="font-mono text-[11px] text-[var(--muted)] bg-[var(--surface2)] px-1.5 py-0.5 rounded">
                    {rev_multiple} Umsatz
                  </span>
                )}
              </>
            )}
          </div>

          {/* Key metrics grid */}
          <div className="grid grid-cols-3 gap-2 border-t border-[var(--border)] pt-3 mb-4">
            {listing.annual_revenue && (
              <div>
                <div className="font-mono text-[13px] text-[var(--ink)] font-medium">
                  {fmt(listing.annual_revenue)}
                </div>
                <div className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-wide mt-0.5">
                  Umsatz/J.
                </div>
              </div>
            )}
            {listing.employees && (
              <div>
                <div className="font-mono text-[13px] text-[var(--ink)] font-medium">
                  {listing.employees}
                </div>
                <div className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-wide mt-0.5">
                  Mitarb.
                </div>
              </div>
            )}
            {listing.founded_year && (
              <div>
                <div className="font-mono text-[13px] text-[var(--ink)] font-medium">
                  {listing.founded_year}
                </div>
                <div className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-wide mt-0.5">
                  Gegründet
                </div>
              </div>
            )}
          </div>

          {/* Interest indicator + CTA */}
          <div className="mt-auto flex items-center justify-between">
            {listing.inquiries_count > 0 && (
              <div className="flex items-center gap-1 font-mono text-[10px] text-[var(--muted)]">
                <MessageSquare size={10} />
                <span>{listing.inquiries_count} {lang === "de" ? "Anfragen" : "inquiries"}</span>
              </div>
            )}
            <button className="ml-auto text-[13px] font-sans font-medium text-[var(--accent)] group-hover:underline transition-all">
              {lang === "de" ? "Details ansehen →" : "View details →"}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
