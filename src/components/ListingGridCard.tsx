"use client";

import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin } from "lucide-react";

interface ListingGridCardProps {
  listing: Listing;
}

const COUNTRY_FLAG: Record<string, string> = { DE: "🇩🇪", AT: "🇦🇹", CH: "🇨🇭" };

function fmt(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (n >= 1_000)     return `€${Math.round(n / 1_000)}k`;
  return `€${n}`;
}

export default function ListingGridCard({ listing }: ListingGridCardProps) {
  const { lang } = useLanguage();

  const margin = listing.ebitda && listing.annual_revenue && listing.annual_revenue > 0
    ? Math.round((listing.ebitda / listing.annual_revenue) * 100)
    : null;

  const marginColor = margin !== null
    ? margin >= 20 ? "text-[var(--green)]" : margin >= 10 ? "text-amber-600" : "text-[var(--muted)]"
    : "";

  const marginBarColor = margin !== null
    ? margin >= 20 ? "bg-[var(--green)]" : margin >= 10 ? "bg-amber-400" : "bg-[var(--muted)]"
    : "";

  // Placeholder image if no photos
  const heroSrc = listing.images?.[0]
    ?? `https://picsum.photos/seed/${listing.id.slice(0, 8)}/800/600`;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="bg-white border border-[#e8e8e8] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 flex flex-col no-underline"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      {/* Photo */}
      <div className="relative" style={{ height: 220, flexShrink: 0 }}>
        <Image
          src={heroSrc}
          alt={listing.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />

        {/* Category pill — bottom left */}
        <div
          className="absolute bottom-2.5 left-2.5 font-sans text-[11px] font-semibold text-white px-2.5 py-1 rounded-full"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
        >
          {listing.category}
        </div>

        {/* Featured badge — top right */}
        {listing.featured && (
          <div className="absolute top-2.5 right-2.5 font-sans text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded">
            TOP
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-sans text-[15px] font-semibold text-[var(--ink)] leading-snug line-clamp-2 mb-1.5">
          {listing.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-[var(--muted)] mb-3">
          <MapPin size={11} />
          <span className="font-sans text-[12px]">{COUNTRY_FLAG[listing.country] ?? ""} {listing.city} · {listing.category}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-[#f0f0f0] mb-3" />

        {/* Financial row */}
        <div className="grid grid-cols-3 gap-1 mb-2.5">
          {/* Umsatz */}
          <div>
            <div className="font-sans text-[10px] text-[#999] uppercase tracking-wide mb-0.5">Umsatz</div>
            <div className="font-sans text-[14px] font-semibold text-[var(--ink)] tabular-nums">
              {listing.annual_revenue ? fmt(listing.annual_revenue) : "—"}
            </div>
          </div>
          {/* Marge */}
          <div className="text-center">
            <div className="font-sans text-[10px] text-[#999] uppercase tracking-wide mb-0.5">Marge</div>
            {margin !== null ? (
              <span className={`font-sans text-[14px] font-semibold tabular-nums ${marginColor}`}>
                {margin}%
              </span>
            ) : (
              <span className="font-sans text-[14px] text-[#999]">—</span>
            )}
          </div>
          {/* Preis */}
          <div className="text-right">
            <div className="font-sans text-[10px] text-[#999] uppercase tracking-wide mb-0.5">Preis</div>
            {listing.price_confidential || !listing.asking_price ? (
              <span className="font-sans text-[13px] text-[#666] italic">Auf Anfrage</span>
            ) : (
              <span className="font-sans text-[14px] font-bold text-[var(--ink)] tabular-nums">
                {fmt(listing.asking_price)}
              </span>
            )}
          </div>
        </div>

        {/* EBITDA margin bar */}
        {margin !== null && (
          <div className="h-[5px] bg-[#f0f0f0] rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full ${marginBarColor}`}
              style={{ width: `${Math.min(100, (margin / 40) * 100)}%` }}
            />
          </div>
        )}

        {/* CTA button */}
        <div
          className="mt-auto w-full h-10 border border-[var(--green-700)] text-[var(--green-700)] font-sans text-[14px] font-medium rounded-lg hover:bg-[var(--green-700)] hover:text-white transition-all duration-150 flex items-center justify-center"
        >
          {lang === "de" ? "Details ansehen →" : "View details →"}
        </div>
      </div>
    </Link>
  );
}
