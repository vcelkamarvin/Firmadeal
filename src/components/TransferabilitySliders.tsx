"use client";

import { useMemo } from "react";

const QUESTIONS = [
  {
    key: "independence",
    label: "Inhaberunabhängigkeit",
    labelEn: "Owner independence",
    low: "Nur mit Gründer funktionsfähig",
    high: "Läuft vollständig selbstständig",
  },
  {
    key: "customers",
    label: "Kundenbindung",
    labelEn: "Customer retention",
    low: "Kunden hängen am Inhaber",
    high: "Kunden sind ans Unternehmen gebunden",
  },
  {
    key: "stability",
    label: "Umsatzstabilität",
    labelEn: "Revenue stability",
    low: "Stark schwankend / saisonal",
    high: "Stabil & wiederkehrend",
  },
  {
    key: "costs",
    label: "Kostenstruktur",
    labelEn: "Cost structure",
    low: "Hohe Fixkosten, wenig Flexibilität",
    high: "Schlank & skalierbar",
  },
  {
    key: "processes",
    label: "Prozesse & Dokumentation",
    labelEn: "Processes & documentation",
    low: "Alles im Kopf des Gründers",
    high: "Vollständig dokumentiert",
  },
];

interface TransferabilityData {
  independence: number;
  customers: number;
  stability: number;
  costs: number;
  processes: number;
}

interface Props {
  values: TransferabilityData;
  onChange: (key: string, value: number) => void;
  lang?: "de" | "en";
}

function getScoreColor(score: number) {
  if (score >= 75) return "#2d5a3d";
  if (score >= 50) return "#d97706";
  return "#dc2626";
}

function getScoreLabel(score: number, lang: "de" | "en") {
  if (lang === "de") {
    if (score >= 75) return "Gut übertragbar";
    if (score >= 50) return "Bedingt übertragbar";
    return "Schwer übertragbar";
  }
  if (score >= 75) return "Easily transferable";
  if (score >= 50) return "Conditionally transferable";
  return "Hard to transfer";
}

export default function TransferabilitySliders({ values, onChange, lang = "de" }: Props) {
  const score = useMemo(() => {
    const sum = Object.values(values).reduce((a, b) => a + b, 0);
    return Math.min(100, Math.round((sum / 50) * 100));
  }, [values]);

  const color = getScoreColor(score);

  return (
    <div className="space-y-6">
      {QUESTIONS.map((q) => {
        const val = values[q.key as keyof TransferabilityData];
        const pct = ((val - 1) / 9) * 100;

        return (
          <div key={q.key}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-sans text-[13px] font-semibold text-[var(--ink)]">
                {lang === "de" ? q.label : q.labelEn}
              </span>
              <span
                className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ background: val >= 7 ? "#2d5a3d" : val >= 4 ? "#d97706" : "#dc2626" }}
              >
                {val}/10
              </span>
            </div>

            <div className="relative py-2">
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={val}
                onChange={(e) => onChange(q.key, parseInt(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${val >= 7 ? "#2d5a3d" : val >= 4 ? "#d97706" : "#dc2626"} ${pct}%, #e5e7eb ${pct}%)`,
                  outline: "none",
                }}
              />
            </div>

            <div className="flex justify-between font-sans text-[10px] text-[var(--muted)]">
              <span>{q.low}</span>
              <span>{q.high}</span>
            </div>
          </div>
        );
      })}

      {/* Score summary */}
      <div className="mt-6 rounded-xl border-2 p-5" style={{ borderColor: color }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--muted)] mb-1">
              {lang === "de" ? "Übertragbarkeits-Score" : "Transferability Score"}
            </div>
            <div className="font-sans text-[22px] font-bold" style={{ color }}>
              {score}/100
            </div>
            <div className="font-sans text-[13px] font-semibold mt-0.5" style={{ color }}>
              {getScoreLabel(score, lang)}
            </div>
          </div>
          {/* Circular SVG */}
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="28" fill="none" stroke="#e5e7eb" strokeWidth="7" />
            <circle
              cx="36"
              cy="36"
              r="28"
              fill="none"
              stroke={color}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 175.9} 175.9`}
              transform="rotate(-90 36 36)"
            />
            <text x="36" y="40" textAnchor="middle" fontSize="14" fontWeight="700" fill={color} fontFamily="sans-serif">
              {score}
            </text>
          </svg>
        </div>

        {/* Strengths / improvements */}
        {score < 100 && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(values).filter(([, v]) => v >= 7).length > 0 && (
              <div className="bg-green-50 rounded-lg px-3 py-2">
                <div className="font-sans text-[10px] font-bold text-[var(--green)] uppercase tracking-wide mb-1">
                  {lang === "de" ? "Stärken" : "Strengths"}
                </div>
                {QUESTIONS.filter((q) => values[q.key as keyof TransferabilityData] >= 7).map((q) => (
                  <div key={q.key} className="font-sans text-[12px] text-[var(--green)]">
                    + {lang === "de" ? q.label : q.labelEn}
                  </div>
                ))}
              </div>
            )}
            {Object.entries(values).filter(([, v]) => v < 5).length > 0 && (
              <div className="bg-amber-50 rounded-lg px-3 py-2">
                <div className="font-sans text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">
                  {lang === "de" ? "Verbesserungspotenzial" : "To improve"}
                </div>
                {QUESTIONS.filter((q) => values[q.key as keyof TransferabilityData] < 5).map((q) => (
                  <div key={q.key} className="font-sans text-[12px] text-amber-700">
                    → {lang === "de" ? q.label : q.labelEn}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
