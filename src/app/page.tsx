"use client";

import { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ListingCard from "@/components/ListingCard";
import ListingGridCard from "@/components/ListingGridCard";
import { MOCK_LISTINGS } from "@/lib/mockData";
import { CATEGORIES } from "@/lib/types";
import type { Listing } from "@/lib/types";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import type { BusinessStatus } from "@/lib/types";
import ValuationCalculator from "@/components/ValuationCalculator";
import SaleTimelineSection from "@/components/SaleTimelineSection";
import MarketLiquidity from "@/components/MarketLiquidity";

// ── Constants ──────────────────────────────────────────────────────────────────

const BIZ_TYPES = ["KFZ-Werkstatt", "Bäckerei", "IT-Firma", "Restaurant", "Praxis", "Online-Shop"];

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (n >= 1_000)     return `€${Math.round(n / 1_000)}k`;
  return `€${n}`;
}

// ── Market stats ───────────────────────────────────────────────────────────────

const ALL = MOCK_LISTINGS.filter((l) => l.status === "active");
const avgRevenue = Math.round(ALL.reduce((s, l) => s + (l.annual_revenue ?? 0), 0) / ALL.filter((l) => l.annual_revenue).length);
const avgPrice   = Math.round(ALL.filter((l) => l.asking_price && !l.price_confidential).reduce((s, l) => s + (l.asking_price ?? 0), 0) / ALL.filter((l) => l.asking_price && !l.price_confidential).length);
const avgMargin  = Math.round(ALL.filter((l) => l.ebitda && l.annual_revenue).reduce((s, l) => s + ((l.ebitda! / l.annual_revenue!) * 100), 0) / ALL.filter((l) => l.ebitda && l.annual_revenue).length);

// Industry breakdown
const BY_CAT: Record<string, { count: number; avgPrice: number; avgMargin: number }> = {};
ALL.forEach((l) => {
  if (!BY_CAT[l.category]) BY_CAT[l.category] = { count: 0, avgPrice: 0, avgMargin: 0 };
  BY_CAT[l.category].count++;
  if (l.asking_price && !l.price_confidential) BY_CAT[l.category].avgPrice += l.asking_price;
  if (l.ebitda && l.annual_revenue) BY_CAT[l.category].avgMargin += (l.ebitda / l.annual_revenue) * 100;
});
const CAT_DATA = Object.entries(BY_CAT)
  .map(([cat, d]) => ({
    cat,
    count: d.count,
    avgPrice: d.count > 0 ? Math.round(d.avgPrice / d.count) : 0,
    avgMargin: d.count > 0 ? Math.round(d.avgMargin / d.count) : 0,
  }))
  .sort((a, b) => b.count - a.count);

const MAX_CAT_COUNT = Math.max(...CAT_DATA.map((d) => d.count));
const MAX_CAT_PRICE = Math.max(...CAT_DATA.map((d) => d.avgPrice));

// Price distribution buckets
const PRICE_BUCKETS = [
  { label: "<€200k", min: 0, max: 200_000 },
  { label: "€200k–500k", min: 200_000, max: 500_000 },
  { label: "€500k–1M", min: 500_000, max: 1_000_000 },
  { label: "€1M–3M", min: 1_000_000, max: 3_000_000 },
  { label: ">€3M", min: 3_000_000, max: Infinity },
];
const PRICE_DIST = PRICE_BUCKETS.map((b) => ({
  ...b,
  count: ALL.filter((l) => l.asking_price && !l.price_confidential && l.asking_price >= b.min && l.asking_price < b.max).length,
}));
const MAX_DIST = Math.max(...PRICE_DIST.map((d) => d.count));

// ── Components ─────────────────────────────────────────────────────────────────

function MarketCharts({ lang }: { lang: string }) {
  const [chart, setChart] = useState<"industries" | "prices" | "margins">("industries");

  return (
    <section className="bg-white border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <p className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-[0.2em] mb-1">
              {lang === "de" ? "Marktdaten" : "Market data"}
            </p>
            <h2 className="font-sans text-[24px] font-bold text-[var(--ink)] tracking-tight">
              {lang === "de" ? "DACH Unternehmensmarkt 2025" : "DACH Business Market 2025"}
            </h2>
          </div>
          <div className="flex gap-1 bg-[var(--surface2)] rounded-lg p-1">
            {[
              { id: "industries" as const, de: "Branchen", en: "Industries" },
              { id: "prices"     as const, de: "Preise",   en: "Prices"     },
              { id: "margins"    as const, de: "Margen",   en: "Margins"    },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setChart(t.id)}
                className={`font-mono text-[11px] px-3 py-1.5 rounded-md transition-all ${
                  chart === t.id ? "bg-[var(--accent)] text-white" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {lang === "de" ? t.de : t.en}
              </button>
            ))}
          </div>
        </div>

        {/* Industry count chart */}
        {chart === "industries" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {CAT_DATA.map((d) => (
                <div key={d.cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-sans text-[13px] text-[var(--ink)]">{d.cat}</span>
                    <span className="font-mono text-[11px] text-[var(--muted)]">{d.count} {lang === "de" ? "Inserate" : "listings"}</span>
                  </div>
                  <div className="h-2 bg-[var(--surface2)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--accent)] rounded-full transition-all duration-700"
                      style={{ width: `${(d.count / MAX_CAT_COUNT) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Price distribution chart */}
        {chart === "prices" && (
          <div>
            <p className="font-mono text-[11px] text-[var(--muted)] mb-6">
              {lang === "de" ? "Verteilung nach Kaufpreisbereichen" : "Distribution by asking price range"}
            </p>
            <div className="flex items-end gap-3 h-40">
              {PRICE_DIST.map((b) => (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                  <span className="font-mono text-[11px] text-[var(--muted)]">{b.count}</span>
                  <div className="w-full relative" style={{ height: `${Math.max(4, (b.count / MAX_DIST) * 100)}%` }}>
                    <div className="w-full h-full bg-[var(--accent)] rounded-t-md opacity-80 hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-2">
              {PRICE_DIST.map((b) => (
                <div key={b.label} className="flex-1 text-center">
                  <span className="font-mono text-[10px] text-[var(--muted)]">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EBITDA margin by industry */}
        {chart === "margins" && (
          <div className="space-y-3">
            <p className="font-mono text-[11px] text-[var(--muted)] mb-4">
              {lang === "de" ? "Ø EBITDA-Marge pro Branche" : "Avg. EBITDA margin per industry"}
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              {CAT_DATA.filter((d) => d.avgMargin > 0).sort((a, b) => b.avgMargin - a.avgMargin).map((d) => (
                <div key={d.cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-sans text-[13px] text-[var(--ink)]">{d.cat}</span>
                    <span className={`font-mono text-[11px] font-semibold ${d.avgMargin >= 25 ? "text-[var(--green)]" : d.avgMargin >= 15 ? "text-amber-600" : "text-[var(--muted)]"}`}>
                      {d.avgMargin}%
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--surface2)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${d.avgMargin >= 25 ? "bg-[var(--green)]" : d.avgMargin >= 15 ? "bg-amber-400" : "bg-[var(--muted)]"}`}
                      style={{ width: `${Math.min(100, d.avgMargin * 2.5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-[var(--border)]">
          {[
            { value: fmt(avgRevenue), label: lang === "de" ? "Ø Jahresumsatz" : "Avg. Annual Revenue", sub: lang === "de" ? "aller Inserate" : "across all listings" },
            { value: fmt(avgPrice),   label: lang === "de" ? "Ø Kaufpreis"    : "Avg. Asking Price",   sub: lang === "de" ? "exkl. vertraulich" : "excl. confidential" },
            { value: `${avgMargin}%`, label: lang === "de" ? "Ø EBITDA-Marge" : "Avg. EBITDA Margin",  sub: lang === "de" ? "aller Inserate" : "across all listings" },
          ].map((k) => (
            <div key={k.label} className="text-center">
              <div className="font-sans text-[32px] font-bold text-[var(--accent)] tracking-tight leading-none">{k.value}</div>
              <div className="font-mono text-[11px] text-[var(--ink)] mt-1">{k.label}</div>
              <div className="font-mono text-[10px] text-[var(--muted)]">{k.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

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

  // Homepage shows max 12 (4×3 grid)
  const shown = filtered.slice(0, 12);
  const hasMore = filtered.length > 12;
  const hasFilters = q || cat || status || priceMax;

  return (
    <section id="listings" className="bg-[var(--bg)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <p className="font-sans text-[11px] font-bold text-[var(--accent)] uppercase tracking-[0.2em] mb-1">
              {lang === "de" ? "Live Marktplatz" : "Live marketplace"}
            </p>
            <h2 className="font-sans text-[24px] font-bold text-[var(--ink)] tracking-tight">
              {lang === "de" ? "Unternehmen kaufen" : "Businesses for sale"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => setViewMode("grid")}
                title="Kachelansicht"
                style={{
                  width: 34, height: 34, borderRadius: 6,
                  border: "1px solid #e5e5e5",
                  background: viewMode === "grid" ? "#2d5a3d" : "transparent",
                  color: viewMode === "grid" ? "white" : "#888",
                  cursor: "pointer", fontSize: 16,
                }}
              >⊞</button>
              <button
                onClick={() => setViewMode("list")}
                title="Listenansicht"
                style={{
                  width: 34, height: 34, borderRadius: 6,
                  border: "1px solid #e5e5e5",
                  background: viewMode === "list" ? "#2d5a3d" : "transparent",
                  color: viewMode === "list" ? "white" : "#888",
                  cursor: "pointer", fontSize: 16,
                }}
              >☰</button>
            </div>
            <Link href="/sell" className="font-sans text-[13px] font-semibold text-[var(--accent)] hover:underline">
              {lang === "de" ? "+ Inserat aufgeben" : "+ List your business"}
            </Link>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-[var(--border)] rounded-xl p-4 mb-1">
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={lang === "de" ? "Suchen..." : "Search..."}
              className="flex-1 min-w-[160px] px-3 py-2 text-sm font-sans border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)]"
            />
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="px-3 py-2 text-sm font-sans border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white"
            >
              <option value="">{lang === "de" ? "Alle Branchen" : "All industries"}</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 text-sm font-sans border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white"
            >
              <option value="newest">{lang === "de" ? "Neueste" : "Newest"}</option>
              <option value="price_asc">{lang === "de" ? "Preis ↑" : "Price ↑"}</option>
              <option value="price_desc">{lang === "de" ? "Preis ↓" : "Price ↓"}</option>
              <option value="popular">{lang === "de" ? "Beliebteste" : "Most viewed"}</option>
            </select>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-sans border rounded-lg transition-colors ${filtersOpen ? "border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]" : "border-[var(--border)] text-[var(--muted)]"}`}
            >
              <SlidersHorizontal size={14} />
              {lang === "de" ? "Mehr Filter" : "More filters"}
            </button>
            {hasFilters && (
              <button
                onClick={() => { setQ(""); setCat(""); setStatus(""); setPriceMax(""); }}
                className="flex items-center gap-1 font-mono text-[11px] text-[var(--muted)] hover:text-[var(--red)]"
              >
                <X size={12} />
                {lang === "de" ? "Zurücksetzen" : "Reset"}
              </button>
            )}
          </div>
          {filtersOpen && (
            <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-[var(--border)]">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BusinessStatus | "")}
                className="px-3 py-2 text-sm font-sans border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white"
              >
                <option value="">{lang === "de" ? "Alle Status" : "All statuses"}</option>
                <option value="active_profitable">{lang === "de" ? "Aktiv & Profitabel" : "Active & Profitable"}</option>
                <option value="in_development">{lang === "de" ? "In Entwicklung" : "In development"}</option>
                <option value="restructuring">{lang === "de" ? "Sanierungsbedarf" : "Needs restructuring"}</option>
              </select>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-[var(--muted)]">{lang === "de" ? "Max. Preis" : "Max price"}</span>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="T€"
                  className="w-24 px-3 py-2 text-sm font-mono border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Grid or list rendering */}
        {viewMode === "grid" ? (
          <>
            {shown.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-sans text-sm text-[var(--muted)]">
                  {lang === "de" ? "Keine Inserate gefunden." : "No listings found."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                {shown.map((l) => <ListingGridCard key={l.id} listing={l} />)}
              </div>
            )}
            {hasMore && (
              <div className="text-center mt-8">
                <Link
                  href="/listings"
                  className="inline-flex items-center gap-2 border border-[var(--accent)] text-[var(--accent)] font-sans font-semibold px-8 py-3 rounded-full hover:bg-[var(--accent)] hover:text-white transition-all"
                >
                  {lang === "de" ? `Alle ${filtered.length} Inserate ansehen →` : `View all ${filtered.length} listings →`}
                </Link>
              </div>
            )}
          </>
        ) : (
          <>
            {/* List view header */}
            <div className="hidden md:flex items-center gap-4 px-5 py-2">
              <div className="w-14 flex-shrink-0" />
              <div className="flex-1 font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                {lang === "de" ? "Unternehmen" : "Business"}
              </div>
              <div className="w-[90px] text-right font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                {lang === "de" ? "Umsatz" : "Revenue"}
              </div>
              <div className="w-[96px] font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">EBITDA</div>
              <div className="w-[100px] text-right font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                {lang === "de" ? "Preis" : "Price"}
              </div>
              <div className="w-[22px]" />
            </div>
            <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
              {shown.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="font-sans text-sm text-[var(--muted)]">
                    {lang === "de" ? "Keine Inserate gefunden." : "No listings found."}
                  </p>
                </div>
              ) : (
                shown.map((l) => <ListingCard key={l.id} listing={l} />)
              )}
            </div>
            {hasMore && (
              <div className="text-center mt-4">
                <Link
                  href="/listings"
                  className="inline-flex items-center gap-2 border border-[var(--accent)] text-[var(--accent)] font-sans font-semibold px-8 py-3 rounded-full hover:bg-[var(--accent)] hover:text-white transition-all"
                >
                  {lang === "de" ? `Alle ${filtered.length} Inserate →` : `All ${filtered.length} listings →`}
                </Link>
              </div>
            )}
          </>
        )}

        <p className="font-sans text-[11px] text-[var(--muted)] text-center mt-4">
          {filtered.length} {lang === "de" ? "Inserate" : "listings"} · {lang === "de" ? "Live-Daten" : "Live data"}
        </p>
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
                <h3 className="font-sans text-[15px] font-bold text-[var(--ink)] leading-snug mb-2 group-hover:text-[var(--accent)] transition-colors flex-1">
                  {post.title}
                </h3>
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
    { q: "Gibt es eine Provision?",                  a: "Nein. 0% Provision. Sie behalten 100% des Verkaufspreises." },
    { q: "Wie lange dauert ein Verkauf?",            a: "Im Schnitt 4–9 Monate. Vollständige Finanzdaten beschleunigen den Prozess erheblich." },
    { q: "Bleibt mein Inserat anonym?",              a: "Ja. Sie entscheiden, wann Sie Ihren Namen und Firmennamen freigeben." },
    { q: "Welche Unterlagen brauche ich?",           a: "BWA der letzten 3 Jahre, Jahresabschlüsse, anonymisierte Kundenliste, Mietverträge." },
    { q: "Wie kontaktiere ich einen Verkäufer?",     a: "Direkt über das Kontaktformular im Inserat. Kein Makler, keine Wartezeit." },
  ] : [
    { q: "Is there a commission?",                   a: "No. 0% commission. You keep 100% of the sale price." },
    { q: "How long does a sale take?",               a: "On average 4–9 months. Complete financial data significantly speeds up the process." },
    { q: "Does my listing stay anonymous?",          a: "Yes. You decide when to reveal your name and company." },
    { q: "What documents do I need?",               a: "P&L for last 3 years, annual accounts, anonymized customer list, rental agreements." },
    { q: "How do I contact a seller?",               a: "Directly via the contact form in the listing. No broker, no waiting." },
  ];

  return (
    <div className="bg-[var(--bg)]">

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: copy */}
            <div>
              {/* Eyebrow */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "100px", padding: "6px 16px", marginBottom: "24px" }}>
                <span style={{ color: "#6dbf87", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  ⚡ {lang === "de" ? "DACH's #1 Unternehmensmarktplatz" : "DACH's #1 Business Marketplace"}
                </span>
              </div>

              {/* Rotating headline */}
              <h1 className="font-sans font-bold text-white tracking-tight mb-6" style={{ fontSize: "clamp(34px, 5vw, 58px)", lineHeight: 1.08 }}>
                {lang === "de"
                  ? <>Den richtigen Käufer finden<br />für Ihre{" "}<span style={{ color: "#6dbf87" }}>{BIZ_TYPES[bizTypeIdx]}.</span></>
                  : <>Find the right buyer<br />for your{" "}<span style={{ color: "#6dbf87" }}>{BIZ_TYPES[bizTypeIdx]}.</span></>}
              </h1>

              <p className="font-sans text-white/75 mb-8" style={{ fontSize: "17px", lineHeight: 1.65, maxWidth: "480px" }}>
                {lang === "de"
                  ? "Der direkte Marktplatz für Unternehmensverkäufe im DACH-Raum — 0% Provision, vollständig anonym."
                  : "The direct marketplace for business sales in the DACH region — 0% commission, fully anonymous."}
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-2 mb-8">
                {[
                  { stat: "0%",      label: lang === "de" ? "Provision beim Verkauf"    : "Commission on sale"      },
                  { stat: "#1",      label: lang === "de" ? "Plattform für Käufersuche" : "Platform for buyers"     },
                  { stat: "4–9 Mo.", label: lang === "de" ? "Ø Verkaufsdauer"            : "Avg. sale duration"      },
                  { stat: "🔒",      label: lang === "de" ? "Anonymes Inserat"           : "Anonymous listing"       },
                ].map((b) => (
                  <div key={b.stat} style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "100px", padding: "8px 16px" }}>
                    <span className="font-sans font-bold text-white text-[13px]">{b.stat}</span>
                    <span className="font-sans text-white/65 text-[12px]">{b.label}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 items-center mb-8">
                <Link href="/sell" className="font-sans font-bold text-white rounded-lg hover:opacity-90 transition-opacity" style={{ background: "#2d5a3d", padding: "14px 28px", fontSize: "16px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  {lang === "de" ? "Unternehmen inserieren" : "List your business"} →
                </Link>
                <a href="#listings" className="font-sans font-semibold text-white/80 hover:text-white transition-colors" style={{ fontSize: "16px" }}>
                  {lang === "de" ? "Inserate durchsuchen" : "Browse listings"}
                </a>
              </div>

              {/* Trial note */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-8">
                {(lang === "de"
                  ? ["✓ 7 Tage Markttest kostenlos", "✓ Keine Provision", "✓ Jederzeit kündbar"]
                  : ["✓ 7-day market test free", "✓ No commission", "✓ Cancel anytime"]
                ).map((item) => (
                  <span key={item} className="font-sans text-[13px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {item}
                  </span>
                ))}
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} style={{ color: "#00b67a", fontSize: "18px" }}>★</span>
                  ))}
                </div>
                <span className="font-sans text-white/60 text-sm">4.8 · 120+ {lang === "de" ? "Bewertungen" : "reviews"}</span>
              </div>
            </div>

            {/* Right: hero calculator */}
            <ValuationCalculator variant="hero" />
          </div>
        </div>
      </section>

      {/* ── LIVE TICKER ──────────────────────────────────────────────────────── */}
      <div className="bg-[var(--ink)] overflow-hidden py-2.5">
        <div className="animate-marquee">
          {[...(lang === "de"
            ? ["1.247 aktive Käufer", "0% Provision", "47 neue Inserate diese Woche", "DSGVO-konform", "€2,3 Mrd. Transaktionsvolumen", "Direkte Kommunikation", "Keine versteckten Kosten", "Sofort nach Zahlung live"]
            : ["1,247 active buyers", "0% commission", "47 new listings this week", "GDPR compliant", "€2.3B in deal volume", "Direct communication", "No hidden costs", "Live instantly after payment"]
          ), ...(lang === "de"
            ? ["1.247 aktive Käufer", "0% Provision", "47 neue Inserate diese Woche", "DSGVO-konform", "€2,3 Mrd. Transaktionsvolumen", "Direkte Kommunikation", "Keine versteckten Kosten", "Sofort nach Zahlung live"]
            : ["1,247 active buyers", "0% commission", "47 new listings this week", "GDPR compliant", "€2.3B in deal volume", "Direct communication", "No hidden costs", "Live instantly after payment"]
          )].map((item, i) => (
            <span key={i} className="flex items-center gap-5 px-5 font-mono text-[11px] text-white/30 whitespace-nowrap">
              {item}
              <span className="w-1 h-1 rounded-full bg-white/15" />
            </span>
          ))}
        </div>
      </div>

      {/* ── MARKET LIQUIDITY ─────────────────────────────────────────────────── */}
      <MarketLiquidity lang={lang} />

      {/* ── INLINE CATALOG ───────────────────────────────────────────────────── */}
      <InlineCatalog lang={lang} />

      {/* ── SALE TIMELINE ────────────────────────────────────────────────────── */}
      <SaleTimelineSection lang={lang} />

      {/* ── MARKET CHARTS ────────────────────────────────────────────────────── */}
      <MarketCharts lang={lang} />

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="bg-[var(--accent)] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <p className="font-mono text-[11px] text-white/40 uppercase tracking-[0.2em] mb-2 text-center">
            {lang === "de" ? "So funktioniert es" : "How it works"}
          </p>
          <h2 className="font-sans text-[22px] font-bold text-white tracking-tight text-center mb-10">
            {lang === "de" ? "Vom Inserat zum Abschluss" : "From listing to closing"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { n: "01", de: "Inserat finden",      en: "Find a listing",      de2: "Filter nach Branche, Region, Preis. Alle Kennzahlen sofort sichtbar.",          en2: "Filter by industry, region, price. All key metrics visible immediately." },
              { n: "02", de: "Direkt kontaktieren", en: "Contact directly",    de2: "Schreiben Sie dem Verkäufer direkt. Kein Makler. Kein Zwischenhändler.",        en2: "Message the seller directly. No broker. No middleman." },
              { n: "03", de: "Due Diligence",       en: "Due diligence",       de2: "Prüfen Sie Finanzen und Verträge. Wir liefern eine strukturierte Checkliste.",   en2: "Review financials and contracts. We provide a structured checklist." },
              { n: "04", de: "Übergabe",            en: "Close the deal",      de2: "Vertrag, Zahlung, Schlüsselübergabe. Sicher und transparent.",                   en2: "Contract, payment, handover. Safe and transparent." },
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
                  <div className="px-5 pb-5">
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

      {/* ── NEWSLETTER + CTA ─────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-mono text-[11px] text-[var(--accent)] uppercase tracking-[0.2em] mb-3">
                {lang === "de" ? "Deal-Alarm" : "Deal alerts"}
              </p>
              <h2 className="font-sans text-[22px] font-bold text-[var(--ink)] tracking-tight mb-3">
                {lang === "de" ? "Neue Inserate direkt in Ihren Posteingang" : "New listings straight to your inbox"}
              </h2>
              <p className="font-sans text-[14px] text-[var(--muted)] leading-relaxed">
                {lang === "de"
                  ? "Wöchentlich die besten neuen Inserate passend zu Ihren Kriterien. Jederzeit abmeldbar."
                  : "Weekly digest of the best new listings matching your criteria. Unsubscribe anytime."}
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
                  <div className="flex gap-3">
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
                {lang === "de"
                  ? "Bereit zum Inserieren?"
                  : "Ready to list?"}
              </h2>
              <p className="font-sans text-[15px] text-white/60">
                {lang === "de"
                  ? "Ab €39/Monat · Sofort live · 0% Provision · Kein Makler"
                  : "From €39/mo · Live instantly · 0% commission · No broker"}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sell"
                className="flex items-center gap-2 bg-white text-[var(--accent)] font-sans font-bold px-8 py-3.5 rounded-full hover:bg-white/90 transition-colors"
              >
                {lang === "de" ? "Jetzt inserieren →" : "List now →"}
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

    </div>
  );
}
