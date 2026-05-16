"use client";

import { Info } from "lucide-react";

interface Row {
  label: string;
  value: string;
  help?: string;
  highlight?: boolean;
  valueColor?: string;
}

interface ListingFinancialsProps {
  rows: Row[];
  title?: string;
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="tooltip-container ml-1 inline-flex items-center">
      <Info size={12} className="text-[var(--muted)] cursor-help" />
      <span className="tooltip-content">{text}</span>
    </span>
  );
}

export default function ListingFinancials({ rows, title = "Kennzahlen" }: ListingFinancialsProps) {
  return (
    <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[var(--border)]">
        <h3 className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-widest">{title}</h3>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex items-center justify-between px-5 py-3.5 ${row.highlight ? "border-l-[3px] border-l-[var(--green-500)]" : ""}`}
          >
            <span className="font-sans text-[13px] text-[var(--muted)] flex items-center">
              {row.label}
              {row.help && <Tooltip text={row.help} />}
            </span>
            <span
              className={`font-sans text-[14px] font-semibold tabular-nums ${
                row.valueColor === "green"  ? "text-[var(--green-500)]" :
                row.valueColor === "amber"  ? "text-amber-600"          :
                row.valueColor === "red"    ? "text-[var(--danger)]"    :
                "text-[var(--ink)]"
              }`}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helper to build rows from a listing ──────────────────────────────────────

export function buildFinancialRows(listing: {
  asking_price:    number | null;
  price_confidential: boolean;
  annual_revenue:  number | null;
  ebitda:          number | null;
  employees:       number | null;
  founded_year:    number | null;
  city:            string;
  country:         string;
  region:          string;
}, lang: "de" | "en" = "de"): Row[] {
  const fmtEur = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  const margin = listing.ebitda && listing.annual_revenue
    ? (listing.ebitda / listing.annual_revenue) * 100
    : null;

  const multiple = listing.asking_price && listing.ebitda && listing.ebitda > 0
    ? listing.asking_price / listing.ebitda
    : null;

  const revenueMultiple = listing.asking_price && listing.annual_revenue && listing.annual_revenue > 0
    ? listing.asking_price / listing.annual_revenue
    : null;

  const countryLabel: Record<string, string> = { DE: "Deutschland", AT: "Österreich", CH: "Schweiz" };

  const rows: Row[] = [];

  if (!listing.price_confidential && listing.asking_price) {
    rows.push({
      label: lang === "de" ? "Kaufpreis" : "Asking Price",
      value: fmtEur(listing.asking_price),
      help: lang === "de" ? "Vom Verkäufer geforderter Preis." : "Price requested by the seller.",
    });
  } else if (listing.price_confidential) {
    rows.push({ label: lang === "de" ? "Kaufpreis" : "Asking Price", value: lang === "de" ? "Auf Anfrage" : "On request" });
  }

  if (listing.annual_revenue) {
    rows.push({
      label: lang === "de" ? "Jahresumsatz" : "Annual Revenue",
      value: fmtEur(listing.annual_revenue),
      help: lang === "de" ? "Gesamte Einnahmen des Unternehmens pro Jahr." : "Total company revenue per year.",
    });
  }

  if (listing.ebitda) {
    rows.push({
      label: "EBITDA",
      value: fmtEur(listing.ebitda),
      help: lang === "de"
        ? "Das ist der Gewinn vor Bankzinsen, Steuern und Abschreibungen — der wichtigste Vergleichswert beim Unternehmenskauf."
        : "Earnings before interest, taxes, depreciation & amortization — the key benchmark for business valuation.",
      valueColor: "green",
    });
  }

  if (margin !== null) {
    rows.push({
      label: lang === "de" ? "Gewinnmarge" : "Profit Margin",
      value: `${margin.toFixed(1)}%`,
      help: lang === "de"
        ? `Von jedem Euro Umsatz bleiben ${margin.toFixed(1)} Cent als Gewinn (EBITDA) übrig.`
        : `${margin.toFixed(1)} cents of every euro in revenue remain as profit (EBITDA).`,
      highlight: true,
      valueColor: margin >= 20 ? "green" : margin >= 10 ? "amber" : "red",
    });
  }

  if (multiple !== null) {
    rows.push({
      label: lang === "de" ? "EBITDA-Multiple" : "EBITDA Multiple",
      value: `${multiple.toFixed(1)}×`,
      help: lang === "de"
        ? `Ein Multiple von ${multiple.toFixed(1)}× bedeutet: Sie zahlen ${multiple.toFixed(1)} Jahresgewinne für das Unternehmen. Branchenüblich: 3–6×.`
        : `A multiple of ${multiple.toFixed(1)}× means you pay ${multiple.toFixed(1)} annual profits for the business. Industry norm: 3–6×.`,
      highlight: true,
    });
  }

  if (revenueMultiple !== null) {
    rows.push({
      label: lang === "de" ? "Umsatz-Multiple" : "Revenue Multiple",
      value: `${revenueMultiple.toFixed(2)}×`,
      help: lang === "de" ? "Kaufpreis geteilt durch Jahresumsatz." : "Asking price divided by annual revenue.",
    });
  }

  if (listing.employees) {
    rows.push({ label: lang === "de" ? "Mitarbeiter" : "Employees", value: `${listing.employees}` });
  }

  if (listing.founded_year) {
    rows.push({
      label: lang === "de" ? "Gegründet" : "Founded",
      value: `${listing.founded_year} (${new Date().getFullYear() - listing.founded_year} ${lang === "de" ? "Jahre" : "years"})`,
    });
  }

  rows.push({
    label: lang === "de" ? "Standort" : "Location",
    value: `${listing.city}, ${countryLabel[listing.country] ?? listing.country}`,
  });

  return rows;
}
