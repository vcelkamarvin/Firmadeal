"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, MapPin, Eye, MessageSquare, Send, Phone, CheckCircle, DollarSign } from "lucide-react";
import { Listing } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import ListingFinancials, { buildFinancialRows } from "./ListingFinancials";
import { MOCK_LISTINGS } from "@/lib/mockData";

interface ListingModalProps {
  listing: Listing | null;
  onClose: () => void;
}

function fmt(price: number): string {
  if (price >= 1_000_000) return `€${(price / 1_000_000).toFixed(2).replace(".", ",")}M`;
  if (price >= 1_000) return `€${(price / 1_000).toFixed(0)}k`;
  return `€${price}`;
}

function fmtFull(price: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price);
}

const COUNTRY_LABEL: Record<string, string> = {
  DE: "Deutschland",
  AT: "Österreich",
  CH: "Schweiz",
};

const OP_LABEL: Record<string, string> = {
  vollstaendige_uebertragung: "Vollverkauf",
  unternehmensuebertragung: "Verkauf ohne Immobilien",
  gewerbeimmobilie: "Immobilie verkaufen",
  anteilsuebertragung: "Teilverkauf / Investor gesucht",
  unternehmensverpachtung: "Betrieb verpachten",
  immobilienvermietung: "Gewerbefläche vermieten",
};

const INDUSTRY_MULTIPLES: Record<string, { lo: number; avg: number; hi: number }> = {
  "Gastronomie":      { lo: 2.5, avg: 3.2, hi: 4.5 },
  "IT & Tech":        { lo: 4.0, avg: 5.8, hi: 8.0 },
  "E-Commerce":       { lo: 2.0, avg: 3.5, hi: 5.0 },
  "Produktion":       { lo: 3.0, avg: 4.2, hi: 5.5 },
  "Gesundheit":       { lo: 3.5, avg: 4.8, hi: 6.5 },
  "Handwerk":         { lo: 2.0, avg: 2.8, hi: 4.0 },
  "Dienstleistungen": { lo: 2.0, avg: 3.2, hi: 4.5 },
  "Immobilien":       { lo: 3.0, avg: 4.5, hi: 6.5 },
};

const AVG_SALE_DAYS: Record<string, number> = {
  "Bayern":             87,
  "NRW":               112,
  "Baden-Württemberg":  94,
  "Hessen":            102,
  "Berlin":             78,
  "Hamburg":            83,
  "Österreich":         95,
  "Schweiz":           145,
};

const MAX_SALE_DAYS = Math.max(...Object.values(AVG_SALE_DAYS));

const PRICE_BUCKETS = [
  { label: "<€200k",    min: 0,           max: 200_000   },
  { label: "€200–500k", min: 200_000,     max: 500_000   },
  { label: "€500k–1M",  min: 500_000,     max: 1_000_000 },
  { label: "€1–3M",     min: 1_000_000,   max: 3_000_000 },
  { label: ">€3M",      min: 3_000_000,   max: Infinity  },
];

export default function ListingModal({ listing, onClose }: ListingModalProps) {
  const { lang } = useLanguage();

  // Contact form state
  const [cName,    setCName]    = useState("");
  const [cEmail,   setCEmail]   = useState("");
  const [cPhone,   setCPhone]   = useState("");
  const [cMessage, setCMessage] = useState("");
  const [cLoading, setCLoading] = useState(false);
  const [cSent,    setCSent]    = useState(false);
  const [cError,   setCError]   = useState("");
  const [phoneRevealed, setPhoneRevealed] = useState(false);

  // Offer form state
  const [offerOpen,    setOfferOpen]    = useState(false);
  const [offerAmount,  setOfferAmount]  = useState("");
  const [offerName,    setOfferName]    = useState("");
  const [offerEmail,   setOfferEmail]   = useState("");
  const [offerNote,    setOfferNote]    = useState("");
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerSent,    setOfferSent]    = useState(false);
  const [offerError,   setOfferError]   = useState("");

  useEffect(() => {
    if (listing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [listing]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!listing) return null;

  const revenueMultiple = listing.asking_price && listing.annual_revenue
    ? listing.asking_price / listing.annual_revenue
    : null;

  const ebitdaMultiple = listing.asking_price && listing.ebitda
    ? listing.asking_price / listing.ebitda
    : null;

  const industryMultiple = INDUSTRY_MULTIPLES[listing.category] ?? { lo: 2.0, avg: 3.5, hi: 6.0 };

  const catListings = MOCK_LISTINGS.filter(
    (l) => l.category === listing.category && l.asking_price && !l.price_confidential
  );
  const priceBuckets = PRICE_BUCKETS.map((b) => ({
    ...b,
    count: catListings.filter((l) => l.asking_price! >= b.min && l.asking_price! < b.max).length,
    isThis: listing.asking_price
      ? listing.asking_price >= b.min && listing.asking_price < b.max
      : false,
  }));
  const maxBucketCount = Math.max(1, ...priceBuckets.map((b) => b.count));

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setCLoading(true);
    setCError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id:   listing.id,
          sender_name:  cName,
          sender_email: cEmail,
          sender_phone: cPhone || null,
          message:      cMessage,
          inquiry_type: "inquiry",
        }),
      });
      if (!res.ok) throw new Error("server error");
      setCSent(true);
    } catch {
      setCError(lang === "de" ? "Fehler beim Senden. Bitte erneut versuchen." : "Error sending. Please try again.");
    } finally {
      setCLoading(false);
    }
  };

  const handleOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOfferLoading(true);
    setOfferError("");
    const amountNum = parseInt(offerAmount.replace(/\D/g, ""), 10);
    if (!amountNum || amountNum <= 0) {
      setOfferError(lang === "de" ? "Bitte gültigen Betrag eingeben." : "Please enter a valid amount.");
      setOfferLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id:   listing.id,
          sender_name:  offerName,
          sender_email: offerEmail,
          message:      offerNote || `Angebot: ${fmtFull(amountNum)}`,
          inquiry_type: "offer",
          offer_amount: amountNum,
        }),
      });
      if (!res.ok) throw new Error("server error");
      setOfferSent(true);
    } catch {
      setOfferError(lang === "de" ? "Fehler beim Senden. Bitte erneut versuchen." : "Error sending. Please try again.");
    } finally {
      setOfferLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1000] bg-black/70"
        style={{ backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Scroll wrapper */}
      <div
        className="fixed inset-0 z-[1001] overflow-y-auto"
        style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 16px 48px" }}
      >
        <div
          className="w-full bg-[var(--surface2)] rounded-2xl overflow-hidden relative my-4"
          style={{ maxWidth: "1140px", boxShadow: "0 32px 100px rgba(0,0,0,0.3)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="px-6 md:px-8 py-5 bg-white border-b border-[var(--border)] flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] bg-[var(--accent-light)] px-2 py-0.5 rounded-full">
                  {listing.category}
                </span>
                {listing.featured && (
                  <span className="font-sans text-[10px] font-bold bg-amber-500 text-white rounded-full px-2 py-0.5">
                    Featured
                  </span>
                )}
                <span className="font-sans text-[11px] text-[var(--muted)] flex items-center gap-1">
                  <Eye size={11} /> {listing.views_count ?? 0}
                </span>
                <span className="font-sans text-[11px] text-[var(--muted)] flex items-center gap-1">
                  <MessageSquare size={11} /> {listing.inquiries_count ?? 0}
                </span>
              </div>
              <h2 className="font-sans text-[20px] md:text-[23px] font-bold text-[var(--ink)] leading-snug tracking-tight">
                {listing.title}
              </h2>
              <div className="flex items-center gap-1 mt-1">
                <MapPin size={11} className="text-[var(--muted)]" />
                <span className="font-sans text-[12px] text-[var(--muted)]">
                  {listing.city}, {COUNTRY_LABEL[listing.country] ?? listing.country}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 rounded-lg hover:bg-[var(--surface2)] transition-colors"
            >
              <X size={20} className="text-[var(--muted)]" />
            </button>
          </div>

          {/* Body: left scrollable + right sticky */}
          <div className="flex flex-col lg:flex-row" style={{ alignItems: "flex-start" }}>

            {/* ── LEFT COLUMN (scrollable content) ── */}
            <div className="flex-1 min-w-0 overflow-y-auto" style={{ maxHeight: "calc(100vh - 160px)" }}>

              {/* Hero image */}
              {listing.images?.[0] ? (
                <div className="relative h-[280px] bg-[var(--surface2)]">
                  <Image
                    src={listing.images[0]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 720px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="h-[120px] bg-gradient-to-r from-[var(--accent)] to-[var(--green-700)]" />
              )}

              <div className="p-6 md:p-8 space-y-8">

                {/* Quick stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {listing.annual_revenue && (
                    <div className="bg-white border border-[var(--border)] rounded-xl p-4">
                      <div className="font-sans text-[15px] font-bold text-[var(--ink)] tabular-nums">{fmt(listing.annual_revenue)}</div>
                      <div className="font-sans text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide mt-1">Jahresumsatz</div>
                    </div>
                  )}
                  {listing.ebitda && (
                    <div className="bg-white border border-[var(--border)] rounded-xl p-4">
                      <div className="font-sans text-[15px] font-bold text-[var(--green)] tabular-nums">{fmt(listing.ebitda)}</div>
                      <div className="font-sans text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide mt-1">EBITDA/J.</div>
                    </div>
                  )}
                  {listing.employees && (
                    <div className="bg-white border border-[var(--border)] rounded-xl p-4">
                      <div className="font-sans text-[15px] font-bold text-[var(--ink)] tabular-nums">{listing.employees}</div>
                      <div className="font-sans text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide mt-1">Mitarbeiter</div>
                    </div>
                  )}
                  {listing.founded_year && (
                    <div className="bg-white border border-[var(--border)] rounded-xl p-4">
                      <div className="font-sans text-[15px] font-bold text-[var(--ink)] tabular-nums">{listing.founded_year}</div>
                      <div className="font-sans text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide mt-1">Gegründet</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-3">
                    Beschreibung
                  </h3>
                  <p className="font-sans text-[14px] text-[var(--ink)] leading-relaxed whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>

                {/* Business model */}
                {listing.business_model && (
                  <div>
                    <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-3">
                      Geschäftsmodell
                    </h3>
                    <p className="font-sans text-[14px] text-[var(--ink)] leading-relaxed">{listing.business_model}</p>
                  </div>
                )}

                {/* Reason for sale */}
                {listing.reason_for_sale && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
                    <div className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700 mb-2">
                      Verkaufsgrund
                    </div>
                    <p className="font-sans text-[14px] text-amber-900 leading-relaxed">{listing.reason_for_sale}</p>
                  </div>
                )}

                {/* Details */}
                <div>
                  <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-3">
                    Unternehmensdaten
                  </h3>
                  <div className="bg-white border border-[var(--border)] rounded-xl divide-y divide-[var(--border)]">
                    {listing.company_name && (
                      <div className="flex justify-between px-4 py-3">
                        <span className="font-sans text-[12px] text-[var(--muted)]">Firmenname</span>
                        <span className="font-sans text-[12px] font-semibold text-[var(--ink)]">{listing.company_name}</span>
                      </div>
                    )}
                    <div className="flex justify-between px-4 py-3">
                      <span className="font-sans text-[12px] text-[var(--muted)]">Transaktionsart</span>
                      <span className="font-sans text-[12px] font-semibold text-[var(--ink)]">
                        {OP_LABEL[listing.type_of_operation] ?? listing.type_of_operation}
                      </span>
                    </div>
                    <div className="flex justify-between px-4 py-3">
                      <span className="font-sans text-[12px] text-[var(--muted)]">Region</span>
                      <span className="font-sans text-[12px] font-semibold text-[var(--ink)]">{listing.region}</span>
                    </div>
                    {listing.assets_included && (
                      <div className="flex justify-between px-4 py-3">
                        <span className="font-sans text-[12px] text-[var(--muted)]">Im Verkauf enthalten</span>
                        <span className="font-sans text-[12px] font-semibold text-[var(--ink)] text-right max-w-[60%]">{listing.assets_included}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial table */}
                <div>
                  <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-3">
                    Finanzkennzahlen
                  </h3>
                  <ListingFinancials
                    rows={buildFinancialRows({
                      asking_price:       listing.asking_price,
                      price_confidential: listing.price_confidential,
                      annual_revenue:     listing.annual_revenue,
                      ebitda:             listing.ebitda,
                      employees:          listing.employees,
                      founded_year:       listing.founded_year,
                      city:               listing.city,
                      country:            listing.country,
                      region:             listing.region,
                    }, lang)}
                    title=""
                  />
                </div>

                {/* Market: multiple positioning */}
                <div>
                  <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-1">
                    Branchenmultiple im Vergleich
                  </h3>
                  <p className="font-sans text-[12px] text-[var(--muted)] mb-4">
                    {listing.category} · Marktdaten 2025
                  </p>
                  {ebitdaMultiple ? (
                    <div>
                      <div className="relative h-3 bg-[var(--surface2)] rounded-full mb-2" style={{ overflow: "visible" }}>
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-px h-5 bg-[var(--muted)]/40"
                          style={{ left: `${((industryMultiple.avg - industryMultiple.lo) / (industryMultiple.hi - industryMultiple.lo + 1)) * 100}%` }}
                        />
                        <div
                          className="absolute top-1/2 w-4 h-4 bg-[var(--accent)] rounded-full border-2 border-white shadow"
                          style={{
                            left: `${Math.min(95, Math.max(2, ((Math.min(ebitdaMultiple, industryMultiple.hi + 0.5) - industryMultiple.lo) / (industryMultiple.hi - industryMultiple.lo + 1)) * 100))}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                      </div>
                      <div className="flex justify-between font-sans text-[10px] text-[var(--muted)] mb-3">
                        <span>Min {industryMultiple.lo}×</span>
                        <span>Ø {industryMultiple.avg}×</span>
                        <span>Max {industryMultiple.hi}×</span>
                      </div>
                      <div className="bg-[var(--accent-light)] rounded-xl p-4">
                        <span className="font-sans text-[13px] font-bold text-[var(--accent)]">
                          Dieses Unternehmen: {ebitdaMultiple.toFixed(1)}×
                        </span>
                        <span className="font-sans text-[13px] text-[var(--muted)]">
                          {" · "}Branchenø: {industryMultiple.avg}×
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="font-sans text-[12px] text-[var(--muted)]">
                      Kaufpreis oder EBITDA nicht verfügbar.
                    </p>
                  )}
                </div>

                {/* Market: sale duration by region */}
                <div>
                  <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-1">
                    Ø Verkaufsdauer nach Region
                  </h3>
                  <p className="font-sans text-[12px] text-[var(--muted)] mb-4">Abgeschlossene Transaktionen in Deutschland</p>
                  <div className="space-y-2.5">
                    {Object.entries(AVG_SALE_DAYS).map(([region, days]) => {
                      const isCurrent =
                        listing.region?.toLowerCase().includes(region.toLowerCase()) ||
                        (listing.country === "AT" && region === "Österreich") ||
                        (listing.country === "CH" && region === "Schweiz");
                      return (
                        <div key={region} className="flex items-center gap-3">
                          <div className="w-36 flex-shrink-0">
                            <span className={`font-sans text-[12px] ${isCurrent ? "font-bold text-[var(--accent)]" : "text-[var(--muted)]"}`}>
                              {region}
                            </span>
                          </div>
                          <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${(days / MAX_SALE_DAYS) * 100}%`,
                                background: isCurrent ? "var(--accent)" : "var(--neutral-400)",
                              }}
                            />
                          </div>
                          <div className="w-16 text-right">
                            <span className={`font-sans text-[11px] tabular-nums ${isCurrent ? "font-bold text-[var(--accent)]" : "text-[var(--muted)]"}`}>
                              {days} Tage
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Market: price distribution */}
                <div>
                  <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-1">
                    Preisverteilung in dieser Branche
                  </h3>
                  <p className="font-sans text-[12px] text-[var(--muted)] mb-4">
                    {catListings.length} Inserate in {listing.category}
                  </p>
                  <div className="flex items-end gap-2 h-28">
                    {priceBuckets.map((b) => (
                      <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                        <span className="font-sans text-[10px] text-[var(--muted)]">{b.count || ""}</span>
                        <div
                          className="w-full rounded-t"
                          style={{
                            height: `${Math.max(4, (b.count / maxBucketCount) * 80)}%`,
                            background: b.isThis ? "var(--accent)" : "var(--accent-light)",
                            border: b.isThis ? "2px solid var(--accent)" : "none",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {priceBuckets.map((b) => (
                      <div key={b.label} className="flex-1 text-center">
                        <span className={`font-sans text-[9px] ${b.isThis ? "font-bold text-[var(--accent)]" : "text-[var(--muted)]"}`}>
                          {b.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  {listing.asking_price && !listing.price_confidential && (
                    <p className="font-sans text-[11px] font-semibold text-[var(--accent)] mt-2">
                      ▲ Dieses Inserat ({fmt(listing.asking_price)})
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* ── RIGHT COLUMN (sticky sidebar) ── */}
            <div
              className="w-full lg:w-[360px] flex-shrink-0 lg:border-l border-[var(--border)] bg-white"
              style={{ position: "sticky", top: 0, maxHeight: "calc(100vh - 96px)", overflowY: "auto" }}
            >
              <div className="p-6 space-y-6">

                {/* Big price block */}
                <div>
                  {listing.price_confidential || !listing.asking_price ? (
                    <div className="font-sans text-[32px] font-bold text-[var(--ink)] tracking-tight leading-none mb-1">
                      Auf Anfrage
                    </div>
                  ) : (
                    <>
                      <div className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-2">
                        Kaufpreis
                      </div>
                      <div className="font-sans text-[48px] font-bold text-[var(--ink)] tracking-tight leading-none tabular-nums mb-2">
                        {fmt(listing.asking_price)}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {revenueMultiple && (
                          <span className="font-sans text-[12px] text-[var(--muted)]">
                            {revenueMultiple.toFixed(1)}× Umsatz
                          </span>
                        )}
                        {ebitdaMultiple && (
                          <span className="font-sans text-[12px] text-[var(--muted)]">
                            {ebitdaMultiple.toFixed(1)}× EBITDA
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Key metrics mini table */}
                <div className="bg-[var(--surface2)] rounded-xl divide-y divide-[var(--border)]">
                  {listing.annual_revenue && (
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="font-sans text-[12px] text-[var(--muted)]">Jahresumsatz</span>
                      <span className="font-sans text-[12px] font-bold text-[var(--ink)] tabular-nums">{fmt(listing.annual_revenue)}</span>
                    </div>
                  )}
                  {listing.ebitda && (
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="font-sans text-[12px] text-[var(--muted)]">EBITDA/Jahr</span>
                      <span className="font-sans text-[12px] font-bold text-[var(--green)] tabular-nums">{fmt(listing.ebitda)}</span>
                    </div>
                  )}
                  {listing.employees && (
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="font-sans text-[12px] text-[var(--muted)]">Mitarbeiter</span>
                      <span className="font-sans text-[12px] font-bold text-[var(--ink)]">{listing.employees}</span>
                    </div>
                  )}
                  {listing.founded_year && (
                    <div className="flex justify-between px-4 py-2.5">
                      <span className="font-sans text-[12px] text-[var(--muted)]">Gegründet</span>
                      <span className="font-sans text-[12px] font-bold text-[var(--ink)] tabular-nums">{listing.founded_year}</span>
                    </div>
                  )}
                </div>

                {/* Contact form */}
                <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface2)]">
                    <h3 className="font-sans text-[14px] font-bold text-[var(--ink)]">
                      {lang === "de" ? "Verkäufer kontaktieren" : "Contact seller"}
                    </h3>
                  </div>

                  {cSent ? (
                    <div className="px-5 py-8 text-center">
                      <CheckCircle size={28} className="text-[var(--green)] mx-auto mb-3" />
                      <p className="font-sans text-[14px] font-semibold text-[var(--ink)] mb-1">Nachricht gesendet</p>
                      <p className="font-sans text-[12px] text-[var(--muted)]">
                        Der Anbieter meldet sich in der Regel innerhalb von 24 Stunden.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContact} className="px-4 py-4 space-y-2.5">
                      <input
                        type="text"
                        value={cName}
                        onChange={(e) => setCName(e.target.value)}
                        required
                        placeholder="Ihr vollständiger Name"
                        className="w-full px-3 py-2.5 font-sans text-[13px] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white transition-colors"
                      />
                      <input
                        type="email"
                        value={cEmail}
                        onChange={(e) => setCEmail(e.target.value)}
                        required
                        placeholder="ihre@email.de"
                        className="w-full px-3 py-2.5 font-sans text-[13px] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white transition-colors"
                      />
                      <input
                        type="tel"
                        value={cPhone}
                        onChange={(e) => setCPhone(e.target.value)}
                        placeholder="+49 171 … (optional)"
                        className="w-full px-3 py-2.5 font-sans text-[13px] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white transition-colors"
                      />
                      <textarea
                        value={cMessage}
                        onChange={(e) => setCMessage(e.target.value)}
                        required
                        rows={3}
                        placeholder="Ich interessiere mich für Ihr Unternehmen und würde gerne mehr erfahren…"
                        className="w-full px-3 py-2.5 font-sans text-[13px] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white resize-none transition-colors"
                      />
                      {cError && <p className="font-sans text-[12px] text-[var(--danger)]">{cError}</p>}
                      <button
                        type="submit"
                        disabled={cLoading}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--accent)] text-white font-sans font-bold text-[13px] rounded-xl hover:bg-[var(--accent-hover)] disabled:opacity-60 transition-colors"
                      >
                        {cLoading ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <><Send size={13} /> Nachricht senden</>
                        )}
                      </button>

                      {/* Phone reveal */}
                      {listing.show_phone && listing.phone && (
                        <>
                          <div className="flex items-center gap-3 my-1">
                            <div className="flex-1 h-px bg-[var(--border)]" />
                            <span className="font-sans text-[10px] text-[var(--muted)]">oder</span>
                            <div className="flex-1 h-px bg-[var(--border)]" />
                          </div>
                          {phoneRevealed ? (
                            <div className="flex items-center justify-center gap-2 py-2.5 border border-[var(--border)] rounded-xl">
                              <Phone size={14} className="text-[var(--accent)]" />
                              <span className="font-sans text-[14px] font-semibold text-[var(--ink)] tabular-nums">{listing.phone}</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPhoneRevealed(true)}
                              className="w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--border)] rounded-xl font-sans text-[13px] text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors"
                            >
                              <Phone size={14} />
                              Telefonnummer anzeigen
                            </button>
                          )}
                        </>
                      )}

                      <p className="font-sans text-[10px] text-[var(--muted)] leading-relaxed">
                        Ihre Anfrage wird direkt an den Anbieter weitergeleitet.
                      </p>
                    </form>
                  )}
                </div>

                {/* Inline offer form */}
                {!offerSent && (
                  <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOfferOpen((v) => !v)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-[var(--surface2)] hover:bg-[var(--accent-light)] transition-colors"
                    >
                      <span className="font-sans text-[14px] font-bold text-[var(--accent)]">
                        {lang === "de" ? "Angebot machen" : "Make an offer"}
                      </span>
                      <DollarSign size={15} className="text-[var(--accent)]" />
                    </button>

                    {offerOpen && (
                      <form onSubmit={handleOffer} className="px-4 py-4 space-y-2.5 border-t border-[var(--border)]">
                        <input
                          type="text"
                          value={offerName}
                          onChange={(e) => setOfferName(e.target.value)}
                          required
                          placeholder="Ihr vollständiger Name"
                          className="w-full px-3 py-2.5 font-sans text-[13px] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white transition-colors"
                        />
                        <input
                          type="email"
                          value={offerEmail}
                          onChange={(e) => setOfferEmail(e.target.value)}
                          required
                          placeholder="ihre@email.de"
                          className="w-full px-3 py-2.5 font-sans text-[13px] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white transition-colors"
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-sans text-[13px] text-[var(--muted)]">€</span>
                          <input
                            type="text"
                            value={offerAmount}
                            onChange={(e) => setOfferAmount(e.target.value)}
                            required
                            placeholder="Ihr Angebot (z.B. 850000)"
                            className="w-full pl-7 pr-3 py-2.5 font-sans text-[13px] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white transition-colors tabular-nums"
                          />
                        </div>
                        <textarea
                          value={offerNote}
                          onChange={(e) => setOfferNote(e.target.value)}
                          rows={2}
                          placeholder="Anmerkungen (optional)"
                          className="w-full px-3 py-2.5 font-sans text-[13px] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white resize-none transition-colors"
                        />
                        {offerError && <p className="font-sans text-[12px] text-[var(--danger)]">{offerError}</p>}
                        <button
                          type="submit"
                          disabled={offerLoading}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--neutral-900)] text-white font-sans font-bold text-[13px] rounded-xl hover:bg-[var(--neutral-800)] disabled:opacity-60 transition-colors"
                        >
                          {offerLoading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>{lang === "de" ? "Angebot absenden" : "Submit offer"}</>
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {offerSent && (
                  <div className="border border-[var(--green)] bg-[var(--accent-light)] rounded-xl px-5 py-4 text-center">
                    <CheckCircle size={22} className="text-[var(--green)] mx-auto mb-2" />
                    <p className="font-sans text-[13px] font-bold text-[var(--accent)]">Angebot eingegangen</p>
                    <p className="font-sans text-[12px] text-[var(--muted)] mt-1">Der Verkäufer wird sich bei Ihnen melden.</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
