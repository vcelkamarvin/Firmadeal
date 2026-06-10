"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ListingCard from "@/components/ListingCard";
import ListingGridCard from "@/components/ListingGridCard";
import { createClient } from "@/lib/supabase";
import { CATEGORIES, REGIONS_BY_COUNTRY } from "@/lib/types";
import type { BusinessStatus, Listing } from "@/lib/types";

const COUNTRY_OPTIONS = [
  { value: "DE", label: "🇩🇪 Deutschland" },
  { value: "AT", label: "🇦🇹 Österreich" },
  { value: "CH", label: "🇨🇭 Schweiz" },
];

function ListingsContent() {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();

  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    createClient()
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(500)
      .then(({ data }) => { setListings(data ?? []); });
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
  }, [search, selectedCategories, selectedRegion, selectedStatus, priceMin, priceMax, sortBy, listings]);

  const clearFilters = () => {
    setSearch(""); setSelectedCategories([]); setSelectedCountry(""); setSelectedRegion("");
    setPriceMin(""); setPriceMax(""); setSelectedStatus("");
    setMinRevenue(""); setMaxEmployees(""); setPhotosOnly(false); setFeaturedOnly(false);
  };

  const hasFilters = search || selectedCategories.length > 0 || selectedCountry || selectedRegion || priceMin || priceMax || selectedStatus || minRevenue || maxEmployees || photosOnly || featuredOnly;

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-sans text-[26px] font-bold text-[var(--ink)] tracking-tight mb-1">
            {lang === "de" ? "Unternehmen kaufen" : "Buy a business"}
          </h1>
          <p className="font-mono text-[12px] text-[var(--muted)]">
            {lang === "de" ? "deutschlandweit — Deutschland, Österreich, Schweiz" : "Germany-wide — Germany, Austria, Switzerland"}
          </p>
        </div>

        {/* Quick category chips — sticky horizontal scroll */}
        <div className="sticky top-0 z-10 bg-[var(--bg)] py-2 -mx-4 px-4 mb-4 border-b border-[var(--border)]" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div className="flex gap-2 w-max min-w-full">
            <button
              onClick={() => setSelectedCategories([])}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-sans text-[13px] font-semibold border transition-all ${
                selectedCategories.length === 0
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "bg-white text-[var(--ink)] border-[var(--border)]"
              }`}
            >
              Alle
            </button>
            {["Gastronomie & Lebensmittel","Handwerk & Bau","IT & Software","Gesundheit & Pflege","E-Commerce & Retail","Dienstleistungen","Produktion & Industrie"].map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-sans text-[13px] font-semibold border transition-all ${
                  selectedCategories.includes(cat)
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-white text-[var(--ink)] border-[var(--border)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden flex items-center gap-2 mb-4 px-4 py-2 border border-[var(--border)] rounded-lg font-sans text-sm text-[var(--ink)] bg-white"
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
          {/* Sidebar */}
          <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
            <aside className="w-full md:w-[220px] flex-shrink-0">
              <div className="bg-white border border-[var(--border)] rounded-xl p-5 sticky top-20">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-sans text-sm font-semibold text-[var(--ink)]">
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

          {/* Main */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <p className="font-sans text-[12px] text-[var(--muted)]">
                <span className="text-[var(--ink)] font-semibold">{filtered.length}</span> {lang === "de" ? "Inserate" : "listings"}
              </p>
              <div className="flex items-center gap-2">
                {/* View toggle */}
                <div className="flex border border-[var(--border)] rounded-lg overflow-hidden">
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

            {/* Active filter chips */}
            {hasFilters && (
              <div className="flex flex-wrap gap-1.5 mb-3">
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

            {filtered.length > 0 ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {filtered.map((listing, index) => (
                    <ListingGridCard key={listing.id} listing={listing} priority={index < 6} />
                  ))}
                </div>
              ) : (
                <>
                  {/* Table header */}
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
                  <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
                    {filtered.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </>
              )
            ) : (
              <div className="text-center py-20 bg-white border border-[var(--border)] rounded-xl">
                <p className="font-sans text-sm text-[var(--muted)] mb-3">
                  {lang === "de" ? "Keine Inserate gefunden." : "No listings found."}
                </p>
                <button onClick={clearFilters} className="font-sans text-sm text-[var(--accent)] hover:underline">
                  {lang === "de" ? "Filter zurücksetzen" : "Reset filters"}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <ListingsContent />
    </Suspense>
  );
}
