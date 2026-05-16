"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORIES } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { lang, setLang } = useLanguage();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q) router.push(`/listings?q=${encodeURIComponent(q)}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[var(--accent)] border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 h-14">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-baseline gap-0">
            <span className="font-sans text-[18px] font-bold text-white tracking-tight">Firmadeal</span>
            <span className="font-sans text-[18px] font-bold text-white/40">.de</span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[420px] items-center bg-white/10 border border-white/15 rounded-lg overflow-hidden">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={lang === "de" ? "Branche, Stadt oder Stichwort..." : "Industry, city or keyword..."}
              className="flex-1 px-3 py-2 text-sm font-sans text-white placeholder-white/40 bg-transparent outline-none"
            />
            <button type="submit" className="px-3 py-2 text-white/60 hover:text-white transition-colors">
              <Search size={15} />
            </button>
          </form>

          {/* Right */}
          <div className="ml-auto flex items-center gap-4">
            <Link href="/listings" className="hidden sm:block font-sans text-[13px] text-white/70 hover:text-white transition-colors">
              {lang === "de" ? "Inserate" : "Listings"}
            </Link>
            <Link href="/blog" className="hidden sm:block font-sans text-[13px] text-white/70 hover:text-white transition-colors">
              {lang === "de" ? "Ratgeber" : "Guides"}
            </Link>
            <Link href="/pricing" className="hidden sm:block font-sans text-[13px] text-white/70 hover:text-white transition-colors">
              {lang === "de" ? "Preise" : "Pricing"}
            </Link>
            <Link href="/login" className="hidden sm:block font-sans text-[13px] text-white/70 hover:text-white transition-colors">
              {lang === "de" ? "Anmelden" : "Login"}
            </Link>
            <button
              onClick={() => setLang(lang === "de" ? "en" : "de")}
              className="hidden sm:block font-mono text-[11px] text-white/40 hover:text-white/70 transition-colors"
            >
              {lang === "de" ? "EN" : "DE"}
            </button>
            <Link
              href="/sell"
              className="font-sans text-[13px] font-semibold text-[var(--accent)] bg-white px-4 py-1.5 rounded-full hover:bg-white/90 transition-colors whitespace-nowrap"
            >
              {lang === "de" ? "Inserieren" : "List now"}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden text-white">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="sm:hidden border-t border-white/10 py-4 space-y-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={lang === "de" ? "Suchen..." : "Search..."}
                className="flex-1 px-3 py-2 text-sm font-sans bg-white/10 border border-white/15 rounded-lg text-white placeholder-white/40 outline-none"
              />
              <button type="submit" className="px-3 py-2 bg-white/10 rounded-lg">
                <Search size={15} className="text-white" />
              </button>
            </form>
            <div className="flex gap-4">
              <Link href="/listings" className="font-sans text-sm text-white/70" onClick={() => setMobileOpen(false)}>
                {lang === "de" ? "Inserate" : "Listings"}
              </Link>
              <Link href="/sell" className="font-sans text-sm text-white font-semibold" onClick={() => setMobileOpen(false)}>
                {lang === "de" ? "Inserieren" : "List now"}
              </Link>
              <button onClick={() => setLang(lang === "de" ? "en" : "de")} className="font-mono text-xs text-white/40 ml-auto">
                {lang === "de" ? "EN" : "DE"}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
