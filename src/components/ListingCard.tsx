"use client";

import Image from "next/image";
import Link from "next/link";
import { Listing } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";

interface ListingCardProps {
  listing: Listing;
  /** @deprecated — kept for backward compat but navigation now goes to /listings/[id] */
  onOpenModal?: (listing: Listing) => void;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (n >= 1_000)     return `€${Math.round(n / 1_000)}k`;
  return `€${n}`;
}

const COUNTRY_FLAG: Record<string, string> = { DE: "🇩🇪", AT: "🇦🇹", CH: "🇨🇭" };

const STATUS_DOT: Record<string, string> = {
  active_profitable: "bg-[var(--green)]",
  in_development:    "bg-amber-400",
  restructuring:     "bg-[var(--red)]",
};

const STATUS_LABEL: Record<string, { de: string; en: string }> = {
  active_profitable: { de: "Profitabel",       en: "Profitable"     },
  in_development:    { de: "In Entwicklung",    en: "In Development" },
  restructuring:     { de: "Restrukturierung",  en: "Restructuring"  },
};

export default function ListingCard({ listing }: ListingCardProps) {
  const { lang } = useLanguage();

  const margin = listing.ebitda && listing.annual_revenue && listing.annual_revenue > 0
    ? Math.round((listing.ebitda / listing.annual_revenue) * 100)
    : null;

  const statusLabel = STATUS_LABEL[listing.status_business]?.[lang] ?? listing.status_business;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="relative flex items-center gap-4 px-5 py-4 border-b border-[var(--border)] cursor-pointer transition-all group hover:bg-[var(--accent-light)]"
      style={{ minHeight: 88, textDecoration: "none", color: "inherit", display: "flex" }}
    >
      {/* Left hover accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[var(--green-700)] opacity-0 group-hover:opacity-100 transition-opacity rounded-r-sm" />

      {/* Thumbnail */}
      <div className="w-14 h-14 rounded-lg bg-[var(--surface2)] flex-shrink-0 overflow-hidden border border-[var(--border)]">
        {listing.images?.[0] ? (
          <Image
            src={listing.images[0]}
            alt={`${listing.title} — Firmeninserat auf Firmadeal`}
            width={56}
            height={56}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-sans text-[18px] font-bold text-[var(--muted)] select-none">
              {(listing.title?.[0] ?? "?").toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[listing.status_business] ?? "bg-gray-300"}`} />
          <span className="font-sans text-[14px] font-semibold text-[var(--ink)] truncate group-hover:text-[var(--accent)] transition-colors leading-tight">
            {listing.title}
          </span>
          {listing.featured && (
            <span className="flex-shrink-0 font-sans text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">
              Top
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 font-sans text-[11px] text-[var(--muted)]">
          <span>{COUNTRY_FLAG[listing.country] ?? ""} {listing.city}</span>
          <span className="text-[var(--border)]">·</span>
          <span>{listing.category}</span>
          <span className="text-[var(--border)]">·</span>
          <span>{statusLabel}</span>
        </div>
      </div>

      {/* Revenue */}
      <div className="hidden sm:flex flex-col items-end w-[90px] flex-shrink-0">
        {listing.annual_revenue ? (
          <>
            <span className="font-sans text-[13px] font-semibold text-[var(--ink)] tabular-nums">{fmt(listing.annual_revenue)}</span>
            <span className="font-sans text-[10px] text-[var(--muted)] mt-0.5">{lang === "de" ? "Umsatz" : "Revenue"}</span>
          </>
        ) : (
          <span className="font-sans text-[11px] text-[var(--muted)]">—</span>
        )}
      </div>

      {/* EBITDA margin + mini bar */}
      <div className="hidden md:block w-[96px] flex-shrink-0">
        {margin !== null ? (
          <>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-sans text-[10px] text-[var(--muted)] uppercase tracking-wide">EBITDA</span>
              <span className={`font-sans text-[11px] font-bold tabular-nums ${margin >= 20 ? "text-[var(--green)]" : margin >= 10 ? "text-amber-600" : "text-[var(--muted)]"}`}>
                {margin}%
              </span>
            </div>
            <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${margin >= 20 ? "bg-[var(--green)]" : margin >= 10 ? "bg-amber-400" : "bg-[var(--muted)]"}`}
                style={{ width: `${Math.min(100, margin * 2)}%` }}
              />
            </div>
          </>
        ) : (
          <span className="font-sans text-[11px] text-[var(--muted)]">—</span>
        )}
      </div>

      {/* Asking price */}
      <div className="flex flex-col items-end w-[100px] flex-shrink-0">
        {listing.price_confidential || !listing.asking_price ? (
          <span className="font-sans text-[11px] text-[var(--muted)] italic">
            {lang === "de" ? "Auf Anfrage" : "On request"}
          </span>
        ) : (
          <>
            <span className="font-sans text-[14px] font-bold text-[var(--ink)] tabular-nums">{fmt(listing.asking_price)}</span>
            {listing.annual_revenue && (
              <span className="font-sans text-[10px] text-[var(--muted)] tabular-nums mt-0.5">
                {(listing.asking_price / listing.annual_revenue).toFixed(1)}× Umsatz
              </span>
            )}
          </>
        )}
      </div>

      {/* Arrow */}
      <div className="flex-shrink-0 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors ml-1">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </Link>
  );
}
