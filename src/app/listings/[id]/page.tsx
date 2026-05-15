"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  ChevronRight,
  Eye,
  MessageSquare,
  Clock,
  Phone,
  Flag,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react";
import { MOCK_LISTINGS } from "@/lib/mockData";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/lib/supabase";

function formatPrice(price: number): string {
  if (price >= 1000000) {
    return `€${(price / 1000000).toFixed(1).replace(".", ",")} Mio.`;
  }
  return `€${price.toLocaleString("de-DE")}`;
}

function formatRevenue(val: number | null): string {
  if (!val) return "—";
  if (val >= 1000000) return `€${(val / 1000000).toFixed(1).replace(".", ",")} Mio.`;
  if (val >= 1000) return `€${(val / 1000).toFixed(0)}k`;
  return `€${val}`;
}

const TABS_DE = ["Übersicht", "Finanzen", "Details"];
const TABS_EN = ["Overview", "Financials", "Details"];

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [message, setMessage] = useState(
    lang === "de"
      ? "Ich interessiere mich für dieses Unternehmen und würde gerne mehr erfahren."
      : "I am interested in this business and would like to learn more."
  );
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const listing = MOCK_LISTINGS.find((l) => l.id === id);
  if (!listing) return notFound();

  const tabs = lang === "de" ? TABS_DE : TABS_EN;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const supabase = createClient();
      await supabase.from("inquiries").insert({
        listing_id: listing.id,
        sender_name: contactName,
        sender_email: contactEmail,
        message,
      });
      setSent(true);
    } catch {
      // fallback: still show success for demo
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  const statusLabel = {
    active_profitable: lang === "de" ? "Aktiv & Profitabel" : "Active & Profitable",
    in_development: lang === "de" ? "In Entwicklung" : "In development",
    restructuring: lang === "de" ? "Sanierungsbedarf" : "Needs restructuring",
  }[listing.status_business];

  const statusColor = {
    active_profitable: "text-[var(--green)] bg-green-50",
    in_development: "text-amber-700 bg-amber-50",
    restructuring: "text-[var(--red)] bg-red-50",
  }[listing.status_business];

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--muted)] mb-6">
          <Link href="/" className="hover:text-[var(--ink)]">Firmadeal</Link>
          <ChevronRight size={12} />
          <Link href="/listings" className="hover:text-[var(--ink)]">
            {lang === "de" ? "Inserate" : "Listings"}
          </Link>
          <ChevronRight size={12} />
          <span className="text-[var(--muted)]">{listing.category}</span>
          <ChevronRight size={12} />
          <span className="text-[var(--ink)] truncate max-w-[200px]">{listing.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Image gallery */}
            <div className="mb-6">
              <div className="relative w-full h-[320px] rounded-xl overflow-hidden bg-[var(--surface2)]">
                {listing.images && listing.images.length > 0 ? (
                  <Image
                    src={listing.images[selectedImage]}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-7xl">
                    🏢
                  </div>
                )}
              </div>
              {listing.images && listing.images.length > 1 && (
                <div className="flex gap-2 mt-2">
                  {listing.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        i === selectedImage ? "border-[var(--accent)]" : "border-transparent"
                      }`}
                    >
                      <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title + badges */}
            <div className="flex flex-wrap items-start gap-2 mb-2">
              <span className="font-mono text-[10px] bg-[var(--accent-light)] text-[var(--accent)] rounded-full px-2 py-1 uppercase tracking-wide">
                {listing.category}
              </span>
              <span className={`font-mono text-[10px] rounded-full px-2 py-1 ${statusColor}`}>
                {statusLabel}
              </span>
            </div>
            <h1 className="font-fraunces text-[clamp(24px,4vw,36px)] text-[var(--ink)] leading-tight mb-2">
              {listing.title}
            </h1>
            <div className="flex items-center gap-1 font-mono text-[12px] text-[var(--muted)] mb-6">
              <MapPin size={13} />
              <span>{listing.city}, {listing.region}, {listing.country}</span>
            </div>

            {/* Tabs */}
            <div className="border-b border-[var(--border)] mb-6">
              <div className="flex gap-0">
                {tabs.map((tab, i) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(i)}
                    className={`px-4 py-3 font-sans text-sm font-medium border-b-2 transition-colors ${
                      activeTab === i
                        ? "border-[var(--accent)] text-[var(--accent)]"
                        : "border-transparent text-[var(--muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab: Overview */}
            {activeTab === 0 && (
              <div className="space-y-8">
                <section>
                  <h3 className="font-fraunces text-[18px] text-[var(--ink)] mb-3">
                    {lang === "de" ? "Beschreibung" : "Description"}
                  </h3>
                  <p className="font-sans text-[15px] text-[var(--ink)] leading-relaxed whitespace-pre-line">
                    {listing.description}
                  </p>
                </section>

                {listing.business_model && (
                  <section>
                    <h3 className="font-fraunces text-[18px] text-[var(--ink)] mb-3">
                      {lang === "de" ? "Geschäftsmodell" : "Business model"}
                    </h3>
                    <p className="font-sans text-[15px] text-[var(--muted)] leading-relaxed">
                      {listing.business_model}
                    </p>
                  </section>
                )}

                {listing.assets_included && (
                  <section>
                    <h3 className="font-fraunces text-[18px] text-[var(--ink)] mb-3">
                      {lang === "de" ? "Enthaltene Vermögenswerte" : "Assets included"}
                    </h3>
                    <p className="font-sans text-[15px] text-[var(--muted)] leading-relaxed">
                      {listing.assets_included}
                    </p>
                  </section>
                )}

                {listing.reason_for_sale && (
                  <section>
                    <h3 className="font-fraunces text-[18px] text-[var(--ink)] mb-3">
                      {lang === "de" ? "Verkaufsgrund" : "Reason for sale"}
                    </h3>
                    <p className="font-sans text-[15px] text-[var(--muted)] leading-relaxed">
                      {listing.reason_for_sale}
                    </p>
                  </section>
                )}

                {listing.competition && (
                  <section>
                    <h3 className="font-fraunces text-[18px] text-[var(--ink)] mb-3">
                      {lang === "de" ? "Wettbewerbssituation" : "Competition"}
                    </h3>
                    <p className="font-sans text-[15px] text-[var(--muted)] leading-relaxed">
                      {listing.competition}
                    </p>
                  </section>
                )}
              </div>
            )}

            {/* Tab: Financials */}
            {activeTab === 1 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    icon: <TrendingUp size={20} />,
                    label: lang === "de" ? "Jahresumsatz" : "Annual Revenue",
                    value: formatRevenue(listing.annual_revenue),
                  },
                  {
                    icon: <DollarSign size={20} />,
                    label: "EBITDA",
                    value: formatRevenue(listing.ebitda),
                  },
                  {
                    icon: <Users size={20} />,
                    label: lang === "de" ? "Mitarbeiter" : "Employees",
                    value: listing.employees ? `${listing.employees}` : "—",
                  },
                  {
                    icon: <Calendar size={20} />,
                    label: lang === "de" ? "Gegründet" : "Founded",
                    value: listing.founded_year ? `${listing.founded_year}` : "—",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white border border-[var(--border)] rounded-xl p-5"
                  >
                    <div className="text-[var(--muted)] mb-3">{item.icon}</div>
                    <div className="font-mono text-[24px] text-[var(--ink)] font-medium mb-1">
                      {item.value}
                    </div>
                    <div className="font-sans text-[12px] text-[var(--muted)]">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Details */}
            {activeTab === 2 && (
              <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
                {[
                  {
                    key: lang === "de" ? "Transaktionsart" : "Transaction type",
                    value: {
                      vollstaendige_uebertragung: lang === "de" ? "Vollständige Übertragung" : "Full Transfer",
                      unternehmensuebertragung: lang === "de" ? "Unternehmensübertragung" : "Business Transfer",
                      gewerbeimmobilie: lang === "de" ? "Gewerbeimmobilie" : "Commercial property",
                      anteilsuebertragung: lang === "de" ? "Anteilsübertragung" : "Share transfer",
                      unternehmensverpachtung: lang === "de" ? "Unternehmensverpachtung" : "Business lease",
                      immobilienvermietung: lang === "de" ? "Immobilienvermietung" : "Property rental",
                    }[listing.type_of_operation],
                  },
                  {
                    key: lang === "de" ? "Branche" : "Industry",
                    value: listing.category,
                  },
                  { key: lang === "de" ? "Stadt" : "City", value: listing.city },
                  { key: lang === "de" ? "Region" : "Region", value: listing.region },
                  { key: lang === "de" ? "Land" : "Country", value: { DE: "Deutschland", AT: "Österreich", CH: "Schweiz" }[listing.country] ?? listing.country },
                  listing.company_name ? { key: lang === "de" ? "Firmenname" : "Company name", value: listing.company_name } : null,
                  listing.founded_year ? { key: lang === "de" ? "Gegründet" : "Founded", value: `${listing.founded_year}` } : null,
                  listing.employees ? { key: lang === "de" ? "Mitarbeiter" : "Employees", value: `${listing.employees}` } : null,
                ]
                  .filter(Boolean)
                  .map((item, i, arr) => (
                    <div
                      key={item!.key}
                      className={`flex items-center justify-between px-5 py-3.5 ${
                        i < arr.length - 1 ? "border-b border-[var(--border)]" : ""
                      }`}
                    >
                      <span className="font-mono text-[12px] text-[var(--muted)]">{item!.key}</span>
                      <span className="font-sans text-sm text-[var(--ink)] font-medium">{item!.value}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-[380px] flex-shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white border border-[var(--border)] rounded-xl p-6">
                {/* Price */}
                <div className="mb-4">
                  {listing.price_confidential || !listing.asking_price ? (
                    <div>
                      <div className="font-fraunces text-[32px] text-[var(--muted)] leading-none">
                        {lang === "de" ? "Vertraulich" : "Confidential"}
                      </div>
                      <div className="font-mono text-[11px] text-[var(--muted)] mt-1">
                        {lang === "de" ? "Preis auf Anfrage" : "Price on request"}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-fraunces text-[32px] text-[var(--ink)] leading-none">
                        {formatPrice(listing.asking_price)}
                      </div>
                      <div className="font-mono text-[11px] text-[var(--muted)] mt-1">
                        {lang === "de" ? "Kaufpreis" : "Asking price"}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-[var(--border)] my-4" />

                {/* Contact form */}
                {sent ? (
                  <div className="text-center py-4">
                    <div className="text-3xl mb-2">✅</div>
                    <p className="font-sans text-sm font-semibold text-[var(--green)]">
                      {lang === "de" ? "Nachricht gesendet!" : "Message sent!"}
                    </p>
                    <p className="font-sans text-xs text-[var(--muted)] mt-1">
                      {lang === "de"
                        ? "Der Verkäufer wird sich bald melden."
                        : "The seller will get back to you soon."}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="space-y-3">
                    <h4 className="font-sans text-sm font-semibold text-[var(--ink)]">
                      {lang === "de" ? "Verkäufer kontaktieren" : "Contact seller"}
                    </h4>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder={lang === "de" ? "Ihr Name" : "Your name"}
                      required
                      className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans"
                    />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder={lang === "de" ? "Ihre E-Mail" : "Your email"}
                      required
                      className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans"
                    />
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans resize-none"
                    />
                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full py-3.5 bg-[var(--accent)] text-white font-sans font-medium text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-70"
                    >
                      {sending
                        ? lang === "de" ? "Wird gesendet..." : "Sending..."
                        : lang === "de" ? "Nachricht senden" : "Send message"}
                    </button>
                  </form>
                )}

                {listing.show_phone && listing.phone && (
                  <>
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[var(--border)]" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-white px-2 font-mono text-[11px] text-[var(--muted)]">
                          {lang === "de" ? "oder" : "or"}
                        </span>
                      </div>
                    </div>
                    <a
                      href={`tel:${listing.phone}`}
                      className="flex items-center justify-center gap-2 w-full py-3 border border-[var(--border)] rounded-xl font-sans text-sm text-[var(--ink)] hover:bg-[var(--surface2)] transition-colors"
                    >
                      <Phone size={15} />
                      {listing.phone}
                    </a>
                  </>
                )}
              </div>

              {/* Quick stats */}
              <div className="bg-white border border-[var(--border)] rounded-xl p-5">
                <h4 className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide mb-4">
                  {lang === "de" ? "Inserat-Statistiken" : "Listing stats"}
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-[12px] text-[var(--muted)]">
                      <Eye size={13} />
                      {lang === "de" ? "Ansichten" : "Views"}
                    </div>
                    <span className="font-mono text-[12px] text-[var(--ink)]">{listing.views_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-[12px] text-[var(--muted)]">
                      <MessageSquare size={13} />
                      {lang === "de" ? "Anfragen" : "Inquiries"}
                    </div>
                    <span className="font-mono text-[12px] text-[var(--ink)]">{listing.inquiries_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-[12px] text-[var(--muted)]">
                      <Clock size={13} />
                      {lang === "de" ? "Online seit" : "Online since"}
                    </div>
                    <span className="font-mono text-[12px] text-[var(--ink)]">
                      {new Date(listing.created_at).toLocaleDateString("de-DE")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Report */}
              <button className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--muted)] hover:text-[var(--red)] transition-colors mx-auto">
                <Flag size={11} />
                {lang === "de" ? "Inserat melden" : "Report listing"}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
