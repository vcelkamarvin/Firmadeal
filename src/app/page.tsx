"use client";

import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ListingCard from "@/components/ListingCard";
import ListingGridCard from "@/components/ListingGridCard";
import { CATEGORIES } from "@/lib/types";
import type { Listing } from "@/lib/types";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import type { BusinessStatus } from "@/lib/types";
import ValuationCalculator from "@/components/ValuationCalculator";
import KaufgesucheSection from "@/components/KaufgesucheSection";

// ── Constants ──────────────────────────────────────────────────────────────────

const BIZ_TYPES = ["Handwerksbetrieb", "Gastronomiebetrieb", "IT-Unternehmen", "Produktionsbetrieb", "Dienstleister", "Online-Business"];

const ANON_LISTINGS = [
  { id: 1, cat: "Gastronomie",   city: "München",   revenue: "€420k", ebitda: "€85k",  price: "€280k",       emp: 8,  years: 12 },
  { id: 2, cat: "IT & Software", city: "Hamburg",   revenue: "€680k", ebitda: "€190k", price: "€1,1M",       emp: 5,  years: 7  },
  { id: 3, cat: "Handwerk",      city: "Berlin",    revenue: "€310k", ebitda: "€62k",  price: "€195k",       emp: 6,  years: 18 },
  { id: 4, cat: "Einzelhandel",  city: "Frankfurt", revenue: "€520k", ebitda: "€78k",  price: "Auf Anfrage", emp: 12, years: 9  },
];

const CAT_PILLS = ["Alle", "Gastronomie", "IT & Software", "Handwerk", "Einzelhandel", "Produktion", "Dienstleistung"];

// ── Inline catalog ─────────────────────────────────────────────────────────────

function InlineCatalog({ lang }: { lang: string }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [status, setStatus] = useState<BusinessStatus | "">("");
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    createClient()
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data }) => { if (data) setListings(data); });
  }, []);

  const filtered = useMemo(() => {
    let list = [...listings];
    if (q) {
      const lq = q.toLowerCase();
      list = list.filter((l) => l.title.toLowerCase().includes(lq) || l.city.toLowerCase().includes(lq) || l.category.toLowerCase().includes(lq));
    }
    if (cat)      list = list.filter((l) => l.category === cat);
    if (status)   list = list.filter((l) => l.status_business === status);
    if (priceMax) list = list.filter((l) => l.price_confidential || (l.asking_price !== null && l.asking_price <= parseInt(priceMax) * 1000));

    switch (sort) {
      case "price_asc":  list.sort((a, b) => (a.asking_price ?? Infinity) - (b.asking_price ?? Infinity)); break;
      case "price_desc": list.sort((a, b) => (b.asking_price ?? -Infinity) - (a.asking_price ?? -Infinity)); break;
      case "popular":    list.sort((a, b) => b.views_count - a.views_count); break;
      default:           list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [q, cat, status, priceMax, sort, listings]);

  const shown = filtered.slice(0, 12);
  const hasMore = filtered.length > 12;
  const hasFilters = q || cat || status || priceMax;

  const EmptyState = () => (
    <div className="py-16 text-center max-w-lg mx-auto px-4">
      <div className="text-4xl mb-4">🔒</div>
      <h3 className="font-sans text-[18px] font-bold text-[var(--ink)] mb-3">
        {lang === "de" ? "Die meisten Mandate sind vertraulich" : "Most mandates are confidential"}
      </h3>
      <p className="font-sans text-[14px] text-[var(--muted)] leading-relaxed mb-6">
        {lang === "de"
          ? "Aus Diskretionsgründen zeigen wir nur einen kleinen, kuratierten Teil unserer Mandate öffentlich. Suchen Sie etwas Bestimmtes? Hinterlegen Sie Ihr Suchprofil — wir melden uns, sobald ein passendes Unternehmen verfügbar ist."
          : "For discretion reasons, only a small curated portion of our mandates are shown publicly. Looking for something specific? Leave your search profile and we'll reach out when a match becomes available."}
      </p>
      <Link
        href="/sell"
        className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-sans font-bold px-6 py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors text-[14px]"
      >
        {lang === "de" ? "Unternehmen vertraulich einreichen" : "Submit your business confidentially"}
      </Link>
    </div>
  );

  return (
    <section id="listings" className="bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <p className="font-sans text-[11px] font-bold text-[var(--accent)] uppercase tracking-[0.2em] mb-1">
              {lang === "de" ? "Kuratierte Auswahl" : "Curated selection"}
            </p>
            <h2 className="font-sans text-[24px] font-bold text-[var(--ink)] tracking-tight">
              {lang === "de" ? "Öffentliche Mandate" : "Public mandates"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setViewMode("grid")}
                aria-label="Kachelansicht"
                aria-pressed={viewMode === "grid"}
                title="Kachelansicht"
                style={{ width: 34, height: 34, borderRadius: 6, border: "1px solid #e5e5e5", background: viewMode === "grid" ? "#2d5a3d" : "transparent", color: viewMode === "grid" ? "white" : "#888", cursor: "pointer", fontSize: 16 }}
              >⊞</button>
              <button
                onClick={() => setViewMode("list")}
                aria-label="Listenansicht"
                aria-pressed={viewMode === "list"}
                title="Listenansicht"
                style={{ width: 34, height: 34, borderRadius: 6, border: "1px solid #e5e5e5", background: viewMode === "list" ? "#2d5a3d" : "transparent", color: viewMode === "list" ? "white" : "#888", cursor: "pointer", fontSize: 16 }}
              >☰</button>
            </div>
            <Link href="/sell" className="font-sans text-[13px] font-semibold text-[var(--accent)] hover:underline">
              {lang === "de" ? "Unternehmen vertraulich einreichen" : "Submit your business"}
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-[var(--border)] rounded-xl p-4 mb-1">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={lang === "de" ? "Suchen..." : "Search..."}
            className="w-full px-3 py-2.5 mb-3 font-sans border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)]"
          />
          <div className="flex flex-wrap gap-2 items-center">
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="flex-1 min-w-[120px] px-3 py-2 font-sans border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white">
              <option value="">{lang === "de" ? "Alle Branchen" : "All industries"}</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="flex-1 min-w-[100px] px-3 py-2 font-sans border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white">
              <option value="newest">{lang === "de" ? "Neueste" : "Newest"}</option>
              <option value="price_asc">{lang === "de" ? "Preis ↑" : "Price ↑"}</option>
              <option value="price_desc">{lang === "de" ? "Preis ↓" : "Price ↓"}</option>
              <option value="popular">{lang === "de" ? "Beliebteste" : "Most viewed"}</option>
            </select>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-3 py-2 font-sans border rounded-lg transition-colors whitespace-nowrap ${filtersOpen ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)]"}`}
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">{lang === "de" ? "Mehr Filter" : "More filters"}</span>
            </button>
            {hasFilters && (
              <button onClick={() => { setQ(""); setCat(""); setStatus(""); setPriceMax(""); }} className="flex items-center gap-1 font-mono text-[11px] text-[var(--muted)] hover:text-[var(--red)]">
                <X size={12} /> {lang === "de" ? "Reset" : "Reset"}
              </button>
            )}
          </div>
          {filtersOpen && (
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-[var(--border)]">
              <select value={status} onChange={(e) => setStatus(e.target.value as BusinessStatus | "")} className="px-3 py-2 text-sm font-sans border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white">
                <option value="">{lang === "de" ? "Alle Status" : "All statuses"}</option>
                <option value="active_profitable">{lang === "de" ? "Aktiv & Profitabel" : "Active & Profitable"}</option>
                <option value="in_development">{lang === "de" ? "In Entwicklung" : "In development"}</option>
                <option value="restructuring">{lang === "de" ? "Sanierungsbedarf" : "Needs restructuring"}</option>
              </select>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-[var(--muted)]">{lang === "de" ? "Max. Preis" : "Max price"}</span>
                <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="T€" className="w-24 px-3 py-2 text-sm font-mono border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)]" />
              </div>
            </div>
          )}
        </div>

        {/* Grid or list rendering */}
        {viewMode === "grid" ? (
          <>
            {shown.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {shown.map((l, i) => <ListingGridCard key={l.id} listing={l} priority={i < 4} />)}
              </div>
            )}
            {hasMore && (
              <div className="text-center mt-8">
                <Link href="/listings" className="inline-flex items-center gap-2 border border-[var(--accent)] text-[var(--accent)] font-sans font-semibold px-8 py-3 rounded-full hover:bg-[var(--accent)] hover:text-white transition-all">
                  {lang === "de" ? `Alle ${filtered.length} ansehen →` : `View all ${filtered.length} →`}
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="hidden md:flex items-center gap-4 px-5 py-2">
              <div className="w-14 flex-shrink-0" />
              <div className="flex-1 font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{lang === "de" ? "Unternehmen" : "Business"}</div>
              <div className="w-[90px] text-right font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{lang === "de" ? "Umsatz" : "Revenue"}</div>
              <div className="w-[96px] font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">EBITDA</div>
              <div className="w-[100px] text-right font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{lang === "de" ? "Preis" : "Price"}</div>
              <div className="w-[22px]" />
            </div>
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              {shown.length === 0 ? <EmptyState /> : shown.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
            {hasMore && (
              <div className="text-center mt-4">
                <Link href="/listings" className="inline-flex items-center gap-2 border border-[var(--accent)] text-[var(--accent)] font-sans font-semibold px-8 py-3 rounded-full hover:bg-[var(--accent)] hover:text-white transition-all">
                  {lang === "de" ? `Alle ${filtered.length} →` : `All ${filtered.length} →`}
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ── Blog teaser ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  verkauf: "#2d5a3d", kauf: "#1d4ed8", bewertung: "#7c3aed", nachfolge: "#d97706", ratgeber: "#0891b2",
};

function BlogTeaser({ lang }: { lang: string }) {
  const [posts, setPosts] = useState<{ id: string; slug: string; title: string; excerpt: string; category: string; reading_time_minutes: number }[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, category, reading_time_minutes")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => { if (data) setPosts(data); });
  }, []);

  if (posts.length === 0) return null;

  return (
    <section className="bg-[var(--bg)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-[0.2em] mb-1">
              {lang === "de" ? "Wissen & Ratgeber" : "Guides & Knowledge"}
            </p>
            <h2 className="font-sans text-[24px] font-bold text-[var(--ink)] tracking-tight">
              {lang === "de" ? "Aktuelle Ratgeber-Artikel" : "Latest guides"}
            </h2>
          </div>
          <Link href="/blog" className="font-sans text-[13px] text-[var(--accent)] font-semibold hover:underline whitespace-nowrap">
            {lang === "de" ? "Alle Artikel →" : "All articles →"}
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md hover:border-[var(--accent)] transition-all flex flex-col">
              <div className="h-1.5" style={{ background: CATEGORY_COLORS[post.category] ?? "#2d5a3d" }} />
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-sans text-[15px] font-bold text-[var(--ink)] leading-snug mb-2 group-hover:text-[var(--accent)] transition-colors flex-1">{post.title}</h3>
                <p className="font-sans text-[12px] text-[var(--muted)] line-clamp-2 mb-3">{post.excerpt}</p>
                <span className="font-sans text-[11px] text-[var(--muted)]">{post.reading_time_minutes} Min. Lesezeit</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Tab switcher section ────────────────────────────────────────────────────────

function TabSwitcherSection({ lang }: { lang: string }) {
  const [tab, setTab] = useState<"verkaufen" | "kaufen">("verkaufen");
  const [catFilter, setCatFilter] = useState("Alle");
  const [searchQ, setSearchQ] = useState("");

  const filteredAnon = ANON_LISTINGS.filter((l) => {
    if (catFilter !== "Alle" && l.cat !== catFilter) return false;
    if (searchQ && !l.cat.toLowerCase().includes(searchQ.toLowerCase()) && !l.city.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="bg-white border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="flex justify-center mb-10">
          <div className="flex bg-[var(--surface2)] rounded-xl p-1 gap-1">
            {(["verkaufen", "kaufen"] as const).map((id) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`font-sans font-semibold text-[14px] sm:text-[15px] px-5 sm:px-8 py-3 rounded-lg transition-all duration-200 ${
                  tab === id ? "bg-[var(--accent)] text-white shadow-sm" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {id === "verkaufen"
                  ? (lang === "de" ? "Ich möchte verkaufen" : "I want to sell")
                  : (lang === "de" ? "Ich möchte kaufen"    : "I want to buy")}
              </button>
            ))}
          </div>
        </div>

        {/* VERKAUFEN tab */}
        {tab === "verkaufen" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-[0.2em] mb-2">
                {lang === "de" ? "Für Unternehmer" : "For business owners"}
              </p>
              <h2 className="font-sans text-[26px] sm:text-[34px] font-bold text-[var(--ink)] tracking-tight leading-tight mb-4">
                {lang === "de"
                  ? "Verkaufen Sie Ihr Unternehmen — diskret und direkt."
                  : "Sell your business — discreetly and directly."}
              </h2>
              <p className="font-sans text-[15px] text-[var(--muted)] leading-relaxed mb-6">
                {lang === "de"
                  ? "Wir sprechen passende Käufer aus unserem privaten Netzwerk gezielt an — anonym, ohne Makler, 0% Provision."
                  : "We reach out to suitable buyers from our private network — anonymous, no broker, 0% commission."}
              </p>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[
                  { stat: "0%",    label: lang === "de" ? "Provision" : "Commission" },
                  { stat: "100%",  label: lang === "de" ? "Anonym"    : "Anonymous"  },
                  { stat: "DSGVO", label: lang === "de" ? "Konform"   : "Compliant"  },
                ].map((k) => (
                  <div key={k.stat} className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3 text-center">
                    <div className="font-sans text-[18px] font-bold text-[var(--accent)]">{k.stat}</div>
                    <div className="font-sans text-[11px] text-[var(--muted)] mt-0.5">{k.label}</div>
                  </div>
                ))}
              </div>
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-bold px-7 py-4 rounded-xl hover:bg-[var(--accent-hover)] transition-colors text-[15px]"
              >
                {lang === "de" ? "Unternehmen vertraulich einreichen →" : "Submit confidentially →"}
              </Link>
              <p className="font-sans text-[12px] text-[var(--muted)] mt-2">
                {lang === "de" ? "Einmalig €87 · 0% Provision · Anonym bis zum Abschluss" : "One-time €87 · 0% commission · Anonymous until closing"}
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-[var(--surface2)] rounded-2xl p-6 space-y-3">
                {[
                  { step: lang === "de" ? "Vertraulich einreichen" : "Submit confidentially", done: true },
                  { step: lang === "de" ? "Wir matchen mit passenden Käufern" : "We match with suitable buyers", done: true },
                  { step: lang === "de" ? "Anonym in Kontakt treten" : "Connect anonymously", done: true },
                  { step: lang === "de" ? "Abschluss" : "Close the sale", done: false },
                ].map((s, i) => (
                  <div key={s.step} className="flex items-center gap-4 bg-white rounded-xl p-4 border border-[var(--border)] shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white font-bold text-[13px] flex items-center justify-center flex-shrink-0">{i + 1}</div>
                    <span className="font-sans text-[14px] text-[var(--ink)] font-medium flex-1">{s.step}</span>
                    {s.done
                      ? <span className="font-sans text-[11px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">{lang === "de" ? "Erledigt" : "Done"}</span>
                      : <span className="font-sans text-[11px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full whitespace-nowrap">{lang === "de" ? "Ausstehend" : "Pending"}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* KAUFEN tab */}
        {tab === "kaufen" && (
          <div>
            <div className="text-center mb-8">
              <p className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-[0.2em] mb-2">
                {lang === "de" ? "Für Investoren & Käufer" : "For investors & buyers"}
              </p>
              <h2 className="font-sans text-[26px] sm:text-[34px] font-bold text-[var(--ink)] tracking-tight leading-tight mb-3">
                {lang === "de" ? "Finden Sie Ihr Traumunternehmen" : "Find your next acquisition"}
              </h2>
              <p className="font-sans text-[15px] text-[var(--muted)]">
                {lang === "de"
                  ? "Aktuelle Kaufgelegenheiten in Deutschland — direkt, ohne Makler."
                  : "Live acquisition opportunities across Germany — direct, no broker."}
              </p>
            </div>

            <div className="max-w-xl mx-auto mb-5">
              <input
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder={lang === "de" ? "Branche oder Stadt suchen…" : "Search industry or city…"}
                className="w-full px-4 py-3.5 border-2 border-[var(--border)] rounded-xl font-sans text-[15px] outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-3 mb-6" style={{ scrollbarWidth: "none" }}>
              {CAT_PILLS.map((p) => (
                <button
                  key={p}
                  onClick={() => setCatFilter(p)}
                  className={`flex-shrink-0 font-sans text-[13px] font-medium px-4 py-2 rounded-full border transition-all ${
                    catFilter === p
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-white text-[var(--muted)] border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {filteredAnon.length === 0 ? (
                <div className="col-span-full text-center py-10">
                  <p className="font-sans text-[14px] text-[var(--muted)]">
                    {lang === "de" ? "Keine Ergebnisse." : "No results."}
                  </p>
                </div>
              ) : filteredAnon.map((l) => (
                <Link href="/listings" key={l.id} className="bg-white border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)] hover:shadow-md transition-all flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-sans text-[11px] font-bold text-[var(--accent)] bg-[var(--accent-light)] px-2.5 py-1 rounded-full">{l.cat}</span>
                    <span className="font-sans text-[11px] text-[var(--muted)]">Anonym</span>
                  </div>
                  <p className="font-sans text-[12px] text-[var(--muted)] mb-3">{l.city} · {l.years} {lang === "de" ? "Jahre" : "years"}</p>
                  <div className="space-y-1.5 mb-4 flex-1">
                    <div className="flex justify-between">
                      <span className="font-sans text-[12px] text-[var(--muted)]">{lang === "de" ? "Umsatz" : "Revenue"}</span>
                      <span className="font-sans text-[12px] font-semibold text-[var(--ink)]">{l.revenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-[12px] text-[var(--muted)]">EBITDA</span>
                      <span className="font-sans text-[12px] font-semibold text-green-600">{l.ebitda}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-sans text-[12px] text-[var(--muted)]">{lang === "de" ? "Mitarbeiter" : "Employees"}</span>
                      <span className="font-sans text-[12px] text-[var(--ink)]">{l.emp}</span>
                    </div>
                  </div>
                  <div className="border-t border-[var(--border)] pt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-[11px] text-[var(--muted)]">{lang === "de" ? "Kaufpreis" : "Asking price"}</span>
                      <span className="font-sans text-[15px] font-bold text-[var(--ink)]">{l.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-sans font-bold px-7 py-4 rounded-xl hover:bg-[var(--accent-hover)] transition-colors text-[15px]"
                >
                  {lang === "de" ? "Kuratierte Auswahl ansehen →" : "View curated selection →"}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { lang } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subError, setSubError] = useState("");
  const [bizTypeIdx, setBizTypeIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setBizTypeIdx((i) => (i + 1) % BIZ_TYPES.length), 2500);
    return () => clearInterval(t);
  }, []);

  const faqs = lang === "de" ? [
    { q: "Gibt es eine Provision?",                          a: "Nein. 0% Provision. Sie behalten 100% des Verkaufspreises." },
    { q: "Wie lange dauert ein Verkauf?",                    a: "Im Schnitt 4–9 Monate. Vollständige Finanzdaten beschleunigen den Prozess erheblich." },
    { q: "Bleibt mein Inserat anonym?",                      a: "Ja. Sie entscheiden, wann Sie Ihren Namen und Firmennamen freigeben." },
    { q: "Welche Unterlagen brauche ich?",                   a: "BWA der letzten 3 Jahre, Jahresabschlüsse, anonymisierte Kundenliste, Mietverträge." },
    { q: "Wie kontaktiere ich einen Verkäufer?",             a: "Direkt über das Kontaktformular im Inserat. Kein Makler, keine Wartezeit." },
    { q: "Warum sehe ich nur wenige öffentliche Inserate?",  a: "Die meisten Mandate sind vertraulich und werden nicht öffentlich gezeigt — das schützt Verkäufer und Mitarbeiter. Öffentlich erscheint nur eine kuratierte Auswahl." },
  ] : [
    { q: "Is there a commission?",                           a: "No. 0% commission. You keep 100% of the sale price." },
    { q: "How long does a sale take?",                       a: "On average 4–9 months. Complete financial data significantly speeds up the process." },
    { q: "Does my listing stay anonymous?",                  a: "Yes. You decide when to reveal your name and company." },
    { q: "What documents do I need?",                        a: "P&L for last 3 years, annual accounts, anonymized customer list, rental agreements." },
    { q: "How do I contact a seller?",                       a: "Directly via the contact form in the listing. No broker, no waiting." },
    { q: "Why do I see only a few public listings?",         a: "Most mandates are confidential and not shown publicly — this protects sellers and employees. Only a curated selection appears publicly." },
  ];

  return (
    <div className="bg-[var(--bg)] home-page-wrapper">

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section
        className="hero-section"
        style={{
          background: "linear-gradient(135deg, #0d1f17 0%, #1a3329 60%, #2d5a3d 100%)",
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 w-full" style={{ position: "relative", zIndex: 1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left: copy */}
            <div>
              {/* Eyebrow */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "100px", padding: "6px 16px", marginBottom: "24px" }}>
                <span style={{ color: "#6dbf87", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {lang === "de" ? "Diskret · Direkt · 0% Provision" : "Discreet · Direct · 0% Commission"}
                </span>
              </div>

              {/* Headline */}
              <h1 className="hero-headline font-sans font-bold text-white tracking-tight mb-6" style={{ fontSize: "clamp(28px, 5vw, 58px)", lineHeight: 1.08 }}>
                {lang === "de"
                  ? "Verkaufen Sie Ihr Unternehmen — diskret und direkt."
                  : "Sell your business — discreetly and directly."}
              </h1>

              <p className="font-sans text-white/75 mb-8" style={{ fontSize: "17px", lineHeight: 1.65, maxWidth: "480px" }}>
                {lang === "de"
                  ? "Wir bringen Ihr Unternehmen vertraulich vor geprüfte Investoren. Die meisten Mandate laufen off-market — eine kuratierte Auswahl zeigen wir öffentlich. Kein Makler, 0% Provision."
                  : "We bring your business confidentially to vetted investors. Most mandates run off-market — we show a curated selection publicly. No broker, 0% commission."}
              </p>

              {/* Trust badges — 3 clean ones */}
              <div className="flex flex-wrap gap-2 mb-8">
                {[
                  { stat: "0%",  label: lang === "de" ? "Provision"                    : "Commission"              },
                  { stat: "🔒",  label: lang === "de" ? "Anonym bis zum Abschluss"     : "Anonymous to close"       },
                  { stat: "✓",   label: lang === "de" ? "Privates Investoren-Netzwerk" : "Private investor network" },
                ].map((b) => (
                  <div key={b.stat} style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "100px", padding: "8px 16px" }}>
                    <span className="font-sans font-bold text-white text-[13px]">{b.stat}</span>
                    <span className="font-sans text-white/65 text-[12px]">{b.label}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="hero-cta-row flex flex-wrap gap-4 items-center mb-8">
                <Link href="/sell" className="hero-cta-primary font-sans font-bold text-white rounded-lg hover:opacity-90 transition-opacity" style={{ background: "#2d5a3d", padding: "14px 28px", fontSize: "16px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  {lang === "de" ? "Unternehmen vertraulich einreichen →" : "Submit confidentially →"}
                </Link>
                <Link href="/listings" className="hero-cta-secondary font-sans font-semibold text-white/80 hover:text-white transition-colors" style={{ fontSize: "16px" }}>
                  {lang === "de" ? "Kuratierte Auswahl ansehen" : "View curated selection"}
                </Link>
              </div>

              {/* Trust line */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-8">
                {(lang === "de"
                  ? ["✓ Einmalig €87", "✓ 0% Provision", "✓ Anonym bis zum Abschluss"]
                  : ["✓ One-time €87", "✓ 0% commission", "✓ Anonymous until closing"]
                ).map((item) => (
                  <span key={item} className="font-sans text-[13px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: hero calculator */}
            <div className="hidden lg:block">
              <ValuationCalculator variant="hero" />
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────────────────────────── */}
      <div className="bg-[var(--surface2)] overflow-hidden py-2.5 border-b border-[var(--border)]">
        <div className="animate-marquee">
          {["0% Provision", "Anonym", "€87 einmalig", "DSGVO-konform", "0% Provision", "Anonym", "€87 einmalig", "DSGVO-konform"].map((item, i) => (
            <span key={i} className="flex items-center gap-5 px-5 font-mono text-[11px] text-[var(--muted)] whitespace-nowrap">
              {item}
              <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
            </span>
          ))}
        </div>
      </div>

      {/* ── SO POSITIONIEREN WIR SIE ─────────────────────────────────────────── */}
      <section className="bg-white border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <p className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-[0.2em] mb-2 text-center">
            {lang === "de" ? "Unser Ansatz" : "Our approach"}
          </p>
          <h2 className="font-sans text-[22px] font-bold text-[var(--ink)] tracking-tight text-center mb-10">
            {lang === "de" ? "So positionieren wir Sie" : "How we position you"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🤝",
                de_title: "Privates Investoren-Netzwerk",
                en_title: "Private investor network",
                de_body: "Wir sprechen passende Käufer gezielt an — Private Equity, Family Offices, Search Funds und strategische Investoren.",
                en_body: "We target suitable buyers directly — Private Equity, Family Offices, Search Funds and strategic investors.",
              },
              {
                icon: "🔒",
                de_title: "Vertraulich & off-market",
                en_title: "Confidential & off-market",
                de_body: "Ihr Unternehmen wird nicht öffentlich ausgeschrieben. Sie bleiben anonym, bis Sie sich für ein Gespräch entscheiden.",
                en_body: "Your business is not publicly advertised. You remain anonymous until you decide to have a conversation.",
              },
              {
                icon: "📋",
                de_title: "Kuratierte öffentliche Auswahl",
                en_title: "Curated public selection",
                de_body: "Wenn Sie maximale Reichweite wollen, zeigen wir Ihr Mandat zusätzlich in unserer öffentlichen Auswahl.",
                en_body: "If you want maximum reach, we additionally show your mandate in our public curated selection.",
              },
            ].map((card) => (
              <div key={card.de_title} className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6">
                <div className="text-3xl mb-4">{card.icon}</div>
                <h3 className="font-sans text-[16px] font-bold text-[var(--ink)] mb-3">
                  {lang === "de" ? card.de_title : card.en_title}
                </h3>
                <p className="font-sans text-[14px] text-[var(--muted)] leading-relaxed">
                  {lang === "de" ? card.de_body : card.en_body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── KAUFGESUCHE ──────────────────────────────────────────────────────── */}
      <KaufgesucheSection />

      {/* ── TAB SWITCHER ─────────────────────────────────────────────────────── */}
      <TabSwitcherSection lang={lang} />

      {/* ── INLINE CATALOG ───────────────────────────────────────────────────── */}
      <InlineCatalog lang={lang} />

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="bg-[var(--accent)] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <p className="font-mono text-[11px] text-white/40 uppercase tracking-[0.2em] mb-2 text-center">
            {lang === "de" ? "So funktioniert es" : "How it works"}
          </p>
          <h2 className="font-sans text-[22px] font-bold text-white tracking-tight text-center mb-10">
            {lang === "de" ? "Vom Einreichen zum Abschluss" : "From submission to closing"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                n: "01",
                de: "Vertraulich einreichen",
                en: "Submit confidentially",
                de2: "Ihr Unternehmen in wenigen Minuten einreichen. Einmalig €87.",
                en2: "Submit your business in a few minutes. One-time €87.",
              },
              {
                n: "02",
                de: "Wir matchen",
                en: "We match",
                de2: "Wir gleichen Ihr Profil mit unserem Investoren-Netzwerk ab und sprechen passende Käufer an.",
                en2: "We match your profile with our investor network and approach suitable buyers.",
              },
              {
                n: "03",
                de: "Anonym in Kontakt",
                en: "Connect anonymously",
                de2: "Interessenten erreichen Sie direkt — anonym, ohne Makler dazwischen.",
                en2: "Interested parties reach you directly — anonymously, without a broker in between.",
              },
              {
                n: "04",
                de: "Abschluss",
                en: "Close",
                de2: "Due Diligence, Vertrag, Übergabe. Sie behalten die Kontrolle.",
                en2: "Due diligence, contract, handover. You stay in control.",
              },
            ].map((s) => (
              <div key={s.n}>
                <div className="font-mono text-[32px] font-bold text-white/10 mb-3">{s.n}</div>
                <h3 className="font-sans text-[15px] font-bold text-white mb-2">{lang === "de" ? s.de : s.en}</h3>
                <p className="font-sans text-[13px] text-white/50 leading-relaxed">{lang === "de" ? s.de2 : s.en2}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANONYMITY PROTECTION ─────────────────────────────────────────────── */}
      <section className="bg-white border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-[0.2em] mb-2 text-center">
            {lang === "de" ? "Datenschutz" : "Privacy"}
          </p>
          <h2 className="font-sans text-[20px] font-bold text-[var(--ink)] tracking-tight text-center mb-8">
            {lang === "de" ? "So schützen wir Ihre Anonymität" : "How we protect your anonymity"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: "🔒",
                de_t: "Kein Firmenname öffentlich",
                en_t: "No company name public",
                de_b: "Wir veröffentlichen Ihre Firma erst nach Ihrer ausdrücklichen Freigabe — kein Name, kein Standort.",
                en_b: "We publish your company only after your explicit approval — no name, no location.",
              },
              {
                icon: "🤝",
                de_t: "Sie geben Kontakte einzeln frei",
                en_t: "You approve each contact",
                de_b: "Sie entscheiden für jeden Interessenten separat, welche Details Sie freigeben. Volle Kontrolle.",
                en_b: "You decide individually for each prospect what details to share. Full control.",
              },
              {
                icon: "📋",
                de_t: "NDA vor Detailinfos",
                en_t: "NDA before details",
                de_b: "Vor der Übergabe vertraulicher Unterlagen wird eine NDA-Vereinbarung unterzeichnet.",
                en_b: "Before sharing confidential documents, an NDA is signed.",
              },
            ].map((step) => (
              <div key={step.de_t} className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl p-6 text-center">
                <div className="text-3xl mb-3">{step.icon}</div>
                <h3 className="font-sans text-[15px] font-bold text-[var(--ink)] mb-2">
                  {lang === "de" ? step.de_t : step.en_t}
                </h3>
                <p className="font-sans text-[13px] text-[var(--muted)] leading-relaxed">
                  {lang === "de" ? step.de_b : step.en_b}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="bg-[var(--surface2)] border-t border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="font-sans text-[22px] font-bold text-[var(--ink)] tracking-tight text-center mb-8">
            {lang === "de" ? "Häufige Fragen" : "Frequently asked questions"}
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-sans text-[14px] font-semibold text-[var(--ink)]">{faq.q}</span>
                  <ChevronDown size={15} className={`text-[var(--muted)] flex-shrink-0 ml-4 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="faq-answer px-5 pb-5">
                    <p className="font-sans text-[13px] text-[var(--muted)] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOG TEASER ──────────────────────────────────────────────────────── */}
      <BlogTeaser lang={lang} />

      {/* ── NEWSLETTER ───────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-[0.2em] mb-3">
                {lang === "de" ? "Käufer-Radar" : "Buyer radar"}
              </p>
              <h2 className="font-sans text-[22px] font-bold text-[var(--ink)] tracking-tight mb-3">
                {lang === "de" ? "Passende Kaufgesuche & Mandate, sobald verfügbar" : "Matching buyer mandates, as soon as available"}
              </h2>
              <p className="font-sans text-[14px] text-[var(--muted)] leading-relaxed">
                {lang === "de"
                  ? "Hinterlegen Sie Ihr Suchprofil — wir informieren Sie, sobald passende Angebote vorliegen. Jederzeit abmeldbar."
                  : "Leave your search profile — we'll notify you as soon as matching offers are available. Unsubscribe anytime."}
              </p>
            </div>
            <div>
              {subscribed ? (
                <div className="bg-[var(--accent-light)] border border-[var(--accent)]/20 rounded-xl p-5">
                  <p className="font-sans text-[15px] font-bold text-[var(--accent)]">
                    {lang === "de" ? "Angemeldet!" : "Subscribed!"}
                  </p>
                  <p className="font-sans text-sm text-[var(--muted)] mt-1">
                    {lang === "de" ? "Sie erhalten Ihre erste E-Mail diese Woche." : "You'll receive your first email this week."}
                  </p>
                </div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSubError("");
                  const res = await fetch("/api/newsletter", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                  if (res.ok) {
                    setSubscribed(true);
                  } else {
                    const j = await res.json();
                    setSubError(j.error === "duplicate" ? "Bereits registriert." : "Fehler. Bitte erneut versuchen.");
                  }
                }} className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setSubError(""); }}
                      placeholder={lang === "de" ? "ihre@email.de" : "your@email.com"}
                      required
                      className="flex-1 px-4 py-3 border border-[var(--border)] rounded-xl text-sm font-sans outline-none focus:border-[var(--accent)]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 bg-[var(--accent)] text-white font-sans font-semibold text-sm rounded-xl hover:bg-[var(--accent-hover)] transition-colors whitespace-nowrap"
                      style={{ minHeight: 44 }}
                    >
                      {lang === "de" ? "Anmelden" : "Subscribe"}
                    </button>
                  </div>
                  {subError && (
                    <p className="font-sans text-[13px] text-[var(--red)]">{subError}</p>
                  )}
                </form>
              )}
              <p className="font-mono text-[10px] text-[var(--muted)] mt-2">
                {lang === "de" ? "Kein Spam · DSGVO-konform" : "No spam · GDPR compliant"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="bg-[var(--accent)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-sans text-[28px] font-bold text-white tracking-tight leading-tight mb-2">
                {lang === "de" ? "Bereit, vertraulich zu starten?" : "Ready to start confidentially?"}
              </h2>
              <p className="font-sans text-[15px] text-white/60">
                {lang === "de"
                  ? "Einmalig €87 · Anonym · 0% Provision · Kein Makler"
                  : "One-time €87 · Anonymous · 0% commission · No broker"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sell"
                className="flex items-center gap-2 bg-white text-[var(--accent)] font-sans font-bold px-8 py-3.5 rounded-full hover:bg-white/90 transition-colors"
              >
                {lang === "de" ? "Unternehmen vertraulich einreichen →" : "Submit confidentially →"}
              </Link>
              <Link
                href="/pricing"
                className="flex items-center gap-2 border border-white/30 text-white font-sans font-semibold px-6 py-3.5 rounded-full hover:bg-white/10 transition-colors"
              >
                {lang === "de" ? "Preise ansehen" : "View pricing"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── MOBILE STICKY CTA ─────────────────────────────────────────────────── */}
      {/* Shown only on mobile (≤768px) via CSS class; hidden on desktop */}
      <div
        className="sticky-mobile-bar"
        style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          background: "white",
          borderTop: "1px solid #e5e5e5",
          padding: "12px 16px",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
          zIndex: 140,
          alignItems: "center",
          gap: 10,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <Link
          href="/sell"
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            background: "#1a3329", color: "white",
            borderRadius: 10, padding: "14px 16px",
            fontSize: 15, fontWeight: 700, textDecoration: "none",
            fontFamily: "inherit", minHeight: 52,
          }}
        >
          {lang === "de" ? "Unternehmen vertraulich einreichen →" : "Submit confidentially →"}
        </Link>
      </div>

    </div>
  );
}
