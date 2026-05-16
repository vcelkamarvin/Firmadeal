"use client";

import { useState, useMemo } from "react";

const QUESTIONS = [
  {
    id: "independence",
    label: "Betriebsunabhängigkeit",
    description: "Wenn Sie morgen für einen Monat ohne Telefon & E-Mail in Urlaub fahren — wie läuft das Unternehmen?",
    low: "Betrieb stoppt sofort",
    high: "Läuft ohne Unterbrechung",
  },
  {
    id: "customers",
    label: "Kundendiversifikation",
    description: "Welchen Einfluss hätte der sofortige Wegfall Ihrer 3 größten Kunden auf das Überleben des Unternehmens?",
    low: "Existenzielle Bedrohung",
    high: "Absolut diversifiziert",
  },
  {
    id: "stability",
    label: "Umsatzstabilität",
    description: "Wie stark schwanken Ihre Umsätze — und wie genau können Sie diese 6 Monate im Voraus prognostizieren?",
    low: "Keine Vorhersehbarkeit",
    high: "Stabil & vertraglich gesichert",
  },
  {
    id: "costs",
    label: "Kostenflexibilität",
    description: "Wenn Ihre Umsätze morgen um 50% fallen: Wie schnell können Sie die Kostenstruktur anpassen?",
    low: "Hohe Fixkosten",
    high: "Vollständig variable Kosten",
  },
  {
    id: "processes",
    label: "Prozessrobustheit",
    description: "Wie einfach ist es, einen Schlüsselmitarbeiter oder Hauptlieferanten zu ersetzen?",
    low: "Komplette Lähmung",
    high: "Dokumentierte Prozesse & sofortige Ersetzbarkeit",
  },
];

function getLabel(score: number): { text: string; color: string; bg: string } {
  if (score >= 76) return { text: "Hochgradig transferierbar", color: "text-[var(--green)]",   bg: "bg-[var(--green)]"   };
  if (score >= 51) return { text: "Gut übertragbar",           color: "text-[var(--accent)]",  bg: "bg-[var(--accent)]"  };
  if (score >= 26) return { text: "Bedingt übertragbar",       color: "text-amber-600",        bg: "bg-amber-400"        };
  return              { text: "Gründerabhängig",               color: "text-[var(--red)]",     bg: "bg-[var(--red)]"     };
}

interface Props {
  /** Called whenever the score changes — useful in wizard */
  onScoreChange?: (score: number, answers: Record<string, number>) => void;
  /** Pre-filled answers (e.g. from wizard state) */
  initialAnswers?: Record<string, number>;
  compact?: boolean;
}

export default function TransferabilityAssessment({ onScoreChange, initialAnswers, compact }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>(
    initialAnswers ?? Object.fromEntries(QUESTIONS.map((q) => [q.id, 5]))
  );

  const score = useMemo(() => {
    const sum = Object.values(answers).reduce((acc, v) => acc + v, 0);
    return Math.min(100, Math.round((sum / 50) * 100));
  }, [answers]);

  const label = getLabel(score);

  const strengths    = QUESTIONS.filter((q) => answers[q.id] >= 7);
  const improvements = QUESTIONS.filter((q) => answers[q.id] <= 4);

  const handleChange = (id: string, value: number) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    const newScore = Math.min(100, Math.round((Object.values(next).reduce((a, v) => a + v, 0) / 50) * 100));
    onScoreChange?.(newScore, next);
  };

  return (
    <div className={compact ? "" : "bg-white border border-[var(--border)] rounded-2xl p-6"}>
      {!compact && (
        <div className="mb-6">
          <p className="font-sans text-[11px] font-semibold text-[var(--muted)] uppercase tracking-widest mb-1">
            Übertragbarkeitsanalyse
          </p>
          <h3 className="font-sans text-[20px] font-bold text-[var(--ink)] leading-tight">
            Wie unabhängig ist Ihr Unternehmen?
          </h3>
          <p className="font-sans text-[13px] text-[var(--muted)] mt-1">
            Bewerten Sie 5 Bereiche auf einer Skala von 1 (gering) bis 10 (sehr hoch).
          </p>
        </div>
      )}

      {/* Live score display */}
      <div className="flex items-center justify-between mb-5 p-4 bg-[var(--surface2)] rounded-xl">
        <div>
          <p className="font-sans text-[10px] text-[var(--muted)] uppercase tracking-widest mb-0.5">
            Transferierbarkeits-Score
          </p>
          <p className={`font-sans text-[22px] font-bold tabular-nums ${label.color}`}>
            {score}<span className="text-[14px] font-normal text-[var(--muted)]">/100</span>
          </p>
          <p className={`font-sans text-[12px] font-semibold ${label.color}`}>{label.text}</p>
        </div>
        {/* Mini radial bar */}
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e8e8e8" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.9" fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${score} ${100 - score}`}
              strokeLinecap="round"
              className={label.color}
            />
          </svg>
          <span className={`absolute inset-0 flex items-center justify-center font-sans text-[11px] font-bold tabular-nums ${label.color}`}>
            {score}
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden mb-6">
        <div
          className={`h-full rounded-full transition-all duration-300 ${label.bg}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Questions */}
      <div className="space-y-5 mb-6">
        {QUESTIONS.map((q) => {
          const val = answers[q.id];
          const valColor = val >= 7 ? "text-[var(--green)]" : val >= 5 ? "text-[var(--ink)]" : "text-amber-600";
          return (
            <div key={q.id}>
              <div className="flex items-start justify-between mb-1 gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[13px] font-semibold text-[var(--ink)]">{q.label}</p>
                  {!compact && (
                    <p className="font-sans text-[11px] text-[var(--muted)] mt-0.5">{q.description}</p>
                  )}
                </div>
                <span className={`font-sans text-[16px] font-bold tabular-nums flex-shrink-0 ${valColor}`}>
                  {val}<span className="text-[11px] font-normal text-[var(--muted)]">/10</span>
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={1}
                value={val}
                onChange={(e) => handleChange(q.id, parseInt(e.target.value))}
                className="w-full h-1.5 rounded-full bg-[var(--border)] appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:rounded-full"
              />
              <div className="flex justify-between mt-0.5">
                <span className="font-sans text-[9px] text-[var(--muted)]">{q.low}</span>
                <span className="font-sans text-[9px] text-[var(--muted)] text-right max-w-[50%]">{q.high}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Strengths & improvements */}
      {(strengths.length > 0 || improvements.length > 0) && (
        <div className="grid grid-cols-2 gap-3">
          {strengths.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className="font-sans text-[10px] font-bold text-[var(--green)] uppercase tracking-wide mb-2">
                Starke Bereiche
              </p>
              <ul className="space-y-1">
                {strengths.map((q) => (
                  <li key={q.id} className="font-sans text-[11px] text-[var(--ink)] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] flex-shrink-0" />
                    {q.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {improvements.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="font-sans text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-2">
                Verbesserungspotenzial
              </p>
              <ul className="space-y-1">
                {improvements.map((q) => (
                  <li key={q.id} className="font-sans text-[11px] text-[var(--ink)] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    {q.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
