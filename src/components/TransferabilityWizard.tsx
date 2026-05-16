"use client";

import { useMemo } from "react";

type TransferabilityData = {
  independence: number;
  customers: number;
  stability: number;
  costs: number;
  processes: number;
};

interface Props {
  values: TransferabilityData;
  onChange: (key: keyof TransferabilityData, value: number) => void;
}

const QUESTIONS: {
  key: keyof TransferabilityData;
  question: string;
  options: { value: number; emoji: string; label: string }[];
}[] = [
  {
    key: "independence",
    question: "Was passiert, wenn Sie 4 Wochen weg sind?",
    options: [
      { value: 2,  emoji: "🔴", label: "Alles bricht zusammen" },
      { value: 5,  emoji: "🟡", label: "Es hakt an mehreren Stellen" },
      { value: 8,  emoji: "🟢", label: "Team läuft selbstständig" },
      { value: 10, emoji: "✅", label: "Läuft komplett ohne mich" },
    ],
  },
  {
    key: "customers",
    question: "Was passiert, wenn Ihre 3 größten Kunden kündigen?",
    options: [
      { value: 2,  emoji: "🔴", label: "Existenzbedrohend (>60% Umsatz)" },
      { value: 5,  emoji: "🟡", label: "Schmerzhaft (30–60%)" },
      { value: 8,  emoji: "🟢", label: "Verkraftbar (<30%)" },
      { value: 10, emoji: "✅", label: "Kein Einzel-Kunde >10%" },
    ],
  },
  {
    key: "stability",
    question: "Wie sicher können Sie Ihren Umsatz vorhersagen?",
    options: [
      { value: 2,  emoji: "🔴", label: "Sehr unsicher, schwankt stark" },
      { value: 5,  emoji: "🟡", label: "Einigermaßen planbar" },
      { value: 8,  emoji: "🟢", label: "Gut planbar, Stammkunden" },
      { value: 10, emoji: "✅", label: "Recurring Revenue / Abos" },
    ],
  },
  {
    key: "costs",
    question: "Wenn der Umsatz um 50% einbricht — wie schnell können Sie sparen?",
    options: [
      { value: 2,  emoji: "🔴", label: "Kaum, hohe Fixkosten" },
      { value: 5,  emoji: "🟡", label: "Eingeschränkt möglich" },
      { value: 8,  emoji: "🟢", label: "Gut, viele variable Kosten" },
      { value: 10, emoji: "✅", label: "Fast alle Kosten sind variabel" },
    ],
  },
  {
    key: "processes",
    question: "Was passiert, wenn ein Schlüsselmitarbeiter plötzlich kündigt?",
    options: [
      { value: 2,  emoji: "🔴", label: "Großes Problem, kein Ersatz" },
      { value: 5,  emoji: "🟡", label: "Holprig, aber lösbar" },
      { value: 8,  emoji: "🟢", label: "Dokumentiert, Übergabe möglich" },
      { value: 10, emoji: "✅", label: "Vollständige Handbücher vorhanden" },
    ],
  },
];

export default function TransferabilityWizard({ values, onChange }: Props) {
  const sum = Object.values(values).reduce((a, b) => a + b, 0);
  const score = Math.min(100, Math.round((sum / 50) * 100));

  const scoreColor = score >= 75 ? "#2d5a3d" : score >= 50 ? "#d97706" : "#dc2626";
  const scoreLabel =
    score >= 75 ? "Gut übertragbar" : score >= 50 ? "Teilweise übertragbar" : "Schwer übertragbar";

  const circumference = 2 * Math.PI * 30;
  const dash = (score / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Score display */}
      <div className="flex items-center gap-5 p-4 bg-[var(--surface2)] rounded-xl">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="30" fill="none" stroke="#e5e7eb" strokeWidth="6" />
          <circle
            cx="36"
            cy="36"
            r="30"
            fill="none"
            stroke={scoreColor}
            strokeWidth="6"
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            transform="rotate(-90 36 36)"
            style={{ transition: "stroke-dasharray 0.5s ease" }}
          />
          <text x="36" y="40" textAnchor="middle" fontSize="15" fontWeight="700" fill={scoreColor}>
            {score}
          </text>
        </svg>
        <div>
          <div className="font-sans text-[13px] font-bold text-[var(--ink)]">{scoreLabel}</div>
          <div className="font-sans text-[12px] text-[var(--muted)] mt-0.5">
            Übertragbarkeitsscore (0–100)
          </div>
        </div>
      </div>

      {/* Questions */}
      {QUESTIONS.map((q) => (
        <div key={q.key}>
          <p className="font-sans text-[13px] font-semibold text-[var(--ink)] mb-3">{q.question}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt) => {
              const selected = values[q.key] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange(q.key, opt.value)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all"
                  style={{
                    borderColor: selected ? scoreColor : "var(--border)",
                    background: selected ? `${scoreColor}12` : "white",
                    boxShadow: selected ? `0 0 0 2px ${scoreColor}40` : "none",
                  }}
                >
                  <span className="text-[18px] leading-none flex-shrink-0">{opt.emoji}</span>
                  <span
                    className="font-sans text-[13px] leading-snug"
                    style={{ color: selected ? scoreColor : "var(--ink)", fontWeight: selected ? 600 : 400 }}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
