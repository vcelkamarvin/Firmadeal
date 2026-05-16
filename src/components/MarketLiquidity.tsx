"use client";

import { useState, useEffect, useRef } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { MOCK_LISTINGS } from "@/lib/mockData";

// Fixed baseline + real listing count
const BASE_LISTINGS = 73;
const TOTAL_LISTINGS = BASE_LISTINGS + MOCK_LISTINGS.filter((l) => l.status === "active").length;

const VISITOR_DATA = [
  { month: "Jan", value: 1200 },
  { month: "Feb", value: 2800 },
  { month: "Mär", value: 4500 },
  { month: "Apr", value: 6800 },
  { month: "Mai", value: 8874 },
];

const OFFER_DATA = [
  { month: "Jan", value: 32 },
  { month: "Feb", value: 75 },
  { month: "Mär", value: 148 },
  { month: "Apr", value: 220 },
  { month: "Mai", value: 319 },
];

const STATS = [
  { raw: TOTAL_LISTINGS, format: (n: number) => n.toString(),           label: "Aktive Inserate",          labelEn: "Active listings",         sub: "auf dem Marktplatz",       subEn: "on the marketplace"    },
  { raw: 8874,           format: (n: number) => n.toLocaleString("de"), label: "Plattform-Besucher/Monat", labelEn: "Platform visitors/month", sub: "Mai 2026",                  subEn: "May 2026"              },
  { raw: 319,            format: (n: number) => n.toString(),           label: "Angebote/Monat",           labelEn: "Offers/month",           sub: "eingereichte Kaufangebote", subEn: "submitted bids"        },
  { raw: 4102,           format: (n: number) => n.toLocaleString("de"), label: "Verifizierte Käufer",      labelEn: "Verified buyers",        sub: "aktiv suchend",            subEn: "actively searching"    },
];

const METRICS = [
  { raw: 39,  suffix: " Tage", label: "Ø Tage bis erstes Angebot", labelEn: "Avg. days to first offer" },
  { raw: 34,  format: (n: number) => (n / 10).toFixed(1).replace(".", ",") + "×", label: "Ø Ziel-Multiple (EBITDA)", labelEn: "Avg. target multiple (EBITDA)" },
  { raw: 74,  suffix: "%",     label: "Abschlussrate",             labelEn: "Close rate"               },
];

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useCountUp(target: number, running: boolean, duration = 1400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, running, duration]);
  return count;
}

// ── Stat tile ─────────────────────────────────────────────────────────────────

function StatTile({ raw, format, label, sub, running }: {
  raw: number; format: (n: number) => string; label: string; sub: string; running: boolean;
}) {
  const count = useCountUp(raw, running);
  return (
    <div className="bg-[var(--surface2)] rounded-xl p-5 border border-[var(--border)] relative overflow-hidden">
      <span className="absolute top-3 right-3 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--green)] opacity-60" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--green)]" />
      </span>
      <div className="font-sans text-[32px] font-bold text-[var(--accent)] leading-none tabular-nums mb-1">
        {format(count)}
      </div>
      <div className="font-sans text-[13px] font-semibold text-[var(--ink)]">{label}</div>
      <div className="font-sans text-[11px] text-[var(--muted)] mt-0.5">{sub}</div>
    </div>
  );
}

// ── Metric box ────────────────────────────────────────────────────────────────

function MetricBox({ raw, suffix, format, label, running }: {
  raw: number; suffix?: string; format?: (n: number) => string; label: string; running: boolean;
}) {
  const count = useCountUp(raw, running, 1600);
  return (
    <div className="text-center p-5 bg-[var(--ink)] rounded-xl">
      <div className="font-sans text-[28px] font-bold text-white leading-none tabular-nums mb-1">
        {format ? format(count) : `${count}${suffix ?? ""}`}
      </div>
      <div className="font-sans text-[12px] text-white/60">{label}</div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MarketLiquidity({ lang }: { lang: string }) {
  const { ref, inView } = useInView();

  return (
    <section className="bg-white border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* Header */}
        <div className="mb-8">
          <p className="font-sans text-[11px] font-bold text-[var(--accent)] uppercase tracking-[0.2em] mb-1">
            {lang === "de" ? "Marktliquidität & Plattform" : "Market liquidity & platform"}
          </p>
          <h2 className="font-sans text-[24px] font-bold text-[var(--ink)] tracking-tight">
            {lang === "de" ? "Ein aktiver Markt für Ihren Verkauf" : "An active market for your sale"}
          </h2>
          <p className="font-sans text-[14px] text-[var(--muted)] mt-1">
            {lang === "de"
              ? "Echte Daten. Wachsende Käuferbasis. Transparente Abschlussraten."
              : "Real data. Growing buyer base. Transparent close rates."}
          </p>
        </div>

        {/* KPI tiles — IntersectionObserver trigger */}
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {STATS.map((s) => (
            <StatTile
              key={s.label}
              raw={s.raw}
              format={s.format}
              label={lang === "de" ? s.label : s.labelEn}
              sub={lang === "de" ? s.sub : s.subEn}
              running={inView}
            />
          ))}
        </div>

        {/* Charts row — conditionally mounted on scroll for Recharts animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Visitor line chart */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="font-sans text-[13px] font-semibold text-[var(--ink)]">
                {lang === "de" ? "Plattform-Besucher" : "Platform visitors"}
              </p>
              <span className="font-sans text-[11px] font-bold text-[var(--green)] bg-green-50 px-2 py-0.5 rounded-full">
                +640% {lang === "de" ? "seit Launch" : "since launch"}
              </span>
            </div>
            <p className="font-sans text-[11px] text-[var(--muted)] mb-4">
              {lang === "de" ? "Monatliche Besucher · Jan–Mai 2026" : "Monthly visitors · Jan–May 2026"}
            </p>
            <div style={{ height: 160 }}>
              {inView && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={VISITOR_DATA} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
                      tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} width={36}
                    />
                    <Tooltip
                      formatter={(v) => [(v as number).toLocaleString("de-DE"), lang === "de" ? "Besucher" : "Visitors"]}
                      contentStyle={{ fontSize: 13, borderRadius: 8, border: "1px solid #e5e5e5" }}
                    />
                    <Line
                      type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2.5}
                      dot={{ fill: "var(--accent)", r: 4 }} activeDot={{ r: 6 }}
                      isAnimationActive animationDuration={1800} animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Offer bar chart */}
          <div className="bg-white border border-[var(--border)] rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="font-sans text-[13px] font-semibold text-[var(--ink)]">
                {lang === "de" ? "Eingereichte Kaufangebote" : "Submitted purchase offers"}
              </p>
              <span className="font-sans text-[11px] font-bold text-[var(--green)] bg-green-50 px-2 py-0.5 rounded-full">
                +897% {lang === "de" ? "seit Launch" : "since launch"}
              </span>
            </div>
            <p className="font-sans text-[11px] text-[var(--muted)] mb-4">
              {lang === "de" ? "Monatliche Angebote · Jan–Mai 2026" : "Monthly offers · Jan–May 2026"}
            </p>
            <div style={{ height: 160 }}>
              {inView && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={OFFER_DATA} barSize={28} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip
                      formatter={(v) => [v as number, lang === "de" ? "Angebote" : "Offers"]}
                      contentStyle={{ fontSize: 13, borderRadius: 8, border: "1px solid #e5e5e5" }}
                    />
                    <Bar
                      dataKey="value" fill="#2d5a3d" radius={[4, 4, 0, 0]}
                      isAnimationActive animationDuration={1400} animationBegin={200} animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Bottom metrics */}
        <div className="grid grid-cols-3 gap-4">
          {METRICS.map((m) => (
            <MetricBox
              key={m.label}
              raw={m.raw}
              suffix={m.suffix}
              format={m.format}
              label={lang === "de" ? m.label : m.labelEn}
              running={inView}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
