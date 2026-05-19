"use client";

import { useState } from "react";
import { Check, ChevronRight, Upload, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { WizardProvider, useWizard } from "@/context/WizardContext";
import { CATEGORIES, DACH_REGIONS, OperationType, BusinessStatus } from "@/lib/types";
import PricingCards from "@/components/PricingCards";
import TransferabilityWizard from "@/components/TransferabilityWizard";
import { createClient } from "@/lib/supabase";

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const { lang } = useLanguage();
  const steps = lang === "de"
    ? ["Ihr Unternehmen", "Inserat & Finanzen", "Zusammenfassung", "Sichtbarkeit"]
    : ["Your Business",   "Listing & Financials", "Review",          "Visibility"];

  return (
    <div className="mb-10">
      {/* Fill bar */}
      <div style={{ height: "4px", background: "#e5e5e5", borderRadius: "2px", marginBottom: "10px" }}>
        <div style={{
          height: "100%",
          width: `${(step / 4) * 100}%`,
          background: "#1a3329",
          borderRadius: "2px",
          transition: "width 0.4s ease",
        }} />
      </div>
      <p className="font-sans text-[13px] text-[var(--muted)] mb-6">
        {lang === "de" ? `Schritt ${step} von 4` : `Step ${step} of 4`}
      </p>
      <div className="flex items-center">
        {steps.map((label, i) => {
          const idx = i + 1;
          const done = step > idx;
          const active = step === idx;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-sans font-semibold transition-all ${
                  done ? "bg-[var(--green)] text-white" : active ? "bg-[var(--accent)] text-white" : "bg-[var(--surface2)] text-[var(--muted)] border border-[var(--border)]"
                }`}>
                  {done ? <Check size={14} /> : idx}
                </div>
                <span className={`font-sans text-[10px] mt-1.5 hidden sm:block text-center ${active ? "text-[var(--accent)]" : "text-[var(--muted)]"}`}>
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all ${step > idx ? "bg-[var(--green)]" : "bg-[var(--border)]"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 1 ────────────────────────────────────────────────────────────────────

const OPERATION_TYPES: Array<{
  value: OperationType;
  de: string; en: string; icon: string; subtitleDe: string; subtitleEn: string;
}> = [
  { value: "vollstaendige_uebertragung", de: "Vollständige Übertragung", en: "Full Transfer",       icon: "🤝", subtitleDe: "Gesamtes Unternehmen inkl. aller Assets",  subtitleEn: "Entire business including all assets"   },
  { value: "unternehmensuebertragung",   de: "Unternehmensübertragung",  en: "Business Transfer",   icon: "🏢", subtitleDe: "Betrieb ohne Immobilien",                  subtitleEn: "Business without real estate"            },
  { value: "gewerbeimmobilie",           de: "Gewerbeimmobilie",         en: "Commercial Property", icon: "🏗️", subtitleDe: "Verkauf der Gewerbeimmobilie",             subtitleEn: "Sale of commercial property"             },
  { value: "anteilsuebertragung",        de: "Anteilsübertragung",       en: "Share Transfer",      icon: "📊", subtitleDe: "Verkauf von Unternehmensanteilen",          subtitleEn: "Sale of company shares"                  },
  { value: "unternehmensverpachtung",    de: "Unternehmensverpachtung",  en: "Business Lease",      icon: "🔑", subtitleDe: "Verpachtung des gesamten Betriebs",         subtitleEn: "Leasing of the entire business"          },
  { value: "immobilienvermietung",       de: "Immobilienvermietung",     en: "Property Rental",     icon: "🏠", subtitleDe: "Vermietung von Gewerbeflächen",             subtitleEn: "Rental of commercial space"              },
];

function Step1() {
  const { data, updateData, setStep } = useWizard();
  const { lang } = useLanguage();
  const canProceed = data.type_of_operation && data.category && data.city;

  return (
    <div>
      <h2 className="font-sans text-[26px] font-bold text-[var(--ink)] tracking-tight mb-2">
        {lang === "de" ? "Ihr Unternehmen" : "Your Business"}
      </h2>
      <p className="font-sans text-[14px] text-[var(--muted)] mb-8">
        {lang === "de" ? "Erzählen Sie uns von Ihrem Unternehmen" : "Tell us about your business"}
      </p>

      <div className="mb-8">
        <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-3">
          {lang === "de" ? "Art der Transaktion *" : "Transaction type *"}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {OPERATION_TYPES.map((op) => (
            <button
              key={op.value}
              onClick={() => updateData({ type_of_operation: op.value })}
              className={`text-left p-4 rounded-xl border-2 transition-all ${
                data.type_of_operation === op.value
                  ? "border-[var(--accent)] bg-[var(--accent-light)]"
                  : "border-[var(--border)] bg-white hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"
              }`}
            >
              <div className="text-2xl mb-2">{op.icon}</div>
              <div className="font-sans text-sm font-semibold text-[var(--ink)]">{lang === "de" ? op.de : op.en}</div>
              <div className="font-sans text-[12px] text-[var(--muted)] mt-1">{lang === "de" ? op.subtitleDe : op.subtitleEn}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Branche *" : "Industry *"}
          </label>
          <select
            value={data.category}
            onChange={(e) => updateData({ category: e.target.value })}
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans bg-white outline-none focus:border-[var(--accent)]"
          >
            <option value="">{lang === "de" ? "Branche wählen..." : "Choose industry..."}</option>
            {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Stadt *" : "City *"}
          </label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => updateData({ city: e.target.value })}
            placeholder={lang === "de" ? "z.B. München" : "e.g. Munich"}
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">Region</label>
          <select
            value={data.region}
            onChange={(e) => updateData({ region: e.target.value })}
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans bg-white outline-none focus:border-[var(--accent)]"
          >
            <option value="">{lang === "de" ? "Region wählen..." : "Choose region..."}</option>
            {DACH_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Land" : "Country"}
          </label>
          <select
            value={data.country}
            onChange={(e) => updateData({ country: e.target.value })}
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans bg-white outline-none focus:border-[var(--accent)]"
          >
            <option value="DE">Deutschland</option>
            <option value="AT">Österreich</option>
            <option value="CH">Schweiz</option>
          </select>
        </div>

        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Firmenname (optional)" : "Company name (optional)"}
          </label>
          <input
            type="text"
            value={data.company_name}
            onChange={(e) => updateData({ company_name: e.target.value })}
            placeholder="Muster GmbH"
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Gründungsjahr (optional)" : "Founded year (optional)"}
          </label>
          <input
            type="number"
            value={data.founded_year}
            onChange={(e) => updateData({ founded_year: e.target.value })}
            placeholder="2005"
            min="1900"
            max={new Date().getFullYear()}
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={() => setStep(2)}
          disabled={!canProceed}
          className="flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-semibold px-6 py-3 rounded-full hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {lang === "de" ? "Weiter" : "Continue"}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Step 2 ────────────────────────────────────────────────────────────────────

const BIZ_MODEL_CHIPS = ["B2B", "B2C", "SaaS", "E-Commerce", "Abo-Modell", "Franchise", "Dienstleistung", "Produktion", "Beratung", "Handel"];
const COMPETITION_CHIPS = ["Kein direkter Wettbewerb", "Lokaler Wettbewerb", "Nationaler Wettbewerb", "Internationaler Wettbewerb", "Nische / Marktführer", "Starker Preiskampf"];
const ASSETS_LIST = [
  "Kundenstamm / CRM", "Marke & Domain", "Maschinen & Equipment",
  "Lagerbestand", "Immobilie (Eigentum)", "Mietvertrag (übertragbar)",
  "Softwarelizenzen", "Patente & IP", "Mitarbeiter (übernommen)",
  "Lieferantenverträge", "Rezepte & Know-how", "Fahrzeugflotte",
];
const REASON_OPTIONS = [
  "Ich gehe in Rente",
  "Ich möchte etwas Neues starten",
  "Gesundheitliche Gründe",
  "Kein geeigneter Nachfolger",
  "Strategischer Verkauf",
  "Finanzielle Gründe",
  "Partnerschaftliche Veränderungen",
  "Sonstiges",
];
const STATUS_PILLS: Array<{ value: BusinessStatus; label: string; color: string }> = [
  { value: "active_profitable", label: "Aktiv & Profitabel", color: "var(--green)" },
  { value: "in_development",    label: "In Entwicklung",    color: "#f59e0b"       },
  { value: "restructuring",     label: "Sanierungsbedarf",  color: "var(--red)"   },
];

function Step2() {
  const { data, updateData, setStep } = useWizard();
  const [dragOver, setDragOver] = useState(false);

  const canProceed = data.title.length >= 10 && data.description.length >= 100 && data.status_business !== "";

  const toggleChip = (field: "business_model_chips" | "competition_chips", val: string) => {
    const arr = data[field] as string[];
    updateData({ [field]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] } as never);
  };

  const toggleAsset = (asset: string) => {
    const arr = data.assets_checklist;
    updateData({ assets_checklist: arr.includes(asset) ? arr.filter((a) => a !== asset) : [...arr, asset] });
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    updateData({ images: [...data.images, ...files].slice(0, 8) });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      updateData({ images: [...data.images, ...Array.from(e.target.files)].slice(0, 8) });
    }
  };

  const wordCount = data.description.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div>
      <h2 className="font-sans text-[26px] font-bold text-[var(--ink)] tracking-tight mb-2">
        Inserat & Finanzdaten
      </h2>
      <p className="font-sans text-[14px] text-[var(--muted)] mb-8">
        Vollständige Angaben erhöhen Anfragen um bis zu 4×.
      </p>

      <div className="space-y-8">

        {/* 1. Title */}
        {(() => {
          const len = data.title.length;
          const quality = len === 0 ? null : len < 20 ? { label: "Zu kurz", color: "#dc2626" } : len < 40 ? { label: "Detail ergänzen", color: "#d97706" } : len <= 70 ? { label: "✓ Guter Titel", color: "#2d5a3d" } : { label: "Etwas zu lang", color: "#d97706" };
          const EXAMPLE_CHIPS = [
            "Etabliertes Restaurant mit Biergarten — 15 Jahre",
            "E-Commerce-Shop mit 50k Besuchern/Monat",
            "Physiotherapiepraxis mit Kassenzulassung",
            "SaaS für KMU — 200 Kunden — Berlin",
            "Familiengeführte Bäckerei — 3 Filialen",
          ];
          return (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">
                  Inseratstitel *
                </label>
                <div className="flex items-center gap-2">
                  {quality && (
                    <span className="font-sans text-[11px] font-semibold" style={{ color: quality.color }}>
                      {quality.label}
                    </span>
                  )}
                  <span className="font-mono text-[11px] text-[var(--muted)]">{len}/80</span>
                </div>
              </div>
              <p className="font-sans text-[11px] text-[var(--muted)] mb-2">
                Struktur: <strong>Was</strong> — <strong>USP</strong> — <strong>Standort</strong>
              </p>
              <input
                type="text"
                value={data.title}
                onChange={(e) => updateData({ title: e.target.value.slice(0, 80) })}
                placeholder="z.B. Etabliertes Restaurant mit Biergarten — 15 Jahre — München"
                className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)]"
              />
              {/* Quality bar */}
              {len > 0 && (
                <div className="h-1 rounded-full mt-1.5 transition-all" style={{
                  background: `linear-gradient(to right, ${quality?.color ?? "#e5e5e5"} ${Math.min(100, (len / 70) * 100)}%, #e5e5e5 ${Math.min(100, (len / 70) * 100)}%)`,
                }} />
              )}
              {/* Example chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="font-sans text-[11px] text-[var(--muted)]">Beispiel:</span>
                {EXAMPLE_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => updateData({ title: chip.slice(0, 80) })}
                    className="font-sans text-[11px] text-[var(--accent)] bg-[var(--accent-light)] hover:bg-[var(--accent)] hover:text-white px-2 py-0.5 rounded transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 2. Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">
              Unternehmensbeschreibung *
            </label>
            <span className={`font-sans text-[11px] ${data.description.length < 100 ? "text-amber-600" : "text-[var(--green)]"}`}>
              {wordCount} Wörter · {data.description.length} Zeichen
            </span>
          </div>
          <textarea
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            rows={5}
            placeholder={"Beispiel: Gut etabliertes Familienrestaurant mit 15 Jahren Geschichte im Herzen von München. Stammkundschaft von 300+ Haushalten, voll eingespieltes 8-köpfiges Team. Verkauf aus Altersgründen — Übergabe ist fließend möglich.\n\nMindestens 100 Zeichen für aussagekräftige Inserate."}
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)] resize-none"
          />
        </div>

        {/* 3. Business model chips */}
        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-3">
            Geschäftsmodell (mehrere möglich)
          </label>
          <div className="flex flex-wrap gap-2">
            {BIZ_MODEL_CHIPS.map((chip) => {
              const active = data.business_model_chips.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleChip("business_model_chips", chip)}
                  className={`px-3 py-1.5 rounded-full font-sans text-[13px] border transition-all ${
                    active
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-white text-[var(--ink)] border-[var(--border)] hover:border-[var(--accent)]"
                  }`}
                >
                  {active && <span className="mr-1">✓</span>}{chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Competition chips */}
        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-3">
            Wettbewerbssituation
          </label>
          <div className="flex flex-wrap gap-2">
            {COMPETITION_CHIPS.map((chip) => {
              const active = data.competition_chips.includes(chip);
              return (
                <button
                  key={chip}
                  type="button"
                  onClick={() => toggleChip("competition_chips", chip)}
                  className={`px-3 py-1.5 rounded-full font-sans text-[13px] border transition-all ${
                    active
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "bg-white text-[var(--ink)] border-[var(--border)] hover:border-[var(--accent)]"
                  }`}
                >
                  {active && <span className="mr-1">✓</span>}{chip}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Assets checklist */}
        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-3">
            Im Kaufpreis enthaltene Assets
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {ASSETS_LIST.map((asset) => {
              const checked = data.assets_checklist.includes(asset);
              return (
                <label key={asset} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    checked ? "bg-[var(--green)] border-[var(--green)]" : "border-[var(--border)] group-hover:border-[var(--green)]"
                  }`} onClick={() => toggleAsset(asset)}>
                    {checked && <Check size={11} className="text-white" />}
                  </div>
                  <span className="font-sans text-[13px] text-[var(--ink)]" onClick={() => toggleAsset(asset)}>
                    {asset}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 6. Status radio pills */}
        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-3">
            Unternehmensstatus *
          </label>
          <div className="flex flex-wrap gap-3">
            {STATUS_PILLS.map((s) => {
              const active = data.status_business === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => updateData({ status_business: s.value })}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-sans text-[13px] font-semibold transition-all ${
                    active
                      ? "text-white border-transparent"
                      : "bg-white text-[var(--ink)] border-[var(--border)] hover:border-[var(--muted)]"
                  }`}
                  style={active ? { background: s.color, borderColor: s.color } : {}}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: active ? "rgba(255,255,255,0.7)" : s.color }} />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 7. Reason for sale + notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">
              Verkaufsgrund (optional)
            </label>
            <select
              value={data.reason_for_sale}
              onChange={(e) => updateData({ reason_for_sale: e.target.value })}
              className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans bg-white outline-none focus:border-[var(--accent)]"
            >
              <option value="">Bitte wählen…</option>
              {REASON_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">
              Zusätzliche Notizen (optional)
            </label>
            <textarea
              value={data.reason_for_sale_notes}
              onChange={(e) => updateData({ reason_for_sale_notes: e.target.value })}
              rows={3}
              placeholder="z.B. Übergabe innerhalb von 3 Monaten möglich…"
              className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>
        </div>

        {/* 8. Financials */}
        <div className="bg-[var(--surface2)] rounded-xl p-5 border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]">
              Finanzkennzahlen
            </span>
            <span className="font-sans text-[10px] font-bold text-white bg-[var(--green)] px-2 py-0.5 rounded">
              +4× Anfragen
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-sans text-[11px] font-bold text-[var(--ink)] block mb-1">Jahresumsatz</label>
              <p className="font-sans text-[11px] text-[var(--muted)] mb-2">Gesamtumsatz vor Abzug aller Kosten</p>
              <input type="number" value={data.annual_revenue} onChange={(e) => updateData({ annual_revenue: e.target.value })}
                placeholder="1200000" className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans bg-white outline-none focus:border-[var(--accent)]" />
            </div>
            <div>
              <label className="font-sans text-[11px] font-bold text-[var(--ink)] block mb-1">
                EBITDA <span className="font-normal text-[var(--muted)]">(optional)</span>
              </label>
              <p className="font-sans text-[11px] text-[var(--muted)] mb-2">Vor Steuern & Bankzinsen</p>
              <input type="number" value={data.ebitda} onChange={(e) => updateData({ ebitda: e.target.value })}
                placeholder="240000" className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans bg-white outline-none focus:border-[var(--accent)]" />
            </div>
            <div>
              <label className="font-sans text-[11px] font-bold text-[var(--ink)] block mb-1">Mitarbeiter</label>
              <p className="font-sans text-[11px] text-[var(--muted)] mb-2">Aktuell (inkl. Teilzeit)</p>
              <input type="number" value={data.employees} onChange={(e) => updateData({ employees: e.target.value })}
                placeholder="8" min="0" className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans bg-white outline-none focus:border-[var(--accent)]" />
            </div>
          </div>
          {data.annual_revenue && data.ebitda && Number(data.annual_revenue) > 0 && (
            <div className="mt-3 flex items-center gap-3">
              <span className="font-sans text-[11px] text-[var(--muted)]">EBITDA-Marge:</span>
              <span className="font-sans text-[12px] font-bold text-[var(--green)]">
                {((Number(data.ebitda) / Number(data.annual_revenue)) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* 9. Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">
              Kaufpreis (€)
            </label>
            <input
              type="number" value={data.asking_price}
              onChange={(e) => updateData({ asking_price: e.target.value })}
              disabled={data.price_confidential} placeholder="350000"
              className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)] disabled:opacity-50 disabled:bg-[var(--surface2)]"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={data.price_confidential}
                onChange={(e) => updateData({ price_confidential: e.target.checked })} className="rounded" />
              <span className="font-sans text-sm text-[var(--ink)]">Vertrauliche Verhandlung</span>
            </label>
          </div>
        </div>

        {/* 10. Photos (max 8) */}
        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">
            Fotos (max. 8) — {data.images.length}/8
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleImageDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver ? "border-[var(--accent)] bg-[var(--accent-light)]" : "border-[var(--border)] bg-[var(--surface2)]"
            } ${data.images.length >= 8 ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Upload size={24} className="mx-auto mb-3 text-[var(--muted)]" />
            <p className="font-sans text-sm text-[var(--muted)] mb-2">Fotos hierher ziehen oder</p>
            <label className="inline-block cursor-pointer">
              <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
              <span className="font-sans text-sm text-[var(--accent)] hover:underline">Dateien auswählen</span>
            </label>
          </div>
          {data.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {data.images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[var(--surface2)]">
                  <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => updateData({ images: data.images.filter((_, idx) => idx !== i) })}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <X size={12} className="text-[var(--red)]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 11. Phone */}
        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">
            Telefon (optional)
          </label>
          <input type="tel" value={data.phone} onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="+49 89 12345678"
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)]" />
        </div>

        {/* 12. Transferability sliders */}
        <div className="bg-white border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[var(--accent)]">
              Übertragbarkeits-Analyse
            </span>
            <span className="font-sans text-[10px] font-bold text-white bg-[var(--accent)] px-2 py-0.5 rounded">
              Vertrauensboost
            </span>
          </div>
          <p className="font-sans text-[12px] text-[var(--muted)] mb-5">
            Wie gut läuft das Unternehmen ohne Sie? Ehrliche Angaben steigern das Käufervertrauen erheblich.
          </p>
          <TransferabilityWizard
            values={data.transferability_data}
            onChange={(key, value) =>
              updateData({ transferability_data: { ...data.transferability_data, [key]: value } })
            }
          />
        </div>

      </div>

      <div className="flex items-center justify-between mt-8">
        <button onClick={() => setStep(1)} className="font-sans text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
          ← Zurück
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!canProceed}
          className="flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-semibold px-6 py-3 rounded-full hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Weiter <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Step 3 ────────────────────────────────────────────────────────────────────

function Step3() {
  const { data, setStep } = useWizard();

  const fmt = (s: string) => {
    const n = parseInt(s);
    if (!n) return "—";
    return `€${n.toLocaleString("de-DE")}`;
  };

  const margin = data.annual_revenue && data.ebitda && Number(data.annual_revenue) > 0
    ? ((Number(data.ebitda) / Number(data.annual_revenue)) * 100).toFixed(1) + "%"
    : "—";

  const rows = [
    { key: "Transaktionsart", value: data.type_of_operation || "—", step: 1 },
    { key: "Branche",         value: data.category || "—",          step: 1 },
    { key: "Standort",        value: [data.city, data.country].filter(Boolean).join(", ") || "—", step: 1 },
    { key: "Titel",           value: data.title || "—",             step: 2 },
    { key: "Kaufpreis",       value: data.price_confidential ? "Vertraulich" : fmt(data.asking_price), step: 2 },
    { key: "Jahresumsatz",    value: fmt(data.annual_revenue),      step: 2 },
    { key: "EBITDA",          value: fmt(data.ebitda),              step: 2 },
    { key: "Gewinnmarge",     value: margin,                        step: 2 },
    { key: "Mitarbeiter",     value: data.employees || "—",         step: 2 },
    { key: "Fotos",           value: `${data.images.length}`,       step: 2 },
  ];

  return (
    <div>
      <h2 className="font-sans text-[26px] font-bold text-[var(--ink)] tracking-tight mb-2">
        Zusammenfassung
      </h2>
      <p className="font-sans text-[14px] text-[var(--muted)] mb-8">
        Überprüfen Sie Ihre Angaben vor der Veröffentlichung
      </p>

      <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden mb-6">
        {rows.map((row, i) => (
          <div key={row.key} className={`flex items-center justify-between px-5 py-3.5 ${i < rows.length - 1 ? "border-b border-[var(--border)]" : ""}`}>
            <span className="font-sans text-[12px] text-[var(--muted)]">{row.key}</span>
            <div className="flex items-center gap-3">
              <span className="font-sans text-[13px] font-semibold text-[var(--ink)] tabular-nums max-w-[280px] truncate">{row.value}</span>
              <button
                onClick={() => setStep(row.step)}
                className="font-sans text-[11px] font-semibold text-[var(--accent)] hover:underline flex-shrink-0"
              >
                Bearbeiten
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--accent-light)] border border-[var(--accent)]/20 rounded-xl p-5 mb-8">
        <p className="font-sans text-sm text-[var(--accent)]">
          Ihr Inserat wird nach Auswahl eines Plans sofort veröffentlicht.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setStep(2)} className="font-sans text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
          ← Zurück
        </button>
        <button
          onClick={() => setStep(4)}
          className="flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-semibold px-6 py-3 rounded-full hover:bg-[var(--accent-hover)] transition-colors"
        >
          Bestätigen & Plan wählen →
        </button>
      </div>
    </div>
  );
}

// ── Step 4 ────────────────────────────────────────────────────────────────────

const INVESTORS_BY_CATEGORY: Record<string, number> = {
  "Gastronomie & Lebensmittel": 847,
  "IT & Software":              1203,
  "Handwerk & Bau":             634,
  "Gesundheit & Pflege":        921,
  "E-Commerce & Retail":        1089,
  "Produktion & Industrie":     412,
  "Immobilien":                 756,
  "Dienstleistungen":           538,
};

function Step4() {
  const { data, updateData, setStep, listingId, setListingId } = useWizard();
  const { lang } = useLanguage();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const investorCount = INVESTORS_BY_CATEGORY[data.category] ?? 1200;
  const categoryLabel = data.category || "DACH";

  const handleSelectPlan = async (planId: "base" | "plus" | "premium") => {
    updateData({ plan: planId });
    setLoadingPlan(planId);
    setCheckoutError(null);

    try {
      // Require authentication before creating a listing
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login?redirect=/sell";
        return;
      }

      // Save listing as draft if not already saved
      let id = listingId;
      if (!id) {
        const listingRes = await fetch("/api/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: data.title,
            category: data.category,
            city: data.city,
            region: data.region,
            country: data.country,
            asking_price: data.asking_price ? Number(data.asking_price) : null,
            price_confidential: data.price_confidential,
            annual_revenue: data.annual_revenue ? Number(data.annual_revenue) : null,
            ebitda: data.ebitda ? Number(data.ebitda) : null,
            employees: data.employees ? Number(data.employees) : null,
            description: data.description,
            status_business: data.status_business || "active_profitable",
            reason_for_sale: data.reason_for_sale,
            business_model_chips: data.business_model_chips,
            competition_chips: data.competition_chips,
            assets_checklist: data.assets_checklist,
            transferability_data: data.transferability_data,
            plan: planId,
          }),
        });
        const listingJson = await listingRes.json();
        if (!listingRes.ok || listingJson.error) throw new Error(listingJson.error ?? "Listing konnte nicht gespeichert werden");
        id = listingJson.id;
        setListingId(listingJson.id);
      }

      // Create Stripe checkout session
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, listingId: id }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      // Redirect to Stripe hosted checkout
      window.location.href = json.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Unbekannter Fehler");
      setLoadingPlan(null);
    }
  };

  return (
    <div>
      <h2 className="font-sans text-[26px] font-bold text-[var(--ink)] tracking-tight mb-2">
        {lang === "de" ? "Sichtbarkeit wählen" : "Choose visibility"}
      </h2>

      {/* Investor count banner */}
      <div className="text-center mb-8 mt-4">
        <p className="font-sans text-[22px] font-bold text-[var(--ink)] mb-2">
          {lang === "de" ? "Ihr Inserat wird " : "Your listing will reach "}
          <span className="text-[var(--green)]">
            {investorCount.toLocaleString("de-DE")} aktiven {categoryLabel}-Investor{investorCount === 1 ? "" : "en"}
          </span>
          {lang === "de" ? " präsentiert." : "."}
        </p>
        <p className="font-sans text-[15px] text-[var(--muted)]">
          {lang === "de"
            ? "Wählen Sie Ihre Reichweite für den 7-tägigen Markttest:"
            : "Choose your reach for the 7-day market test:"}
        </p>
      </div>

      {checkoutError && (
        <div className="bg-red-50 border border-red-200 text-red-700 font-sans text-[13px] px-4 py-3 rounded-lg mb-6">
          {checkoutError}
        </div>
      )}

      <PricingCards
        onSelectPlan={handleSelectPlan}
        loadingPlan={loadingPlan}
        investorCount={investorCount}
        categoryLabel={categoryLabel}
      />

      <button onClick={() => setStep(3)} className="font-sans text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors mt-6">
        ← {lang === "de" ? "Zurück" : "Back"}
      </button>
    </div>
  );
}

// ── Wizard shell ──────────────────────────────────────────────────────────────

function WizardShell() {
  const { step } = useWizard();
  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ProgressBar step={step} />
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}
      </div>
    </div>
  );
}

export default function SellPage() {
  return (
    <WizardProvider>
      <WizardShell />
    </WizardProvider>
  );
}
