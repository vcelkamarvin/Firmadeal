"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [promoCode, setPromoCode] = useState("FRUEHJAHR2026");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const handlePromoRedeem = () => {
    if (promoCode.trim()) {
      try { localStorage.setItem("firmadeal_promo", promoCode.trim().toUpperCase()); } catch {}
    }
    setMenuOpen(false);
    router.push("/sell");
  };

  const isSellPage = pathname === "/sell";

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: 60,
        background: "white",
        borderBottom: scrolled ? "1px solid #e5e5e5" : "1px solid transparent",
        boxShadow: scrolled ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 12,
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flex: 1 }}>
          <div style={{
            width: 28, height: 28, background: "#1a3329", borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>
            F
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1a3329", letterSpacing: "-0.3px" }}>
            Firmadeal
          </span>
        </Link>

        {isSellPage ? (
          /* Funnel mode — only show a subtle exit link */
          <Link href="/" style={{
            fontSize: 13, color: "#999", textDecoration: "none",
            display: "flex", alignItems: "center", gap: 5, flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M8.5 2L3.5 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Abbrechen
          </Link>
        ) : (
          <>
            {/* Desktop nav links */}
            <div className="desktop-only" style={{ display: "flex", gap: 24, alignItems: "center" }}>
              {[
                { href: "/listings", label: "Auswahl" },
                { href: "/blog", label: "Ratgeber" },
                { href: "/pricing", label: "Preise" },
                { href: "/dashboard", label: "Dashboard" },
              ].map(({ href, label }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      fontSize: 14,
                      color: active ? "#1a3329" : "#666",
                      textDecoration: "none",
                      fontWeight: active ? 600 : 400,
                      borderBottom: active ? "2px solid #1a3329" : "2px solid transparent",
                      paddingBottom: 2,
                      transition: "color 0.15s, border-color 0.15s",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Inserieren CTA */}
            <Link href="/sell" style={{
              background: "#1a3329", color: "white",
              padding: "0 16px", height: 38, borderRadius: 8,
              fontSize: 14, fontWeight: 600, textDecoration: "none",
              display: "flex", alignItems: "center", whiteSpace: "nowrap", flexShrink: 0,
            }}>
              Unternehmen einreichen
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className="mobile-only"
              onClick={() => setMenuOpen(v => !v)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                width: 40, height: 40, display: "flex",
                alignItems: "center", justifyContent: "center",
                borderRadius: 8, flexShrink: 0, color: "#333",
              }}
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </>
        )}
      </nav>

      {/* ── MOBILE MENU OVERLAY ── */}
      {!isSellPage && menuOpen && (
        <div
          className="mobile-only"
          style={{
            position: "fixed",
            top: 60, left: 0, right: 0, bottom: 0,
            background: "white",
            zIndex: 199,
            overflowY: "auto",
            padding: "24px 20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Nav items */}
          {[
            { href: "/listings", label: "Kuratierte Auswahl ansehen", icon: "🔍", desc: "Öffentliche Mandate" },
            { href: "/blog", label: "Ratgeber & Insights", icon: "📰", desc: "Tipps zu Verkauf, Bewertung & Nachfolge" },
            { href: "/sell", label: "Unternehmen vertraulich einreichen", icon: "📋", desc: "Einmalig €87 · 0% Provision" },
            { href: "/pricing", label: "Preise & Pläne", icon: "💳", desc: "Einmalig €87" },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "16px 4px", borderBottom: "1px solid #f0f0f0",
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: 24, flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#111", margin: 0, fontFamily: "inherit" }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 13, color: "#888", margin: "2px 0 0", fontFamily: "inherit" }}>
                  {item.desc}
                </p>
              </div>
              <svg style={{ marginLeft: "auto", flexShrink: 0 }} width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ))}

          {/* Promo code section */}
          <div style={{
            margin: "24px 0 0", padding: "16px",
            background: "#f5faf7", borderRadius: 12,
            border: "1px solid #c6e6d0",
          }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#1a3329", margin: "0 0 4px", fontFamily: "inherit" }}>
              🎁 Aktionscode einlösen
            </p>
            <p style={{ fontSize: 12, color: "#555", margin: "0 0 10px", fontFamily: "inherit" }}>
              Code eingeben und Rabatt auf die einmalige Gebühr erhalten
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                style={{
                  flex: 1, height: 44, padding: "0 12px",
                  borderRadius: 8, border: "1.5px solid #2d5a3d",
                  fontSize: 14, background: "white",
                  color: "#1a3329", fontWeight: 600,
                  outline: "none", fontFamily: "inherit",
                }}
              />
              <button
                onClick={handlePromoRedeem}
                style={{
                  height: 44, padding: "0 16px",
                  background: "#1a3329", color: "white",
                  border: "none", borderRadius: 8,
                  fontWeight: 600, cursor: "pointer",
                  fontSize: 14, whiteSpace: "nowrap",
                  fontFamily: "inherit",
                }}
              >
                Einlösen →
              </button>
            </div>
          </div>

          {/* Bottom CTA */}
          <Link
            href="/sell"
            onClick={() => setMenuOpen(false)}
            style={{
              display: "block", marginTop: 20,
              background: "#1a3329", color: "white",
              textAlign: "center", padding: "16px",
              borderRadius: 10, fontWeight: 700,
              fontSize: 17, textDecoration: "none",
              fontFamily: "inherit",
            }}
          >
            Unternehmen vertraulich einreichen →
          </Link>
          <p style={{ textAlign: "center", fontSize: 12, color: "#aaa", marginTop: 8, fontFamily: "inherit" }}>
            Einmalig €87 · 0% Provision · Anonym bis zum Abschluss
          </p>

          {/* Auth links */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 20 }}>
            <Link href="/login" onClick={() => setMenuOpen(false)}
              style={{ fontSize: 14, color: "#888", textDecoration: "none", fontFamily: "inherit" }}>
              Anmelden
            </Link>
            <Link href="/dashboard" onClick={() => setMenuOpen(false)}
              style={{ fontSize: 14, color: "#888", textDecoration: "none", fontFamily: "inherit" }}>
              Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Spacer so content sits below fixed navbar */}
      <div style={{ height: 60 }} />
    </>
  );
}
