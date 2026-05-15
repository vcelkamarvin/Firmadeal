"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ListingCard from "@/components/ListingCard";
import { MOCK_LISTINGS } from "@/lib/mockData";
import { CATEGORIES, DACH_REGIONS } from "@/lib/types";
import type { BusinessStatus } from "@/lib/types";

function ListingsContent() {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [selectedRegion, setSelectedRegion] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<BusinessStatus | "">("");
  const [sortBy, setSortBy] = useState("newest");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = [...MOCK_LISTINGS];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      list = list.filter((l) => selectedCategories.includes(l.category));
    }

    if (selectedRegion) {
      list = list.filter((l) => l.region === selectedRegion);
    }

    if (selectedStatus) {
      list = list.filter((l) => l.status_business === selectedStatus);
    }

    if (priceMin) {
      list = list.filter(
        (l) =>
          l.asking_price !== null && l.asking_price >= parseInt(priceMin) * 1000
      );
    }

    if (priceMax) {
      list = list.filter(
        (l) =>
          l.price_confidential ||
          (l.asking_price !== null &&
            l.asking_price <= parseInt(priceMax) * 1000)
      );
    }

    switch (sortBy) {
      case "price_asc":
        list.sort(
          (a, b) => (a.asking_price ?? Infinity) - (b.asking_price ?? Infinity)
        );
        break;
      case "price_desc":
        list.sort(
          (a, b) => (b.asking_price ?? -Infinity) - (a.asking_price ?? -Infinity)
        );
        break;
      case "popular":
        list.sort((a, b) => b.views_count - a.views_count);
        break;
      default:
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return list;
  }, [search, selectedCategories, selectedRegion, selectedStatus, priceMin, priceMax, sortBy]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const statusOptions: Array<{ value: BusinessStatus | ""; label: string }> = [
    { value: "", label: lang === "de" ? "Alle Status" : "All statuses" },
    {
      value: "active_profitable",
      label: lang === "de" ? "Aktiv & Profitabel" : "Active & Profitable",
    },
    {
      value: "in_development",
      label: lang === "de" ? "In Entwicklung" : "In development",
    },
    {
      value: "restructuring",
      label: lang === "de" ? "Sanierungsbedarf" : "Needs restructuring",
    },
  ];

  const clearFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedRegion("");
    setPriceMin("");
    setPriceMax("");
    setSelectedStatus("");
    setPage(1);
  };

  const hasFilters =
    search ||
    selectedCategories.length > 0 ||
    selectedRegion ||
    priceMin ||
    priceMax ||
    selectedStatus;

  const Sidebar = () => (
    <aside className="w-full md:w-[280px] flex-shrink-0">
      <div className="bg-white border border-[var(--border)] rounded-xl p-5 sticky top-20">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-sans text-sm font-semibold text-[var(--ink)]">
            {lang === "de" ? "Filter" : "Filters"}
          </h3>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="font-mono text-[11px] text-[var(--muted)] hover:text-[var(--red)] flex items-center gap-1"
            >
              <X size={12} />
              {lang === "de" ? "Zurücksetzen" : "Reset"}
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mb-5">
          <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Suche" : "Search"}
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={lang === "de" ? "Branche oder Ort..." : "Industry or city..."}
            className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans"
          />
        </div>

        {/* Region */}
        <div className="mb-5">
          <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Region" : "Region"}
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => { setSelectedRegion(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans bg-white"
          >
            <option value="">{lang === "de" ? "Alle Regionen" : "All regions"}</option>
            {DACH_REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Categories */}
        <div className="mb-5">
          <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Kategorie" : "Category"}
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {CATEGORIES.map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="rounded border-[var(--border)] text-[var(--accent)]"
                />
                <span className="font-sans text-sm text-[var(--ink)]">{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div className="mb-5">
          <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Kaufpreis (Tausend €)" : "Price (thousand €)"}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={priceMin}
              onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
              placeholder="Min"
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans"
            />
            <input
              type="number"
              value={priceMax}
              onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
              placeholder="Max"
              className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans"
            />
          </div>
        </div>

        {/* Business status */}
        <div className="mb-5">
          <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Unternehmensstatus" : "Business status"}
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value as BusinessStatus | ""); setPage(1); }}
            className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] font-sans bg-white"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="w-full py-2.5 bg-[var(--accent)] text-white font-sans text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          {lang === "de" ? "Filter anwenden" : "Apply filters"}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="font-fraunces text-[32px] text-[var(--ink)] mb-1">
            {lang === "de" ? "Unternehmen kaufen" : "Buy a business"}
          </h1>
          <p className="font-sans text-sm text-[var(--muted)]">
            {lang === "de"
              ? "DACH-weit – Deutschland, Österreich, Schweiz"
              : "DACH-wide – Germany, Austria, Switzerland"}
          </p>
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden flex items-center gap-2 mb-4 px-4 py-2 border border-[var(--border)] rounded-lg font-sans text-sm text-[var(--ink)]"
        >
          <SlidersHorizontal size={16} />
          {lang === "de" ? "Filter" : "Filters"}
          {hasFilters && (
            <span className="ml-1 bg-[var(--accent)] text-white text-[10px] font-mono rounded-full px-1.5 py-0.5">
              {selectedCategories.length + (selectedRegion ? 1 : 0) + (selectedStatus ? 1 : 0)}
            </span>
          )}
        </button>

        <div className="flex gap-6">
          {/* Sidebar — desktop always visible, mobile conditional */}
          <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
            <Sidebar />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-5">
              <p className="font-mono text-[12px] text-[var(--muted)]">
                <span className="text-[var(--ink)] font-medium">{filtered.length}</span>{" "}
                {lang === "de" ? "Inserate gefunden" : "listings found"}
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-[var(--muted)] hidden sm:block">
                  {lang === "de" ? "Sortierung:" : "Sort:"}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm font-sans border border-[var(--border)] rounded-lg px-3 py-1.5 outline-none focus:border-[var(--accent)] bg-white text-[var(--ink)]"
                >
                  <option value="newest">{lang === "de" ? "Neueste" : "Newest"}</option>
                  <option value="price_asc">{lang === "de" ? "Preis aufsteigend" : "Price: low to high"}</option>
                  <option value="price_desc">{lang === "de" ? "Preis absteigend" : "Price: high to low"}</option>
                  <option value="popular">{lang === "de" ? "Beliebteste" : "Most popular"}</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {paginated.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {paginated.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="font-fraunces text-xl text-[var(--ink)] mb-2">
                  {lang === "de" ? "Keine Inserate gefunden" : "No listings found"}
                </h3>
                <p className="font-sans text-sm text-[var(--muted)] mb-4">
                  {lang === "de"
                    ? "Versuchen Sie, die Filter anzupassen"
                    : "Try adjusting the filters"}
                </p>
                <button
                  onClick={clearFilters}
                  className="font-sans text-sm text-[var(--accent)] hover:underline"
                >
                  {lang === "de" ? "Filter zurücksetzen" : "Reset filters"}
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-sans text-[var(--ink)] disabled:opacity-40 hover:bg-[var(--surface2)] transition-colors"
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-sans transition-colors ${
                      p === page
                        ? "bg-[var(--accent)] text-white"
                        : "border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--surface2)]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-sans text-[var(--ink)] disabled:opacity-40 hover:bg-[var(--surface2)] transition-colors"
                >
                  →
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
