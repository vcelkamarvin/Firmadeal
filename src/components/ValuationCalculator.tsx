"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase";

// ── Industry multiples (Gewinn-Multiple) ───────────────────────────────────────
const MULTIPLES: Record<string, { lo: number; hi: number }> = {
  "Gastronomie":      { lo: 2.5, hi: 4.0 },
  "IT & Tech":        { lo: 4.0, hi: 8.0 },
  "E-Commerce":       { lo: 2.0, hi: 4.0 },
  "Produktion":       { lo: 3.0, hi: 5.0 },
  "Gesundheit":       { lo: 3.0, hi: 5.0 },
  "Handwerk":         { lo: 2.0, hi: 3.5 },
  "Dienstleistungen": { lo: 2.0, hi: 4.0 },
  "Immobilien":       { lo: 3.0, hi: 6.0 },
};

const YEARS_OPTIONS = ["< 2 Jahre", "2–5 Jahre", "5–10 Jahre", "10+ Jahre"];

// ── Log scale helpers for revenue slider (€50k – €2M) ─────────────────────────
const LOG_MIN = Math.log(50_000);
const LOG_MAX = Math.log(2_000_000);

function sliderToRevenue(pos: number): number {
  return Math.round(Math.exp(LOG_MIN + (pos / 100) * (LOG_MAX - LOG_MIN)));
}

function revenueToSlider(val: number): number {
  return Math.round(((Math.log(Math.max(val, 50_000)) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * 100);
}

function fmtEur(n: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

interface Props {
  variant?: "full" | "hero";
}

export default function ValuationCalculator({ variant = "full" }: Props) {
  const [category, setCategory]       = useState("");
  const [years, setYears]             = useState("");
  const [revenuePos, setRevenuePos]   = useState(revenueToSlider(500_000));
  const [ebitda, setEbitda]           = useState(30_000);
  const [growthRate, setGrowthRate]   = useState(15);
  const [askingPrice, setAskingPrice] = useState("");
  const [priceEdited, setPriceEdited] = useState(false);

  const revenue = sliderToRevenue(revenuePos);

  // ── Real-time valuation calculation ──────────────────────────────────────────
  // Formula: EBITDA × industry_multiple × age_factor × growth_factor
  // growth_factor: 15% growth adds ~7.5% to value; 50% adds 25%
  const result = useMemo(() => {
    if (!category || ebitda <= 0) return null;
    const m              = MULTIPLES[category];
    const ageFactor      = years === "10+ Jahre" ? 1.15 : years === "5–10 Jahre" ? 1.07 : 1.0;
    const growthFactor   = 1 + (growthRate / 100) * 0.5;
    const lo = Math.round(ebitda * m.lo * ageFactor * growthFactor);
    const hi = Math.round(ebitda * m.hi * ageFactor * growthFactor);
    return { lo, hi };
  }, [category, years, ebitda, growthRate]);

  // Auto-seed asking price from valuation midpoint (unless user edited it)
  useEffect(() => {
    if (result && !priceEdited) {
      setAskingPrice(String(Math.round((result.lo + result.hi) / 2)));
    }
  }, [result, priceEdited]);

  // Persist estimate to Supabase when category+ebitda are set
  useEffect(() => {
    if (!result || !category) return;
    const timer = setTimeout(async () => {
      try {
        const supabase = createClient();
        await supabase.from("valuation_estimates").insert({
          business_type: category,
          years_in_operation: years || "unbekannt",
          annual_revenue: Math.round(revenue * 100),
          estimated_value_low: Math.round(result.lo * 100),
          estimated_value_high: Math.round(result.hi * 100),
        });
      } catch { /* ignore */ }
    }, 2000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.lo, result?.hi]);

  // ── HERO VARIANT ──────────────────────────────────────────────────────────────
  if (variant === "hero") {
    return (
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "28px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent)", marginBottom: "4px" }}>
            Kostenlose Bewertung
          </p>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#111", lineHeight: 1.2, marginBottom: "4px" }}>
            Was ist Ihr Unternehmen wert?
          </h3>
          <p style={{ fontSize: "12px", color: "#888" }}>Echtzeit-Schätzung · DACH-Marktdaten 2025</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Category */}
          <div>
            <label style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888", display: "block", marginBottom: "5px" }}>
              Branche
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "13px", color: "#111", background: "white" }}
            >
              <option value="">Branche wählen…</option>
              {Object.keys(MULTIPLES).map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          {/* EBITDA */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
              <label style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888" }}>
                EBITDA / Jahresgewinn
              </label>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#111" }}>{fmtEur(ebitda)}</span>
            </div>
            <input
              type="number" min={0} max={400_000} step={1_000} value={ebitda}
              onChange={(e) => setEbitda(Math.max(0, parseInt(e.target.value) || 0))}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e5e5", borderRadius: "8px", fontSize: "13px", color: "#111", background: "white" }}
              placeholder="z.B. 30000"
            />
          </div>

          {/* Growth rate */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
              <label style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888" }}>
                Wachstumsrate
              </label>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#111" }}>{growthRate}%/Jahr</span>
            </div>
            <input
              type="range" min={0} max={50} step={1} value={growthRate}
              onChange={(e) => setGrowthRate(parseInt(e.target.value))}
              className="w-full h-1.5 rounded-full bg-[var(--border)] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:rounded-full"
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "3px" }}>
              <span style={{ fontSize: "10px", color: "#aaa" }}>0%</span>
              <span style={{ fontSize: "10px", color: "#aaa" }}>50%+</span>
            </div>
          </div>

          {/* Live result */}
          {result ? (
            <div style={{ background: "#f0f7f4", borderRadius: "10px", padding: "14px", border: "1px solid #d1e8dc" }}>
              <p style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: "4px" }}>
                Algorithmische Schätzung
              </p>
              <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--accent)", letterSpacing: "-0.02em", marginBottom: "6px" }}>
                {fmtEur(result.lo)} – {fmtEur(result.hi)}
              </div>
              <p style={{ fontSize: "10px", color: "#888", marginBottom: "10px" }}>
                Basis: {MULTIPLES[category]?.lo}×–{MULTIPLES[category]?.hi}× EBITDA · Branche: {category}
              </p>
              {/* Asking price override */}
              <div>
                <label style={{ fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666", display: "block", marginBottom: "4px" }}>
                  Ihr Kaufpreis (bearbeitbar)
                </label>
                <input
                  type="number"
                  value={askingPrice}
                  onChange={(e) => { setAskingPrice(e.target.value); setPriceEdited(true); }}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #ccc", borderRadius: "6px", fontSize: "14px", fontWeight: 700, color: "var(--accent)", background: "white" }}
                  placeholder="Eigenen Preis eingeben"
                />
                <p style={{ fontSize: "10px", color: "#aaa", marginTop: "3px" }}>
                  Frei anpassbar — Schätzung als Richtwert
                </p>
              </div>
            </div>
          ) : (
            <div style={{ background: "#f8f8f8", borderRadius: "10px", padding: "14px", textAlign: "center" }}>
              <p style={{ fontSize: "12px", color: "#aaa" }}>Wählen Sie eine Branche und geben Sie Ihren Gewinn ein</p>
            </div>
          )}

          <Link
            href="/sell"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "12px", background: "var(--accent)", color: "white",
              borderRadius: "8px", fontSize: "14px", fontWeight: 700, textDecoration: "none",
            }}
          >
            Jetzt kostenlos inserieren <ArrowRight size={14} />
          </Link>
          <p style={{ fontSize: "10px", color: "#aaa", textAlign: "center" }}>
            Indikative Schätzung · Keine Finanzberatung · Marktdaten 2024/25
          </p>
        </div>
      </div>
    );
  }

  // ── FULL VARIANT ──────────────────────────────────────────────────────────────
  return (
    <section className="bg-[var(--neutral-100)] border-y border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">

          {/* Left — inputs */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-[var(--cta)] rounded-full" />
              <p className="font-sans text-[11px] font-semibold text-[var(--muted)] uppercase tracking-[0.2em]">
                Kostenlose Schätzung
              </p>
            </div>
            <h2 className="font-sans text-[28px] font-bold text-[var(--ink)] tracking-tight mb-2">
              Was ist Ihr Unternehmen wert?
            </h2>
            <p className="font-sans text-[14px] text-[var(--muted)] mb-8">
              Echtzeit-Bewertung basierend auf EBITDA-Multiplikatoren — Ergebnis aktualisiert sich sofort.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="font-sans text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide block mb-2">
                  Unternehmensart *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans bg-white outline-none focus:border-[var(--accent)] transition-colors"
                >
                  <option value="">Branche wählen…</option>
                  {Object.keys(MULTIPLES).map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <label className="font-sans text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide block mb-2">
                  Jahre am Markt
                </label>
                <select
                  value={years}
                  onChange={(e) => setYears(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans bg-white outline-none focus:border-[var(--accent)] transition-colors"
                >
                  <option value="">Zeitraum wählen…</option>
                  {YEARS_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Revenue slider */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="font-sans text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide">
                  Jahresumsatz
                </label>
                <span className="font-sans text-[15px] font-bold text-[var(--ink)] tabular-nums">{fmtEur(revenue)}</span>
              </div>
              <input
                type="range" min={0} max={100} step={1} value={revenuePos}
                onChange={(e) => setRevenuePos(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-full bg-[var(--border)] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:rounded-full"
              />
              <div className="flex justify-between mt-1">
                <span className="font-sans text-[10px] text-[var(--muted)]">€50k</span>
                <span className="font-sans text-[10px] text-[var(--muted)]">€2M</span>
              </div>
            </div>

            {/* EBITDA input */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <label className="font-sans text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide">
                  EBITDA (Gewinn vor Zinsen & Steuern)
                </label>
                <span className="font-sans text-[15px] font-bold text-[var(--ink)] tabular-nums">{fmtEur(ebitda)}</span>
              </div>
              <input
                type="number" min={0} max={400_000} step={1_000} value={ebitda}
                onChange={(e) => setEbitda(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans bg-white outline-none focus:border-[var(--accent)] transition-colors tabular-nums"
                placeholder="z.B. 30000"
              />
              <div className="flex justify-between mt-1">
                <span className="font-sans text-[10px] text-[var(--muted)]">€0</span>
                <span className="font-sans text-[10px] text-[var(--muted)]">max. €400k</span>
              </div>
            </div>

            {/* Growth rate slider */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="font-sans text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide">
                  Wachstumsrate p.a.
                </label>
                <span className={`font-sans text-[15px] font-bold tabular-nums ${growthRate >= 20 ? "text-[var(--green)]" : "text-[var(--ink)]"}`}>
                  {growthRate}%
                </span>
              </div>
              <input
                type="range" min={0} max={50} step={1} value={growthRate}
                onChange={(e) => setGrowthRate(parseInt(e.target.value))}
                className="w-full h-1.5 rounded-full bg-[var(--border)] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:rounded-full"
              />
              <div className="flex justify-between mt-1">
                <span className="font-sans text-[10px] text-[var(--muted)]">Stagnierend</span>
                <span className="font-sans text-[10px] text-[var(--muted)]">Hochstartend (50%+)</span>
              </div>
            </div>

            <p className="font-sans text-[11px] text-[var(--muted)] leading-relaxed">
              Das Ergebnis rechts aktualisiert sich automatisch. Passen Sie den Kaufpreis frei an.
            </p>
          </div>

          {/* Right — live result */}
          <div className="lg:sticky lg:top-24">
            {result ? (
              <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                {/* Estimate header */}
                <div className="bg-[var(--accent)] px-6 py-5">
                  <p className="font-sans text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-1">
                    Algorithmische Schätzung
                  </p>
                  <div className="font-sans text-[34px] font-bold text-white tracking-tight leading-none tabular-nums">
                    {fmtEur(result.lo)} – {fmtEur(result.hi)}
                  </div>
                  <p className="font-sans text-[11px] text-white/50 mt-2">
                    Basis: {MULTIPLES[category]?.lo}×–{MULTIPLES[category]?.hi}× EBITDA · {category}
                  </p>
                </div>

                <div className="px-6 py-5 space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                    <span className="font-sans text-[13px] text-[var(--muted)]">Jahresumsatz</span>
                    <span className="font-sans text-[13px] font-semibold text-[var(--ink)] tabular-nums">{fmtEur(revenue)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                    <span className="font-sans text-[13px] text-[var(--muted)]">EBITDA</span>
                    <span className="font-sans text-[13px] font-semibold text-[var(--green)] tabular-nums">{fmtEur(ebitda)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                    <span className="font-sans text-[13px] text-[var(--muted)]">Wachstumsrate</span>
                    <span className="font-sans text-[13px] font-semibold text-[var(--ink)]">{growthRate}%/Jahr</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[var(--border)]">
                    <span className="font-sans text-[13px] text-[var(--muted)]">Branche</span>
                    <span className="font-sans text-[13px] font-semibold text-[var(--ink)]">{category}</span>
                  </div>

                  {/* Editable asking price */}
                  <div className="pt-2">
                    <label className="font-sans text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide block mb-2">
                      Ihr endgültiger Kaufpreis
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-sans text-[14px] font-bold text-[var(--accent)]">€</span>
                      <input
                        type="number"
                        value={askingPrice}
                        onChange={(e) => { setAskingPrice(e.target.value); setPriceEdited(true); }}
                        className="w-full pl-8 pr-3 py-3 border-2 border-[var(--accent)] rounded-xl text-[17px] font-bold text-[var(--accent)] font-sans outline-none focus:ring-2 focus:ring-[var(--accent)]/20 tabular-nums"
                        placeholder="Eigenen Preis eingeben"
                      />
                    </div>
                    <p className="font-sans text-[10px] text-[var(--muted)] mt-1.5">
                      Frei anpassbar — Schätzung oben ist ein Richtwert
                    </p>
                  </div>

                  <div className="pt-2">
                    <p className="font-sans text-[10px] text-[var(--muted)] mb-4 leading-relaxed">
                      Indikative Schätzung · Keine Finanzberatung · Marktdaten 2024/25
                    </p>
                    <Link
                      href="/sell"
                      className="flex items-center justify-center gap-2 w-full py-3 bg-[var(--cta)] text-white font-sans font-bold text-sm rounded-xl hover:bg-[var(--cta-hover)] transition-colors"
                    >
                      Jetzt inserieren <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-[var(--border)] rounded-2xl p-6">
                <p className="font-sans text-[11px] font-semibold text-[var(--muted)] uppercase tracking-widest mb-4">
                  Branchenmultiplikatoren 2025
                </p>
                <div className="space-y-3">
                  {Object.entries(MULTIPLES).map(([cat, m]) => (
                    <div
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0 cursor-pointer rounded px-2 -mx-2 transition-colors ${category === cat ? "bg-[var(--accent-light)]" : "hover:bg-[var(--surface2)]"}`}
                    >
                      <span className="font-sans text-[13px] text-[var(--ink)]">{cat}</span>
                      <span className="font-sans text-[12px] text-[var(--muted)] tabular-nums">
                        {m.lo}× – {m.hi}×
                      </span>
                    </div>
                  ))}
                </div>
                <p className="font-sans text-[11px] text-[var(--muted)] mt-4 text-center">
                  Klicken Sie auf eine Branche um zu starten →
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
