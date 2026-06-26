"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import ListingCard from "@/components/ListingCard";
import ListingGridCard from "@/components/ListingGridCard";
import { createClient } from "@/lib/supabase";
import { CATEGORIES, REGIONS_BY_COUNTRY } from "@/lib/types";
import type { BusinessStatus, Listing } from "@/lib/types";
import KaufgesucheSection from "@/components/KaufgesucheSection";

const COUNTRY_OPTIONS = [
  { value: "DE", label: "🇩🇪 Deutschland" },
  { value: "AT", label: "🇦🇹 Österreich" },
  { value: "CH", label: "🇨🇭 Schweiz" },
];

/* Quick-filter chips — MUST be exact CATEGORIES values so the equality
   filter (selectedCategories.includes(l.category)) actually matches. */
const QUICK_CATEGORIES = [
  "Gastronomie",
  "Handwerk",
  "IT & Tech",
  "Gesundheit",
  "Dienstleistungen",
  "E-Commerce",
  "Produktion",
  "Einzelhandel",
];

function ListingsContent() {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    createClient()
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => { setListings(data ?? []); setLoaded(true); });
  }, []);

  const [search, setSearch]                 = useState(searchParams.get("q") ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedRegion, setSelectedRegion]   = useState("");
  const [priceMin, setPriceMin]               = useState("");
  const [priceMax, setPriceMax]               = useState("");
  const [minRevenue, setMinRevenue]           = useState("");
  const [maxEmployees, setMaxEmployees]       = useState("");
  const [photosOnly, setPhotosOnly]           = useState(false);
  const [featuredOnly, setFeaturedOnly]       = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<BusinessStatus | "">("");
  const [sortBy, setSortBy]                 = useState("newest");
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [viewMode, setViewMode]             = useState<"grid" | "list">("grid");

  const availableRegions = selectedCountry ? (REGIONS_BY_COUNTRY[selectedCountry] ?? []) : Object.values(REGIONS_BY_COUNTRY).flat();

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  };

  const filtered = useMemo(() => {
    let list = [...listings];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((l) => (l.title ?? "").toLowerCase().includes(q) || (l.category ?? "").toLowerCase().includes(q) || (l.city ?? "").toLowerCase().includes(q) || (l.description ?? "").toLowerCase().includes(q));
    }
    if (selectedCountry)               list = list.filter((l) => l.country === selectedCountry);
    if (selectedCategories.length > 0) list = list.filter((l) => selectedCategories.includes(l.category));
    if (selectedRegion)                list = list.filter((l) => l.region === selectedRegion);
    if (selectedStatus)                list = list.filter((l) => l.status_business === selectedStatus);
    if (priceMin) list = list.filter((l) => l.asking_price !== null && l.asking_price >= parseInt(priceMin) * 1000);
    if (priceMax) list = list.filter((l) => l.price_confidential || (l.asking_price !== null && l.asking_price <= parseInt(priceMax) * 1000));
    if (minRevenue) list = list.filter((l) => l.annual_revenue !== null && l.annual_revenue >= parseInt(minRevenue) * 1000);
    if (maxEmployees) list = list.filter((l) => l.employees !== null && l.employees <= parseInt(maxEmployees));
    if (photosOnly) list = list.filter((l) => l.images && l.images.length > 0);
    if (featuredOnly) list = list.filter((l) => l.featured);

    switch (sortBy) {
      case "price_asc":  list.sort((a, b) => (a.asking_price ?? Infinity) - (b.asking_price ?? Infinity)); break;
      case "price_desc": list.sort((a, b) => (b.asking_price ?? -Infinity) - (a.asking_price ?? -Infinity)); break;
      case "popular":    list.sort((a, b) => (b.views_count ?? 0) - (a.views_count ?? 0)); break;
      default:           list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [
    featuredOnly, listings, maxEmployees, minRevenue, photosOnly, priceMax,
    priceMin, search, selectedCategories, selectedCountry, selectedRegion,
    selectedStatus, sortBy,
  ]);

  const clearFilters = () => {
    setSearch(""); setSelectedCategories([]); setSelectedCountry(""); setSelectedRegion("");
    setPriceMin(""); setPriceMax(""); setSelectedStatus("");
    setMinRevenue(""); setMaxEmployees(""); setPhotosOnly(false); setFeaturedOnly(false);
  };

  const hasFilters = search || selectedCategories.length > 0 || selectedCountry || selectedRegion || priceMin || priceMax || selectedStatus || minRevenue || maxEmployees || photosOnly || featuredOnly;

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".lst-reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("lst-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("lst-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="lst-page bg-[var(--bg)] min-h-screen">
      <style>{cssString}</style>

      <header className="lst-hero">
        <div className="lst-hero-wrap lst-reveal">
          <span className="lst-eyebrow">
            {lang === "de" ? "Unternehmen kaufen · DE · AT · CH" : "Buy a business · DE · AT · CH"}
          </span>
          <h1 className="lst-h1">
            {lang === "de" ? <>Unternehmen kaufen — <em>direkt vom Eigentümer.</em></> : <>Buy a business — <em>direct from the owner.</em></>}
          </h1>
          <p className="lst-sub">
            {lang === "de"
              ? "Kuratierte Mandate aus dem DACH-Raum — ohne Makler, ohne Provision. Die meisten Unternehmen werden vertraulich gehandelt; hier sehen Sie einen öffentlichen Auszug."
              : "Curated mandates across the DACH region — no broker, no commission. Most businesses are handled confidentially; this is a public selection."}
          </p>

          <form
            className="lst-herosearch"
            onSubmit={(e) => { e.preventDefault(); document.getElementById("lst-results")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
          >
            <Search size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === "de" ? "Branche, Stichwort oder Ort suchen…" : "Search industry, keyword or city…"}
              aria-label={lang === "de" ? "Inserate durchsuchen" : "Search listings"}
            />
            <button type="submit">{lang === "de" ? "Suchen" : "Search"}</button>
          </form>

          <div className="lst-herostats">
            <div className="lst-stat">
              <b className="tabular-nums">{loaded ? listings.length : "—"}</b>
              <span>{lang === "de" ? "öffentliche Inserate" : "public listings"}</span>
            </div>
            <div className="lst-stat">
              <b>0 %</b>
              <span>{lang === "de" ? "Käufer-Provision" : "buyer commission"}</span>
            </div>
            <div className="lst-stat">
              <b>DE · AT · CH</b>
              <span>{lang === "de" ? "geprüftes Netzwerk" : "vetted network"}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="lst-chipbar" style={{ position: "sticky", top: 62, zIndex: 30 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-3 overflow-x-auto" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
            <button
              onClick={() => setSelectedCategories([])}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-sans text-[13px] font-semibold border transition-all ${
                selectedCategories.length === 0
                  ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                  : "bg-white text-[var(--ink)] border-[var(--border)] hover:border-[var(--accent)]"
              }`}
            >
              {lang === "de" ? "Alle" : "All"}
            </button>
            {QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-sans text-[13px] font-semibold border transition-all ${
                  selectedCategories.includes(cat)
                    ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                    : "bg-white text-[var(--ink)] border-[var(--border)] hover:border-[var(--accent)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div id="lst-results" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 scroll-mt-[120px]">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden flex items-center gap-2 mb-4 px-4 py-2 border border-[var(--border)] rounded-full font-sans text-sm font-semibold text-[var(--ink)] bg-white"
        >
          <SlidersHorizontal size={15} />
          {lang === "de" ? "Filter" : "Filters"}
          {hasFilters && (
            <span className="ml-1 bg-[var(--accent)] text-white text-[10px] font-mono rounded-full px-1.5 py-0.5">
              {selectedCategories.length + (selectedRegion ? 1 : 0) + (selectedStatus ? 1 : 0)}
            </span>
          )}
        </button>

        <div className="flex gap-6">
          <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
            <aside className="w-full md:w-[230px] flex-shrink-0">
              <div className="bg-white border border-[var(--border)] rounded-2xl p-5 sticky" style={{ top: 124, boxShadow: "var(--shadow-sm)" }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-sans text-sm font-bold text-[var(--ink)]">
                    {lang === "de" ? "Filter" : "Filters"}
                  </h3>
                  {hasFilters && (
                    <button onClick={clearFilters} className="font-mono text-[10px] text-[var(--muted)] hover:text-[var(--red)] flex items-center gap-1">
                      <X size={11} /> {lang === "de" ? "Zurücksetzen" : "Reset"}
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wide block mb-2">
                      {lang === "de" ? "Suche" : "Search"}
                    </label>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={lang === "de" ? "Stichwort, Ort..." : "Keyword, city..."}
                      className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wide block mb-2">
                      Land
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => { setSelectedCountry(e.target.value); setSelectedRegion(""); }}
                      className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans bg-white"
                    >
                      <option value="">{lang === "de" ? "DE · AT · CH" : "All countries"}</option>
                      {COUNTRY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wide block mb-2">
                      {lang === "de" ? "Bundesland / Kanton" : "Region"}
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans bg-white"
                    >
                      <option value="">{lang === "de" ? "Alle Regionen" : "All regions"}</option>
                      {availableRegions.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wide block mb-2">
                      {lang === "de" ? "Branche" : "Industry"}
                    </label>
                    <div className="space-y-1.5 max-h-44 overflow-y-auto">
                      {CATEGORIES.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                            className="rounded border-[var(--border)] accent-[var(--accent)]"
                          />
                          <span className="font-sans text-[13px] text-[var(--ink)]">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wide block mb-2">
                      {lang === "de" ? "Kaufpreis T€" : "Price k€"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        placeholder="Min"
                        className="w-full px-2 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans"
                      />
                      <input
                        type="number"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        placeholder="Max"
                        className="w-full px-2 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wide block mb-2">
                      {lang === "de" ? "Mindestumsatz T€" : "Min revenue k€"}
                    </label>
                    <input
                      type="number"
                      value={minRevenue}
                      onChange={(e) => setMinRevenue(e.target.value)}
                      placeholder={lang === "de" ? "z.B. 100" : "e.g. 100"}
                      className="w-full px-2 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wide block mb-2">
                      {lang === "de" ? "Max. Mitarbeiter" : "Max. employees"}
                    </label>
                    <input
                      type="number"
                      value={maxEmployees}
                      onChange={(e) => setMaxEmployees(e.target.value)}
                      placeholder={lang === "de" ? "z.B. 10" : "e.g. 10"}
                      className="w-full px-2 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-wide block mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value as BusinessStatus | "")}
                      className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans bg-white"
                    >
                      <option value="">{lang === "de" ? "Alle" : "All"}</option>
                      <option value="active_profitable">{lang === "de" ? "Aktiv & Profitabel" : "Active & Profitable"}</option>
                      <option value="in_development">{lang === "de" ? "In Entwicklung" : "In development"}</option>
                      <option value="restructuring">{lang === "de" ? "Sanierungsbedarf" : "Restructuring"}</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={photosOnly}
                        onChange={(e) => setPhotosOnly(e.target.checked)}
                        className="rounded border-[var(--border)] accent-[var(--accent)]"
                      />
                      <span className="font-sans text-[13px] text-[var(--ink)]">
                        {lang === "de" ? "Nur mit Fotos" : "Photos only"}
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featuredOnly}
                        onChange={(e) => setFeaturedOnly(e.target.checked)}
                        className="rounded border-[var(--border)] accent-[var(--accent)]"
                      />
                      <span className="font-sans text-[13px] text-[var(--ink)]">
                        {lang === "de" ? "Nur Featured" : "Featured only"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-[12px] text-[var(--muted)]">
                {filtered.length > 0
                  ? <><span className="text-[var(--ink)] font-semibold">{filtered.length}</span> {lang === "de" ? "Inserate" : "listings"}</>
                  : <span>{lang === "de" ? "Kuratierte Auswahl" : "Curated selection"}</span>
                }
              </p>
              <div className="flex items-center gap-2">
                <div className="flex border border-[var(--border)] rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`w-8 h-8 flex items-center justify-center text-[13px] transition-colors ${viewMode === "grid" ? "bg-[var(--green-700)] text-white" : "bg-white text-[var(--muted)] hover:bg-[var(--surface2)]"}`}
                    title="Grid"
                  >⊞</button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`w-8 h-8 flex items-center justify-center text-[13px] transition-colors ${viewMode === "list" ? "bg-[var(--green-700)] text-white" : "bg-white text-[var(--muted)] hover:bg-[var(--surface2)]"}`}
                    title="List"
                  >☰</button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm font-sans border border-[var(--border)] rounded-lg px-3 py-1.5 outline-none focus:border-[var(--accent)] bg-white text-[var(--ink)]"
                >
                  <option value="newest">{lang === "de" ? "Neueste" : "Newest"}</option>
                  <option value="price_asc">{lang === "de" ? "Preis ↑" : "Price ↑"}</option>
                  <option value="price_desc">{lang === "de" ? "Preis ↓" : "Price ↓"}</option>
                  <option value="popular">{lang === "de" ? "Beliebteste" : "Most viewed"}</option>
                </select>
              </div>
            </div>

            {hasFilters && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedCountry && (
                  <button onClick={() => setSelectedCountry("")} className="flex items-center gap-1 px-2.5 py-1 bg-[var(--accent-light)] border border-[var(--accent)] text-[var(--accent)] rounded-full font-sans text-[11px] hover:bg-[var(--accent)] hover:text-white transition-colors">
                    {COUNTRY_OPTIONS.find(c => c.value === selectedCountry)?.label} <X size={10} />
                  </button>
                )}
                {selectedRegion && (
                  <button onClick={() => setSelectedRegion("")} className="flex items-center gap-1 px-2.5 py-1 bg-[var(--accent-light)] border border-[var(--accent)] text-[var(--accent)] rounded-full font-sans text-[11px] hover:bg-[var(--accent)] hover:text-white transition-colors">
                    {selectedRegion} <X size={10} />
                  </button>
                )}
                {selectedCategories.map((c) => (
                  <button key={c} onClick={() => toggleCategory(c)} className="flex items-center gap-1 px-2.5 py-1 bg-[var(--accent-light)] border border-[var(--accent)] text-[var(--accent)] rounded-full font-sans text-[11px] hover:bg-[var(--accent)] hover:text-white transition-colors">
                    {c} <X size={10} />
                  </button>
                ))}
                {priceMin && (
                  <button onClick={() => setPriceMin("")} className="flex items-center gap-1 px-2.5 py-1 bg-[var(--accent-light)] border border-[var(--accent)] text-[var(--accent)] rounded-full font-sans text-[11px] hover:bg-[var(--accent)] hover:text-white transition-colors">
                    ab {priceMin}k€ <X size={10} />
                  </button>
                )}
                {priceMax && (
                  <button onClick={() => setPriceMax("")} className="flex items-center gap-1 px-2.5 py-1 bg-[var(--accent-light)] border border-[var(--accent)] text-[var(--accent)] rounded-full font-sans text-[11px] hover:bg-[var(--accent)] hover:text-white transition-colors">
                    bis {priceMax}k€ <X size={10} />
                  </button>
                )}
                {photosOnly && (
                  <button onClick={() => setPhotosOnly(false)} className="flex items-center gap-1 px-2.5 py-1 bg-[var(--accent-light)] border border-[var(--accent)] text-[var(--accent)] rounded-full font-sans text-[11px] hover:bg-[var(--accent)] hover:text-white transition-colors">
                    {lang === "de" ? "Mit Fotos" : "Photos"} <X size={10} />
                  </button>
                )}
                {featuredOnly && (
                  <button onClick={() => setFeaturedOnly(false)} className="flex items-center gap-1 px-2.5 py-1 bg-[var(--accent-light)] border border-[var(--accent)] text-[var(--accent)] rounded-full font-sans text-[11px] hover:bg-[var(--accent)] hover:text-white transition-colors">
                    Featured <X size={10} />
                  </button>
                )}
              </div>
            )}

            {!loaded ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
                    <div className="lst-skel" style={{ height: 200, borderRadius: 0 }} />
                    <div className="p-4 space-y-3">
                      <div className="lst-skel" style={{ height: 14, width: "85%" }} />
                      <div className="lst-skel" style={{ height: 12, width: "55%" }} />
                      <div className="lst-skel" style={{ height: 28, width: "100%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {filtered.map((listing, index) => (
                    <ListingGridCard key={listing.id} listing={listing} priority={index < 6} />
                  ))}
                </div>
              ) : (
                <>
                  <div className="hidden md:flex items-center gap-4 px-5 py-2">
                    <div className="w-14 flex-shrink-0" />
                    <div className="flex-1 font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                      {lang === "de" ? "Unternehmen" : "Business"}
                    </div>
                    <div className="w-[90px] text-right font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                      {lang === "de" ? "Umsatz" : "Revenue"}
                    </div>
                    <div className="w-[96px] font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                      EBITDA
                    </div>
                    <div className="w-[100px] text-right font-sans text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">
                      {lang === "de" ? "Preis" : "Price"}
                    </div>
                    <div className="w-[22px]" />
                  </div>
                  <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
                    {filtered.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </>
              )
            ) : (
              <div className="text-center py-20 bg-white border border-[var(--border)] rounded-2xl px-6">
                {hasFilters ? (
                  <>
                    <p className="font-sans text-sm text-[var(--muted)] mb-3">
                      {lang === "de" ? "Keine Inserate für diese Filter." : "No listings for these filters."}
                    </p>
                    <button onClick={clearFilters} className="font-sans text-sm font-semibold text-[var(--accent)] hover:underline">
                      {lang === "de" ? "Filter zurücksetzen" : "Reset filters"}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-4">🔒</div>
                    <h3 className="font-sans text-[18px] font-bold text-[var(--ink)] mb-3">
                      {lang === "de" ? "Die meisten Mandate sind vertraulich" : "Most mandates are confidential"}
                    </h3>
                    <p className="font-sans text-[14px] text-[var(--muted)] leading-relaxed mb-6 max-w-md mx-auto">
                      {lang === "de"
                        ? "Aus Diskretionsgründen zeigen wir nur einen kleinen, kuratierten Teil unserer Mandate öffentlich. Suchen Sie etwas Bestimmtes? Hinterlegen Sie Ihr Suchprofil — wir melden uns, sobald ein passendes Unternehmen verfügbar ist."
                        : "For discretion reasons, only a small curated portion of our mandates are shown publicly. Looking for something specific? Leave your search profile and we'll reach out when a match becomes available."}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        href="/kaeufer"
                        className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-sans font-bold px-6 py-3 rounded-xl hover:bg-[var(--accent-hover)] transition-colors text-[14px]"
                      >
                        {lang === "de" ? "Suchprofil hinterlegen" : "Set up a search profile"}
                      </Link>
                      <Link
                        href="/sell"
                        className="inline-flex items-center justify-center gap-2 bg-white border border-[var(--accent)] text-[var(--accent)] font-sans font-bold px-6 py-3 rounded-xl hover:bg-[var(--accent)] hover:text-white transition-colors text-[14px]"
                      >
                        {lang === "de" ? "Unternehmen einreichen" : "Submit your business"}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}

            <p className="font-sans text-[12px] text-[var(--muted)] mt-6 leading-relaxed max-w-2xl">
              {lang === "de"
                ? "Hinweis: Mit „Beispiel“ markierte Inserate sind illustrative Beispiel-Mandate. Echte Unternehmen werden überwiegend vertraulich (off-market) gehandelt und nur nach Freigabe öffentlich gezeigt."
                : "Note: Listings marked “Beispiel” are illustrative sample mandates. Real businesses are mostly handled confidentially (off-market) and shown publicly only after release."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
        <ListingsContent />
      </Suspense>
      <KaufgesucheSection />
    </>
  );
}

const cssString = `
.lst-page{--cta:#16a34a;--cta-h:#128a3e;--g50:#f2faf5;}
.lst-hero{position:relative;overflow:hidden;background:linear-gradient(180deg,#ffffff,var(--bg));border-bottom:1px solid var(--border);}
.lst-hero::before{content:"";position:absolute;top:-200px;right:-150px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,var(--g50),transparent 68%);pointer-events:none;animation:lst-drift 16s ease-in-out infinite;}
.lst-hero-wrap{max-width:80rem;margin:0 auto;padding:104px 24px 36px;position:relative;z-index:1;}
.lst-eyebrow{font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--cta);}
.lst-h1{font-size:clamp(30px,4.4vw,50px);line-height:1.04;letter-spacing:-.035em;color:var(--accent);margin:14px 0 14px;font-weight:700;}
.lst-h1 em{font-style:normal;color:var(--cta);}
.lst-sub{font-size:clamp(15px,1.6vw,18px);color:var(--muted);max-width:580px;line-height:1.55;margin-bottom:24px;}
.lst-herosearch{display:flex;align-items:center;gap:10px;background:#fff;border:1.5px solid var(--border);border-radius:100px;padding:5px 6px 5px 18px;max-width:560px;box-shadow:0 10px 30px -16px rgba(20,40,30,.3);transition:border-color .15s,box-shadow .15s;}
.lst-herosearch:focus-within{border-color:var(--cta);box-shadow:0 12px 34px -14px rgba(22,163,74,.4);}
.lst-herosearch svg{color:var(--muted);flex-shrink:0;}
.lst-herosearch input{flex:1;border:none;outline:none;background:transparent;font-size:15px;color:var(--ink);min-height:42px;}
.lst-herosearch button{flex-shrink:0;background:var(--cta);color:#fff;border:none;border-radius:100px;height:44px;padding:0 24px;font-weight:600;font-size:14px;cursor:pointer;transition:background .15s,transform .12s;}
.lst-herosearch button:hover{background:var(--cta-h);transform:translateY(-1px);}
.lst-herostats{display:flex;gap:30px;flex-wrap:wrap;margin-top:26px;}
.lst-stat b{display:block;font-size:22px;font-weight:700;color:var(--accent);letter-spacing:-.02em;}
.lst-stat span{font-size:12.5px;color:var(--muted);}
.lst-chipbar{background:rgba(243,239,231,.86);backdrop-filter:saturate(180%) blur(10px);-webkit-backdrop-filter:saturate(180%) blur(10px);border-bottom:1px solid var(--border);}
.lst-chipbar > div > div::-webkit-scrollbar{display:none;}
.lst-reveal{opacity:0;transform:translateY(14px);transition:opacity .6s ease,transform .6s cubic-bezier(.16,1,.3,1);}
.lst-reveal.lst-in{opacity:1;transform:none;}
.lst-skel{background:#ececec;background-image:linear-gradient(90deg,#ececec 0px,#f6f6f4 44px,#ececec 88px);background-size:600px;animation:lst-shimmer 1.4s infinite linear;border-radius:8px;}
@keyframes lst-drift{0%,100%{transform:translate(0,0) scale(1);}50%{transform:translate(-26px,18px) scale(1.07);}}
@keyframes lst-shimmer{0%{background-position:-300px 0;}100%{background-position:300px 0;}}
@media(max-width:768px){.lst-hero-wrap{padding:88px 16px 24px;}.lst-herostats{gap:22px;}.lst-stat b{font-size:19px;}}
@media(prefers-reduced-motion:reduce){.lst-reveal{opacity:1;transform:none;transition:none;}.lst-hero::before,.lst-skel{animation:none!important;}}
`;
