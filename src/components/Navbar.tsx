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
  const [promoCode, setPromoCode] = useState("");

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
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden text-white"
              style={{ background: "none", border: "none", cursor: "pointer", padding: "10px", minHeight: 44, minWidth: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
              aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div style={{
            position: "fixed", inset: 0, background: "#1a3329", zIndex: 999,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "8px", padding: "24px",
          }}>
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "white", cursor: "pointer", padding: "8px", fontSize: 24 }}
              aria-label="Menü schließen"
            >
              <X size={24} />
            </button>

            {/* Search */}
            <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }} style={{ width: "100%", maxWidth: 340, marginBottom: 16, display: "flex", gap: 8 }}>
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={lang === "de" ? "Branche, Stadt, Stichwort..." : "Industry, city, keyword..."}
                style={{ flex: 1, padding: "12px 16px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, color: "white", fontSize: 16, outline: "none", fontFamily: "inherit" }}
              />
              <button type="submit" style={{ padding: "12px 14px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, cursor: "pointer", color: "white" }}>
                <Search size={16} />
              </button>
            </form>

            {/* Nav links */}
            {[
              { href: "/listings", de: "Inserate",  en: "Listings" },
              { href: "/blog",     de: "Ratgeber",  en: "Guides"   },
              { href: "/pricing",  de: "Preise",    en: "Pricing"  },
              { href: "/login",    de: "Anmelden",  en: "Login"    },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{ color: "rgba(255,255,255,0.8)", fontSize: 20, fontWeight: 600, textDecoration: "none", padding: "12px 0", width: "100%", maxWidth: 340, textAlign: "center", fontFamily: "inherit" }}
              >
                {lang === "de" ? item.de : item.en}
              </Link>
            ))}

            {/* Promo code input */}
            <div style={{ width: "100%", maxWidth: 340, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "14px 16px", margin: "4px 0" }}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "inherit" }}>
                🎁 Aktionscode
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="z.B. SOMMER2026"
                  style={{
                    flex: 1, height: 40, padding: "0 12px",
                    borderRadius: 8, border: "none", fontSize: 15,
                    fontFamily: "inherit", background: "rgba(255,255,255,0.9)",
                    outline: "none", color: "#111",
                  }}
                />
                <button
                  onClick={() => {
                    if (promoCode.trim()) {
                      try { localStorage.setItem("firmadeal_promo", promoCode.trim()); } catch {}
                      setMobileOpen(false);
                      router.push("/sell");
                    }
                  }}
                  style={{
                    height: 40, padding: "0 14px", background: "#4e9a66", color: "white",
                    border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", fontSize: 16,
                  }}
                >
                  →
                </button>
              </div>
            </div>

            {/* Primary CTA */}
            <Link
              href="/sell"
              onClick={() => setMobileOpen(false)}
              style={{ marginTop: 8, background: "white", color: "#1a3329", padding: "16px 40px", borderRadius: 40, fontWeight: 700, textDecoration: "none", fontSize: 16, fontFamily: "inherit", textAlign: "center", width: "100%", maxWidth: 340, display: "block" }}
            >
              {lang === "de" ? "Jetzt inserieren →" : "List now →"}
            </Link>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, textAlign: "center", margin: "4px 0 0", fontFamily: "inherit" }}>
              7 Tage gratis · 0% Provision · Jederzeit kündbar
            </p>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "de" ? "en" : "de")}
              style={{ marginTop: 8, background: "none", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
            >
              {lang === "de" ? "EN" : "DE"}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
