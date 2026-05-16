"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Eye, MessageSquare, Clock, Phone, ChevronLeft,
  CheckCircle, DollarSign, Send, Flag, ArrowLeft,
} from "lucide-react";
import { MOCK_LISTINGS } from "@/lib/mockData";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/lib/supabase";

const INDUSTRY_MULTIPLES: Record<string, { lo: number; avg: number; hi: number }> = {
  "Gastronomie":      { lo: 2.0, avg: 3.0, hi: 4.5 },
  "IT & Tech":        { lo: 3.0, avg: 5.0, hi: 7.0 },
  "E-Commerce":       { lo: 1.5, avg: 2.5, hi: 4.0 },
  "Produktion":       { lo: 2.5, avg: 3.5, hi: 5.0 },
  "Gesundheit":       { lo: 2.5, avg: 4.0, hi: 6.0 },
  "Handwerk":         { lo: 1.5, avg: 2.5, hi: 3.5 },
  "Dienstleistungen": { lo: 2.0, avg: 3.0, hi: 4.5 },
  "Immobilien":       { lo: 2.5, avg: 4.0, hi: 6.0 },
};

const OP_LABEL: Record<string, string> = {
  vollstaendige_uebertragung: "Vollständige Übertragung",
  unternehmensuebertragung:   "Unternehmensübertragung",
  gewerbeimmobilie:           "Gewerbeimmobilie",
  anteilsuebertragung:        "Anteilsübertragung",
  unternehmensverpachtung:    "Unternehmensverpachtung",
  immobilienvermietung:       "Immobilienvermietung",
};

function fmtEur(n: number | null): string {
  if (!n) return "—";
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

function fmtShort(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (n >= 1_000)     return `€${Math.round(n / 1_000)}k`;
  return `€${n}`;
}

// Tooltip-enhanced table row
function MetricRow({ label, value, tooltip, highlight }: {
  label: string;
  value: React.ReactNode;
  tooltip?: string;
  highlight?: "green" | "amber" | "none";
}) {
  return (
    <div className="flex items-start justify-between px-4 py-3 border-b border-[var(--border)] last:border-0">
      <div className="flex items-center gap-1.5">
        <span className="font-sans text-[12px] text-[var(--muted)]">{label}</span>
        {tooltip && (
          <div className="tooltip-container">
            <span className="font-sans text-[10px] text-[var(--muted)] cursor-help select-none">ⓘ</span>
            <div className="tooltip-content">{tooltip}</div>
          </div>
        )}
      </div>
      <span className={`font-sans text-[13px] font-semibold tabular-nums text-right max-w-[55%] ${
        highlight === "green" ? "text-[var(--green)]" :
        highlight === "amber" ? "text-amber-600" :
        "text-[var(--ink)]"
      }`}>
        {value}
      </span>
    </div>
  );
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(0);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);

  // Contact form state
  const [cName, setCName]       = useState("");
  const [cEmail, setCEmail]     = useState("");
  const [cPhone, setCPhone]     = useState("");
  const [cMsg, setCMsg]         = useState("Ich interessiere mich für dieses Unternehmen und würde gerne mehr erfahren.");
  const [cLoading, setCLoading] = useState(false);
  const [cSent, setCSent]       = useState(false);
  const [cError, setCError]     = useState("");

  // Offer form state
  const [oName, setOName]       = useState("");
  const [oEmail, setOEmail]     = useState("");
  const [oAmount, setOAmount]   = useState("");
  const [oNote, setONote]       = useState("");
  const [oLoading, setOLoading] = useState(false);
  const [oSent, setOSent]       = useState(false);
  const [oError, setOError]     = useState("");

  const listing = MOCK_LISTINGS.find((l) => l.id === id);
  if (!listing) return notFound();

  const margin = listing.ebitda && listing.annual_revenue && listing.annual_revenue > 0
    ? (listing.ebitda / listing.annual_revenue) * 100
    : null;

  const revenueMultiple = listing.asking_price && listing.annual_revenue
    ? (listing.asking_price / listing.annual_revenue).toFixed(2)
    : null;

  const ebitdaMultiple = listing.asking_price && listing.ebitda
    ? (listing.asking_price / listing.ebitda).toFixed(1)
    : null;

  const industryMultiple = INDUSTRY_MULTIPLES[listing.category];

  const yearsOld = listing.founded_year
    ? new Date().getFullYear() - listing.founded_year
    : null;

  const heroSrc = listing.images?.[selectedImage]
    ?? `https://picsum.photos/seed/${listing.id.slice(0, 8)}/1200/700`;

  const allImages = listing.images?.length
    ? listing.images
    : [`https://picsum.photos/seed/${listing.id.slice(0, 8)}/1200/700`];

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setCLoading(true);
    setCError("");
    try {
      const supabase = createClient();
      await supabase.from("inquiries").insert({
        listing_id:   listing.id,
        sender_name:  cName,
        sender_email: cEmail,
        sender_phone: cPhone || null,
        message:      cMsg,
        inquiry_type: "inquiry",
      });
      setCSent(true);
    } catch {
      setCSent(true); // demo fallback
    } finally {
      setCLoading(false);
    }
  };

  const handleOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setOLoading(true);
    setOError("");
    const amountNum = parseInt(oAmount.replace(/\D/g, ""), 10);
    if (!amountNum) {
      setOError("Bitte gültigen Betrag eingeben.");
      setOLoading(false);
      return;
    }
    try {
      const supabase = createClient();
      await supabase.from("inquiries").insert({
        listing_id:   listing.id,
        sender_name:  oName,
        sender_email: oEmail,
        message:      oNote || `Angebot: ${fmtEur(amountNum)}`,
        inquiry_type: "offer",
        offer_amount: amountNum,
      });
      setOSent(true);
    } catch {
      setOSent(true);
    } finally {
      setOLoading(false);
    }
  };

  return (
    <div className="bg-[var(--bg)] min-h-screen">

      {/* Sticky top nav */}
      <div className="sticky top-0 z-40 bg-white border-b border-[var(--border)] h-12 flex items-center px-4 sm:px-6 lg:px-8 gap-4">
        <Link
          href="/listings"
          className="flex items-center gap-1.5 font-sans text-[12px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors flex-shrink-0"
        >
          <ArrowLeft size={13} />
          {lang === "de" ? "Alle Inserate" : "All listings"}
        </Link>
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] bg-[var(--accent-light)] px-2 py-0.5 rounded-full flex-shrink-0">
            {listing.category}
          </span>
          <span className="font-sans text-[13px] font-semibold text-[var(--ink)] truncate hidden sm:block">
            {listing.title}
          </span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── LEFT MAIN CONTENT ── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* Image gallery */}
            <div>
              <div className="relative w-full rounded-xl overflow-hidden bg-[var(--surface2)]" style={{ height: 420 }}>
                <Image
                  src={heroSrc}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                        i === selectedImage ? "border-[var(--accent)]" : "border-transparent hover:border-[var(--border)]"
                      }`}
                      style={{ width: 100, height: 70 }}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="100px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title + badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] bg-[var(--accent-light)] px-2 py-1 rounded-full">
                  {listing.category}
                </span>
                <span className={`font-sans text-[10px] font-bold px-2 py-1 rounded-full ${
                  listing.status_business === "active_profitable" ? "bg-green-50 text-[var(--green)]" :
                  listing.status_business === "in_development"    ? "bg-amber-50 text-amber-700" :
                  "bg-red-50 text-[var(--red)]"
                }`}>
                  {listing.status_business === "active_profitable" ? "Aktiv & Profitabel" :
                   listing.status_business === "in_development"    ? "In Entwicklung" : "Sanierungsbedarf"}
                </span>
                <span className="font-sans text-[11px] text-[var(--muted)] flex items-center gap-1">
                  <Eye size={11} /> {listing.views_count}
                </span>
                <span className="font-sans text-[11px] text-[var(--muted)] flex items-center gap-1">
                  <MessageSquare size={11} /> {listing.inquiries_count}
                </span>
                <span className="font-sans text-[11px] text-[var(--muted)] flex items-center gap-1 ml-auto">
                  <Clock size={11} /> {new Date(listing.created_at).toLocaleDateString("de-DE")}
                </span>
              </div>
              <h1 className="font-sans text-[clamp(22px,3.5vw,32px)] font-bold text-[var(--ink)] leading-tight tracking-tight mb-2">
                {listing.title}
              </h1>
              <div className="flex items-center gap-1.5 font-sans text-[13px] text-[var(--muted)]">
                <MapPin size={13} />
                <span>{listing.city}, {listing.region}, {listing.country === "DE" ? "Deutschland" : listing.country === "AT" ? "Österreich" : "Schweiz"}</span>
              </div>
            </div>

            {/* Schnellübersicht — 4 stat boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {listing.annual_revenue && (
                <div className="bg-white border border-[var(--border)] rounded-xl p-4">
                  <div className="font-sans text-[15px] font-bold text-[var(--ink)] tabular-nums">{fmtShort(listing.annual_revenue)}</div>
                  <div className="font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mt-1">Umsatz/J.</div>
                </div>
              )}
              {listing.ebitda && (
                <div className="bg-white border border-[var(--border)] rounded-xl p-4">
                  <div className="font-sans text-[15px] font-bold text-[var(--green)] tabular-nums">{fmtShort(listing.ebitda)}</div>
                  <div className="font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mt-1">EBITDA/J.</div>
                </div>
              )}
              {listing.employees && (
                <div className="bg-white border border-[var(--border)] rounded-xl p-4">
                  <div className="font-sans text-[15px] font-bold text-[var(--ink)] tabular-nums">{listing.employees}</div>
                  <div className="font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mt-1">Mitarbeiter</div>
                </div>
              )}
              {listing.founded_year && (
                <div className="bg-white border border-[var(--border)] rounded-xl p-4">
                  <div className="font-sans text-[15px] font-bold text-[var(--ink)] tabular-nums">{listing.founded_year}</div>
                  <div className="font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-wide mt-1">
                    Gegründet{yearsOld ? ` (${yearsOld} J.)` : ""}
                  </div>
                </div>
              )}
            </div>

            {/* Kennzahlen */}
            <div>
              <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-3">
                Kennzahlen
              </h2>
              <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
                {listing.annual_revenue && (
                  <MetricRow
                    label="Jahresumsatz"
                    value={fmtEur(listing.annual_revenue)}
                    tooltip="Gesamter Jahresumsatz vor Kosten"
                  />
                )}
                {listing.ebitda && (
                  <MetricRow
                    label="EBITDA"
                    value={fmtEur(listing.ebitda)}
                    tooltip="Gewinn vor Zinsen, Steuern und Abschreibungen"
                    highlight="green"
                  />
                )}
                {margin !== null && (
                  <MetricRow
                    label="Gewinnmarge"
                    value={`${margin.toFixed(1)}%`}
                    highlight={margin >= 20 ? "green" : margin >= 10 ? "amber" : "none"}
                  />
                )}
                {listing.asking_price && !listing.price_confidential && (
                  <MetricRow label="Kaufpreis" value={fmtEur(listing.asking_price)} />
                )}
                {ebitdaMultiple && (
                  <MetricRow
                    label="EBITDA-Multiple"
                    value={`${ebitdaMultiple}×`}
                    tooltip="Kaufpreis ÷ EBITDA — wie viele Jahresgewinne zahlen Sie"
                    highlight={parseFloat(ebitdaMultiple) <= (industryMultiple?.avg ?? 99) ? "green" : "none"}
                  />
                )}
                {revenueMultiple && (
                  <MetricRow label="Umsatz-Multiple" value={`${revenueMultiple}×`} />
                )}
                {listing.employees && (
                  <MetricRow label="Mitarbeiter" value={`${listing.employees}`} />
                )}
                {listing.founded_year && (
                  <MetricRow
                    label="Gegründet"
                    value={yearsOld ? `${listing.founded_year} (seit ${yearsOld} Jahren)` : `${listing.founded_year}`}
                  />
                )}
                <MetricRow
                  label="Standort"
                  value={`${listing.city}, ${listing.country === "DE" ? "Deutschland" : listing.country === "AT" ? "Österreich" : "Schweiz"}`}
                />
                <MetricRow
                  label="Transaktionsart"
                  value={OP_LABEL[listing.type_of_operation] ?? listing.type_of_operation}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-3">
                Beschreibung der Tätigkeit
              </h2>
              <p className="font-sans text-[15px] text-[var(--ink)] leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Business model */}
            {listing.business_model && (
              <div>
                <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-3">
                  Geschäftsmodell
                </h2>
                <p className="font-sans text-[15px] text-[var(--ink)] leading-relaxed">
                  {listing.business_model}
                </p>
              </div>
            )}

            {/* Competition */}
            {listing.competition && (
              <div>
                <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-3">
                  Wettbewerbssituation
                </h2>
                <p className="font-sans text-[15px] text-[var(--ink)] leading-relaxed">
                  {listing.competition}
                </p>
              </div>
            )}

            {/* Assets included */}
            {listing.assets_included && (
              <div>
                <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-3">
                  Im Verkauf enthaltene Assets
                </h2>
                <p className="font-sans text-[15px] text-[var(--ink)] leading-relaxed">
                  {listing.assets_included}
                </p>
              </div>
            )}

            {/* Reason for sale — highlighted box */}
            {listing.reason_for_sale && (
              <div
                className="rounded-xl px-5 py-4"
                style={{ background: "#fffbeb", borderLeft: "3px solid #f59e0b" }}
              >
                <div className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-amber-700 mb-2">
                  Verkaufsgrund
                </div>
                <p className="font-sans text-[14px] text-amber-900 leading-relaxed">
                  {listing.reason_for_sale}
                </p>
              </div>
            )}

            {/* Market: multiple positioning */}
            {industryMultiple && (
              <div>
                <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-1">
                  Branchenmultiple im Vergleich
                </h2>
                <p className="font-sans text-[12px] text-[var(--muted)] mb-4">
                  {listing.category} · DACH-Marktdaten 2025
                </p>
                {ebitdaMultiple ? (
                  <div className="bg-white border border-[var(--border)] rounded-xl p-5">
                    <div className="relative h-3 bg-[var(--surface2)] rounded-full mb-2" style={{ overflow: "visible" }}>
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-px h-5 bg-[var(--muted)]/40"
                        style={{ left: `${((industryMultiple.avg - industryMultiple.lo) / (industryMultiple.hi - industryMultiple.lo + 1)) * 100}%` }}
                      />
                      <div
                        className="absolute top-1/2 w-4 h-4 bg-[var(--accent)] rounded-full border-2 border-white shadow"
                        style={{
                          left: `${Math.min(95, Math.max(2, ((Math.min(parseFloat(ebitdaMultiple), industryMultiple.hi + 0.5) - industryMultiple.lo) / (industryMultiple.hi - industryMultiple.lo + 1)) * 100))}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    </div>
                    <div className="flex justify-between font-sans text-[10px] text-[var(--muted)] mb-3">
                      <span>Min {industryMultiple.lo}×</span>
                      <span>Ø {industryMultiple.avg}×</span>
                      <span>Max {industryMultiple.hi}×</span>
                    </div>
                    <div className="bg-[var(--accent-light)] rounded-lg p-3">
                      <span className="font-sans text-[13px] font-bold text-[var(--accent)]">
                        Dieses Unternehmen: {ebitdaMultiple}×
                      </span>
                      <span className="font-sans text-[13px] text-[var(--muted)]">
                        {" · "}Branchenø: {industryMultiple.avg}×
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="font-sans text-[12px] text-[var(--muted)]">EBITDA nicht verfügbar.</p>
                )}
              </div>
            )}

            {/* Transferability */}
            {(() => {
              // Generate mock transferability from listing id for demo
              const seed = listing.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
              const td = listing.transferability_data ?? {
                independence: 3 + (seed % 7),
                customers:    2 + ((seed * 3) % 8),
                stability:    4 + ((seed * 7) % 6),
                costs:        3 + ((seed * 11) % 7),
                processes:    2 + ((seed * 13) % 8),
              };
              const tScore = listing.transferability_score ?? Math.min(100, Math.round((Object.values(td).reduce((a, b) => a + b, 0) / 50) * 100));
              const scoreColor = tScore >= 75 ? "#2d5a3d" : tScore >= 50 ? "#d97706" : "#dc2626";
              const QLABELS = [
                { key: "independence", label: lang === "de" ? "Inhaberunabhängigkeit" : "Owner independence" },
                { key: "customers",    label: lang === "de" ? "Kundenbindung" : "Customer retention" },
                { key: "stability",    label: lang === "de" ? "Umsatzstabilität" : "Revenue stability" },
                { key: "costs",        label: lang === "de" ? "Kostenstruktur" : "Cost structure" },
                { key: "processes",    label: lang === "de" ? "Prozesse & Dokumentation" : "Processes & docs" },
              ];
              return (
                <div>
                  <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-1">
                    {lang === "de" ? "Übertragbarkeit" : "Transferability"}
                  </h2>
                  <p className="font-sans text-[12px] text-[var(--muted)] mb-4">
                    {lang === "de"
                      ? "Wie gut ist das Unternehmen ohne den Inhaber übertragbar?"
                      : "How well can the business run without the owner?"}
                  </p>
                  <div className="bg-white border border-[var(--border)] rounded-xl p-5">
                    {/* Score header */}
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <div className="font-sans text-[32px] font-bold leading-none tabular-nums" style={{ color: scoreColor }}>
                          {tScore}
                          <span className="text-[18px] text-[var(--muted)]">/100</span>
                        </div>
                        <div className="font-sans text-[13px] font-semibold mt-1" style={{ color: scoreColor }}>
                          {tScore >= 75
                            ? (lang === "de" ? "Gut übertragbar" : "Easily transferable")
                            : tScore >= 50
                            ? (lang === "de" ? "Bedingt übertragbar" : "Conditionally transferable")
                            : (lang === "de" ? "Schwer übertragbar" : "Hard to transfer")}
                        </div>
                      </div>
                      <svg width="68" height="68" viewBox="0 0 68 68">
                        <circle cx="34" cy="34" r="26" fill="none" stroke="#e5e7eb" strokeWidth="7" />
                        <circle cx="34" cy="34" r="26" fill="none" stroke={scoreColor} strokeWidth="7"
                          strokeLinecap="round"
                          strokeDasharray={`${(tScore / 100) * 163.4} 163.4`}
                          transform="rotate(-90 34 34)"
                        />
                        <text x="34" y="38" textAnchor="middle" fontSize="13" fontWeight="700" fill={scoreColor} fontFamily="sans-serif">
                          {tScore}
                        </text>
                      </svg>
                    </div>

                    {/* 5 mini bar rows */}
                    <div className="space-y-3">
                      {QLABELS.map(({ key, label }) => {
                        const val = td[key as keyof typeof td] ?? 5;
                        const pct = ((val - 1) / 9) * 100;
                        const barColor = val >= 7 ? "#2d5a3d" : val >= 4 ? "#d97706" : "#dc2626";
                        return (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-sans text-[12px] text-[var(--ink)]">{label}</span>
                              <span className="font-mono text-[11px] font-bold" style={{ color: barColor }}>{val}/10</span>
                            </div>
                            <div className="h-2 bg-[var(--surface2)] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <p className="font-sans text-[10px] text-[var(--muted)] mt-4 leading-relaxed">
                      {lang === "de"
                        ? "Basierend auf Selbstauskunft des Verkäufers. Angaben wurden nicht extern verifiziert."
                        : "Based on seller self-assessment. Data has not been externally verified."}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Similar listings */}
            {(() => {
              const similar = MOCK_LISTINGS.filter(
                (l) => l.id !== listing.id && (l.category === listing.category || (l.asking_price && listing.asking_price && Math.abs(l.asking_price - listing.asking_price) / listing.asking_price < 0.4))
              ).slice(0, 3);
              if (!similar.length) return null;
              return (
                <div>
                  <h2 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-4">
                    Ähnliche Inserate
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {similar.map((s) => (
                      <Link
                        key={s.id}
                        href={`/listings/${s.id}`}
                        className="bg-white border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)] hover:shadow-md transition-all group"
                      >
                        <div className="font-sans text-[13px] font-semibold text-[var(--ink)] line-clamp-2 mb-1 group-hover:text-[var(--accent)] transition-colors">
                          {s.title}
                        </div>
                        <div className="font-sans text-[11px] text-[var(--muted)]">{s.city} · {s.category}</div>
                        {s.asking_price && !s.price_confidential && (
                          <div className="font-sans text-[13px] font-bold text-[var(--ink)] tabular-nums mt-2">
                            {fmtShort(s.asking_price)}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Report */}
            <div className="flex justify-center pb-8">
              <button className="flex items-center gap-1.5 font-sans text-[11px] text-[var(--muted)] hover:text-[var(--red)] transition-colors">
                <Flag size={11} />
                Inserat melden
              </button>
            </div>
          </div>

          {/* ── RIGHT STICKY SIDEBAR ── */}
          <aside className="w-full lg:w-[360px] flex-shrink-0">
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden" style={{ position: "sticky", top: 60 }}>
              <div className="p-5 space-y-4">

                {/* Price */}
                <div>
                  <div className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-1">Kaufpreis</div>
                  {listing.price_confidential || !listing.asking_price ? (
                    <div className="font-sans text-[32px] font-bold text-[var(--muted)] leading-none">Auf Anfrage</div>
                  ) : (
                    <>
                      <div className="font-sans text-[40px] font-bold text-[var(--green-700)] leading-none tabular-nums tracking-tight">
                        {fmtShort(listing.asking_price)}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {revenueMultiple && (
                          <span className="font-sans text-[12px] text-[var(--muted)]">{revenueMultiple}× Umsatz</span>
                        )}
                        {ebitdaMultiple && (
                          <span className="font-sans text-[12px] text-[var(--muted)]">{ebitdaMultiple}× EBITDA</span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="h-px bg-[var(--border)]" />

                {/* Label */}
                <div className="font-sans text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">
                  Privatanbieter
                </div>

                {/* Contact form */}
                {cSent ? (
                  <div className="py-4 text-center">
                    <CheckCircle size={24} className="text-[var(--green)] mx-auto mb-2" />
                    <p className="font-sans text-[13px] font-bold text-[var(--ink)]">Nachricht gesendet</p>
                    <p className="font-sans text-[11px] text-[var(--muted)] mt-1">Der Verkäufer meldet sich bald.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContact} className="space-y-2">
                    <input
                      type="text"
                      value={cName}
                      onChange={(e) => setCName(e.target.value)}
                      required
                      placeholder="Ihr Name"
                      className="w-full px-3 py-2.5 font-sans text-[13px] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white"
                    />
                    <input
                      type="email"
                      value={cEmail}
                      onChange={(e) => setCEmail(e.target.value)}
                      required
                      placeholder="ihre@email.de"
                      className="w-full px-3 py-2.5 font-sans text-[13px] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white"
                    />
                    <textarea
                      value={cMsg}
                      onChange={(e) => setCMsg(e.target.value)}
                      required
                      rows={3}
                      className="w-full px-3 py-2.5 font-sans text-[13px] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white resize-none"
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
                  </form>
                )}

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <span className="font-sans text-[10px] text-[var(--muted)]">oder</span>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>

                {/* Phone */}
                {listing.show_phone && listing.phone && (
                  <>
                    {phoneRevealed ? (
                      <a
                        href={`tel:${listing.phone}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 border border-[var(--border)] rounded-xl font-sans text-[13px] font-semibold text-[var(--ink)] tabular-nums hover:bg-[var(--surface2)] transition-colors"
                      >
                        <Phone size={14} className="text-[var(--accent)]" />
                        {listing.phone}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPhoneRevealed(true)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--border)] rounded-xl font-sans text-[13px] text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors"
                      >
                        <Phone size={13} />
                        Telefonnummer anzeigen
                      </button>
                    )}
                  </>
                )}

                {/* Offer toggle */}
                {!oSent ? (
                  <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOfferOpen((v) => !v)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[var(--accent-light)] transition-colors"
                    >
                      <span className="font-sans text-[13px] font-bold text-[var(--accent)]">Angebot machen</span>
                      <DollarSign size={14} className="text-[var(--accent)]" />
                    </button>
                    {offerOpen && (
                      <form onSubmit={handleOffer} className="px-4 pb-4 pt-2 space-y-2 border-t border-[var(--border)]">
                        <input
                          type="text"
                          value={oName}
                          onChange={(e) => setOName(e.target.value)}
                          required
                          placeholder="Ihr Name"
                          className="w-full px-3 py-2 font-sans text-[13px] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white"
                        />
                        <input
                          type="email"
                          value={oEmail}
                          onChange={(e) => setOEmail(e.target.value)}
                          required
                          placeholder="ihre@email.de"
                          className="w-full px-3 py-2 font-sans text-[13px] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white"
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-sans text-[13px] text-[var(--muted)]">€</span>
                          <input
                            type="text"
                            value={oAmount}
                            onChange={(e) => setOAmount(e.target.value)}
                            required
                            placeholder="Ihr Angebot"
                            className="w-full pl-7 pr-3 py-2 font-sans text-[13px] border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white tabular-nums"
                          />
                        </div>
                        {oError && <p className="font-sans text-[12px] text-[var(--danger)]">{oError}</p>}
                        <button
                          type="submit"
                          disabled={oLoading}
                          className="w-full py-2.5 bg-[var(--neutral-900)] text-white font-sans font-bold text-[13px] rounded-xl hover:bg-[var(--neutral-800)] disabled:opacity-60 transition-colors"
                        >
                          {oLoading ? "Wird gesendet…" : "Angebot absenden"}
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="border border-[var(--green)] bg-[var(--accent-light)] rounded-xl px-4 py-3 text-center">
                    <CheckCircle size={18} className="text-[var(--green)] mx-auto mb-1" />
                    <p className="font-sans text-[12px] font-bold text-[var(--accent)]">Angebot eingegangen</p>
                  </div>
                )}

                {/* Legal note */}
                <p className="font-sans text-[10px] text-[var(--muted)] leading-relaxed text-center">
                  Ihre Anfrage wird direkt an den Anbieter weitergeleitet. Firmadeal speichert keine Nachrichtenverläufe.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
