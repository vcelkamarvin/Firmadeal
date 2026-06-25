"use client";

import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin } from "lucide-react";

interface ListingGridCardProps {
  listing: Listing;
  priority?: boolean;
}

const COUNTRY_FLAG: Record<string, string> = { DE: "🇩🇪", AT: "🇦🇹", CH: "🇨🇭" };

function fmt(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (n >= 1_000)     return `€${Math.round(n / 1_000)}k`;
  return `€${n}`;
}

export default function ListingGridCard({ listing, priority = false }: ListingGridCardProps) {
  const { lang } = useLanguage();

  const margin = listing.ebitda && listing.annual_revenue && listing.annual_revenue > 0
    ? Math.round((listing.ebitda / listing.annual_revenue) * 100)
    : null;

  const daysAgo = listing.created_at
    ? Math.floor((Date.now() - new Date(listing.created_at).getTime()) / 86400000)
    : null;
  const isNew = daysAgo !== null && daysAgo <= 7;

  const marginColor = margin !== null
    ? margin >= 20 ? "text-[var(--green)]" : margin >= 10 ? "text-amber-600" : "text-[var(--muted)]"
    : "";

  const marginBarColor = margin !== null
    ? margin >= 20 ? "bg-[var(--green)]" : margin >= 10 ? "bg-amber-400" : "bg-[var(--neutral-200)]"
    : "";

  const heroSrc = listing.images?.[0] ?? null;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group bg-white border border-[#e8e8e8] rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)] hover:-translate-y-0.5 hover:border-[#c8d8ce] flex flex-col no-underline"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      {/* Photo / placeholder */}
      <div className="relative bg-[var(--neutral-100)]" style={{ height: 200, flexShrink: 0 }}>
        {heroSrc ? (
          <Image
            src={heroSrc}
            alt={`${listing.title} — Firmeninserat auf Firmadeal`}
            fill
            loading={priority ? "eager" : "lazy"}
            priority={priority}
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-end p-3" style={{ background: "linear-gradient(135deg, #1a3329 0%, #2d5a3d 100%)" }}>
            <span className="font-sans text-[13px] font-semibold text-white/80 line-clamp-2 leading-snug">
              {listing.title}
            </span>
          </div>
        )}

        {/* Category pill */}
        <div
          className="absolute bottom-2.5 left-2.5 font-sans text-[11px] font-semibold text-white px-2.5 py-1 rounded-full"
          style={{ background: "rgba(0,0,0,0.52)", backdropFilter: "blur(6px)" }}
        >
          {listing.category}
        </div>

        {/* Example badge — clearly marks seed/demo listings */}
        {listing.is_example && (
          <div className="absolute top-2.5 left-2.5 font-sans text-[10px] font-bold text-white px-2.5 py-0.5 rounded-full" style={{ background: "rgba(20,40,30,0.82)", backdropFilter: "blur(6px)" }}>
            Beispiel
          </div>
        )}

        {/* New badge */}
        {isNew && !listing.is_example && (
          <div className="absolute top-2.5 left-2.5 font-sans text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
            Neu
          </div>
        )}

        {/* Featured badge */}
        {listing.featured && !isNew && (
          <div className="absolute top-2.5 right-2.5 font-sans text-[10px] font-bold bg-amber-400 text-white px-2 py-0.5 rounded-full">
            TOP
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Title */}
        <h3 className="font-sans text-[14px] font-semibold text-[var(--ink)] leading-snug line-clamp-2 mb-2 group-hover:text-[var(--accent)] transition-colors">
          {listing.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-[var(--muted)] mb-3">
          <MapPin size={11} />
          <span className="font-sans text-[12px]">
            {COUNTRY_FLAG[listing.country] ?? ""} {listing.city}
            {listing.region ? ` · ${listing.region}` : ""}
          </span>
          {(listing.views_count ?? 0) > 5 && (
            <span className="font-sans text-[11px] text-[var(--muted)] ml-auto whitespace-nowrap">
              {listing.views_count} ×
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-[#f0f0f0] mb-3" />

        {/* Financial row */}
        <div className="grid grid-cols-3 gap-1 mb-2.5">
          <div>
            <div className="font-sans text-[10px] text-[#aaa] uppercase tracking-wide mb-0.5">Umsatz</div>
            <div className="font-sans text-[13px] font-semibold text-[var(--ink)] tabular-nums">
              {listing.annual_revenue ? fmt(listing.annual_revenue) : "—"}
            </div>
          </div>
          <div className="text-center">
            <div className="font-sans text-[10px] text-[#aaa] uppercase tracking-wide mb-0.5">Marge</div>
            {margin !== null ? (
              <span className={`font-sans text-[13px] font-semibold tabular-nums ${marginColor}`}>
                {margin}%
              </span>
            ) : (
              <span className="font-sans text-[13px] text-[#ccc]">—</span>
            )}
          </div>
          <div className="text-right">
            <div className="font-sans text-[10px] text-[#aaa] uppercase tracking-wide mb-0.5">Preis</div>
            {listing.price_confidential || !listing.asking_price ? (
              <span className="font-sans text-[12px] text-[#999]">Anfrage</span>
            ) : (
              <span className="font-sans text-[13px] font-bold text-[var(--ink)] tabular-nums">
                {fmt(listing.asking_price)}
              </span>
            )}
          </div>
        </div>

        {/* EBITDA margin bar */}
        {margin !== null && (
          <div className="h-[4px] bg-[#f0f0f0] rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all ${marginBarColor}`}
              style={{ width: `${Math.min(100, (margin / 40) * 100)}%` }}
            />
          </div>
        )}

        {/* Footer row */}
        <div className="mt-auto flex items-center justify-between pt-2.5 border-t border-[#f5f5f5]">
          <span className="font-sans text-[12px] text-[var(--muted)]">
            {lang === "de" ? "Details ansehen" : "View details"}
          </span>
          <span className="font-sans text-[13px] font-semibold text-[var(--accent)] group-hover:translate-x-0.5 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
}
