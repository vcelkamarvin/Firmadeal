"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/listings", label: "Auswahl" },
  { href: "/unternehmenswert", label: "Bewertung" },
  { href: "/kaeufer", label: "Für Käufer" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  const isSellPage = pathname === "/sell";

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: 62,
        background: "rgba(255,255,255,0.86)",
        backdropFilter: "saturate(180%) blur(12px)",
        WebkitBackdropFilter: "saturate(180%) blur(12px)",
        borderBottom: scrolled ? "1px solid #e4ddcf" : "1px solid transparent",
        boxShadow: scrolled ? "0 4px 18px rgba(20,40,30,0.06)" : "none",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 16,
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
          /* Funnel mode — only a subtle exit link */
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
            {/* Desktop nav links — kept to the essentials */}
            <div className="desktop-only" style={{ display: "flex", gap: 28, alignItems: "center" }}>
              {LINKS.map(({ href, label }) => {
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    style={{
                      fontSize: 14,
                      color: active ? "#11241a" : "#5a6b61",
                      textDecoration: "none",
                      fontWeight: active ? 700 : 500,
                      borderBottom: active ? "2px solid #1a3329" : "2px solid transparent",
                      paddingBottom: 3,
                      transition: "color 0.15s, border-color 0.15s",
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </div>

            {/* Account icon — desktop (replaces the Dashboard text link) */}
            <Link href="/dashboard" className="desktop-only" aria-label="Konto" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 38, height: 38, borderRadius: 9, color: "#5a6b61", flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.7"/>
                <path d="M5 19c1.2-3 4-4.5 7-4.5S17.8 16 19 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
              </svg>
            </Link>

            {/* Primary CTA */}
            <Link href="/sell" className="fd-nav-cta" style={{
              background: "#1a3329", color: "white",
              padding: "0 18px", height: 40, borderRadius: 10,
              fontSize: 14, fontWeight: 700, textDecoration: "none",
              display: "flex", alignItems: "center", gap: 7, whiteSpace: "nowrap", flexShrink: 0,
            }}>
              Unternehmen einreichen
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M5.5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

      {/* ── MOBILE MENU — simple ── */}
      {!isSellPage && menuOpen && (
        <div
          className="mobile-only"
          style={{
            position: "fixed",
            top: 62, left: 0, right: 0, bottom: 0,
            background: "white",
            zIndex: 199,
            overflowY: "auto",
            padding: "12px 20px 28px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {LINKS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "18px 4px", borderBottom: "1px solid #f0ece2",
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: 17, fontWeight: 600, color: "#15281e", fontFamily: "inherit" }}>
                {item.label}
              </span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ))}

          {/* One clear CTA */}
          <Link
            href="/sell"
            onClick={() => setMenuOpen(false)}
            style={{
              display: "block", marginTop: 22,
              background: "#1a3329", color: "white",
              textAlign: "center", padding: "16px",
              borderRadius: 12, fontWeight: 700,
              fontSize: 16, textDecoration: "none",
              fontFamily: "inherit",
            }}
          >
            Unternehmen einreichen →
          </Link>
          <p style={{ textAlign: "center", fontSize: 12, color: "#9aa89f", marginTop: 8, fontFamily: "inherit" }}>
            Einmalig €87 · 0 % Provision · anonym
          </p>

          {/* Auth */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 22 }}>
            <Link href="/login" onClick={() => setMenuOpen(false)}
              style={{ fontSize: 14, color: "#7d8a82", textDecoration: "none", fontFamily: "inherit" }}>
              Anmelden
            </Link>
            <Link href="/dashboard" onClick={() => setMenuOpen(false)}
              style={{ fontSize: 14, color: "#7d8a82", textDecoration: "none", fontFamily: "inherit" }}>
              Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Spacer so content sits below fixed navbar */}
      <div style={{ height: 62 }} />
    </>
  );
}
