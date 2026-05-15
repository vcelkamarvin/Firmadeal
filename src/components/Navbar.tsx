"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, Menu, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES } from "@/lib/types";

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-baseline gap-0.5">
            <span className="font-fraunces text-[22px] text-[var(--ink)] font-semibold">
              Firmadeal
            </span>
            <span className="font-fraunces text-[22px] text-[var(--muted)]">
              .de
            </span>
          </Link>

          {/* Search bar — desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-[480px] items-center gap-0 border border-[var(--border)] rounded-lg overflow-hidden bg-white"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("nav.search_placeholder")}
              className="flex-1 px-3 py-2 text-sm font-sans text-[var(--ink)] placeholder-[var(--muted)] bg-transparent outline-none"
            />
            <div className="h-6 w-px bg-[var(--border)]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-sm font-sans text-[var(--muted)] bg-transparent outline-none cursor-pointer appearance-none"
            >
              <option value="">{t("nav.all_categories")}</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--accent)] text-white text-sm font-sans font-medium hover:opacity-90 transition-opacity"
            >
              <Search size={16} />
            </button>
          </form>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "de" ? "en" : "de")}
              className="hidden sm:flex items-center font-mono text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
            >
              <span className={lang === "de" ? "text-[var(--ink)] font-semibold" : ""}>DE</span>
              <span className="mx-1">|</span>
              <span className={lang === "en" ? "text-[var(--ink)] font-semibold" : ""}>EN</span>
            </button>

            <Link
              href="/login"
              className="hidden sm:block text-sm font-sans text-[var(--ink)] hover:text-[var(--accent)] transition-colors"
            >
              {t("nav.login")}
            </Link>

            <Link
              href="/sell"
              className="hidden sm:flex items-center bg-[var(--accent)] text-white text-sm font-sans font-medium px-5 py-2 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {t("nav.post_listing")}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden p-2 text-[var(--ink)]"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-[var(--border)] py-4 space-y-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("nav.search_placeholder")}
                className="flex-1 px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm"
              >
                <Search size={16} />
              </button>
            </form>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-sans text-[var(--ink)]"
                onClick={() => setMobileOpen(false)}
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/sell"
                className="flex-1 text-center bg-[var(--accent)] text-white text-sm font-sans font-medium px-5 py-2 rounded-full"
                onClick={() => setMobileOpen(false)}
              >
                {t("nav.post_listing")}
              </Link>
              <button
                onClick={() => setLang(lang === "de" ? "en" : "de")}
                className="font-mono text-xs text-[var(--muted)]"
              >
                {lang === "de" ? "EN" : "DE"}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
