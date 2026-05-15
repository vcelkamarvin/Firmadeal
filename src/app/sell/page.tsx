"use client";

import { useState } from "react";
import { Check, ChevronRight, Upload, X, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { WizardProvider, useWizard } from "@/context/WizardContext";
import { CATEGORIES, DACH_REGIONS, OperationType, BusinessStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const { lang } = useLanguage();
  const steps =
    lang === "de"
      ? ["Ihr Unternehmen", "Ihr Inserat", "Zusammenfassung", "Sichtbarkeit"]
      : ["Your Business", "Your Listing", "Review", "Visibility"];

  return (
    <div className="mb-10">
      <div className="flex items-center">
        {steps.map((label, i) => {
          const idx = i + 1;
          const done = step > idx;
          const active = step === idx;
          return (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-sans font-semibold transition-all ${
                    done
                      ? "bg-[var(--green)] text-white"
                      : active
                      ? "bg-[var(--accent)] text-white"
                      : "bg-[var(--surface2)] text-[var(--muted)] border border-[var(--border)]"
                  }`}
                >
                  {done ? <Check size={14} /> : idx}
                </div>
                <span
                  className={`font-mono text-[10px] mt-1.5 hidden sm:block text-center ${
                    active ? "text-[var(--accent)]" : "text-[var(--muted)]"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-all ${
                    step > idx ? "bg-[var(--green)]" : "bg-[var(--border)]"
                  }`}
                />
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
  de: string;
  en: string;
  icon: string;
  subtitleDe: string;
  subtitleEn: string;
}> = [
  {
    value: "vollstaendige_uebertragung",
    de: "Vollständige Übertragung",
    en: "Full Transfer",
    icon: "🤝",
    subtitleDe: "Gesamtes Unternehmen inkl. aller Assets",
    subtitleEn: "Entire business including all assets",
  },
  {
    value: "unternehmensuebertragung",
    de: "Unternehmensübertragung",
    en: "Business Transfer",
    icon: "🏢",
    subtitleDe: "Betrieb ohne Immobilien",
    subtitleEn: "Business without real estate",
  },
  {
    value: "gewerbeimmobilie",
    de: "Gewerbeimmobilie",
    en: "Commercial Property",
    icon: "🏗️",
    subtitleDe: "Verkauf der Gewerbeimmobilie",
    subtitleEn: "Sale of commercial property",
  },
  {
    value: "anteilsuebertragung",
    de: "Anteilsübertragung",
    en: "Share Transfer",
    icon: "📊",
    subtitleDe: "Verkauf von Unternehmensanteilen",
    subtitleEn: "Sale of company shares",
  },
  {
    value: "unternehmensverpachtung",
    de: "Unternehmensverpachtung",
    en: "Business Lease",
    icon: "🔑",
    subtitleDe: "Verpachtung des gesamten Betriebs",
    subtitleEn: "Leasing of the entire business",
  },
  {
    value: "immobilienvermietung",
    de: "Immobilienvermietung",
    en: "Property Rental",
    icon: "🏠",
    subtitleDe: "Vermietung von Gewerbeflächen",
    subtitleEn: "Rental of commercial space",
  },
];

function Step1() {
  const { data, updateData, setStep } = useWizard();
  const { lang } = useLanguage();

  const canProceed = data.type_of_operation && data.category && data.city;

  return (
    <div>
      <h2 className="font-fraunces text-[28px] text-[var(--ink)] mb-2">
        {lang === "de" ? "Ihr Unternehmen" : "Your Business"}
      </h2>
      <p className="font-sans text-[15px] text-[var(--muted)] mb-8">
        {lang === "de"
          ? "Erzählen Sie uns von Ihrem Unternehmen"
          : "Tell us about your business"}
      </p>

      {/* Operation type */}
      <div className="mb-8">
        <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-3">
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
              <div className="font-sans text-sm font-semibold text-[var(--ink)]">
                {lang === "de" ? op.de : op.en}
              </div>
              <div className="font-sans text-[12px] text-[var(--muted)] mt-1">
                {lang === "de" ? op.subtitleDe : op.subtitleEn}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Branche *" : "Industry *"}
          </label>
          <select
            value={data.category}
            onChange={(e) => updateData({ category: e.target.value })}
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans bg-white outline-none focus:border-[var(--accent)]"
          >
            <option value="">{lang === "de" ? "Branche wählen..." : "Choose industry..."}</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
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
          <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Region" : "Region"}
          </label>
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
          <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Land" : "Country"}
          </label>
          <select
            value={data.country}
            onChange={(e) => updateData({ country: e.target.value })}
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans bg-white outline-none focus:border-[var(--accent)]"
          >
            <option value="DE">🇩🇪 Deutschland</option>
            <option value="AT">🇦🇹 Österreich</option>
            <option value="CH">🇨🇭 Schweiz</option>
          </select>
        </div>

        <div>
          <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Steuernummer (optional)" : "VAT number (optional)"}
          </label>
          <input
            type="text"
            value={data.vat_number}
            onChange={(e) => updateData({ vat_number: e.target.value })}
            placeholder="DE123456789"
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)]"
          />
          <p className="font-mono text-[10px] text-[var(--muted)] mt-1.5">
            {lang === "de"
              ? "Mit Steuernummer erhalten Sie 3x mehr Anfragen."
              : "Listings with VAT numbers get 3x more inquiries."}
          </p>
        </div>

        <div>
          <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Firmenname (optional)" : "Company name (optional)"}
          </label>
          <input
            type="text"
            value={data.company_name}
            onChange={(e) => updateData({ company_name: e.target.value })}
            placeholder={lang === "de" ? "Muster GmbH" : "Sample Ltd."}
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
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
          className="flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {lang === "de" ? "Weiter" : "Continue"}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Step 2 ────────────────────────────────────────────────────────────────────

function Step2() {
  const { data, updateData, setStep } = useWizard();
  const { lang } = useLanguage();
  const [dragOver, setDragOver] = useState(false);

  const canProceed =
    data.title.length >= 10 &&
    data.description.length >= 100 &&
    data.status_business !== "";

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    updateData({ images: [...data.images, ...files].slice(0, 4) });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      updateData({ images: [...data.images, ...files].slice(0, 4) });
    }
  };

  const removeImage = (i: number) => {
    updateData({ images: data.images.filter((_, idx) => idx !== i) });
  };

  return (
    <div>
      <h2 className="font-fraunces text-[28px] text-[var(--ink)] mb-2">
        {lang === "de" ? "Ihr Inserat" : "Your Listing"}
      </h2>
      <p className="font-sans text-[15px] text-[var(--muted)] mb-8">
        {lang === "de"
          ? "Beschreiben Sie Ihr Unternehmen für potenzielle Käufer"
          : "Describe your business for potential buyers"}
      </p>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide">
              {lang === "de" ? "Inseratstitel *" : "Listing title *"}
            </label>
            <span className="font-mono text-[11px] text-[var(--muted)]">
              {data.title.length}/65
            </span>
          </div>
          <input
            type="text"
            value={data.title}
            onChange={(e) =>
              updateData({ title: e.target.value.slice(0, 65) })
            }
            placeholder={
              lang === "de"
                ? "z.B. Etabliertes Restaurant mit Biergarten in München"
                : "e.g. Established restaurant with beer garden in Munich"
            }
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
              {lang === "de" ? "Kaufpreis (€)" : "Asking price (€)"}
            </label>
            <input
              type="number"
              value={data.asking_price}
              onChange={(e) => updateData({ asking_price: e.target.value })}
              disabled={data.price_confidential}
              placeholder="350000"
              className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)] disabled:opacity-50 disabled:bg-[var(--surface2)]"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.price_confidential}
                onChange={(e) =>
                  updateData({ price_confidential: e.target.checked })
                }
                className="rounded"
              />
              <span className="font-sans text-sm text-[var(--ink)]">
                {lang === "de"
                  ? "Vertrauliche Verhandlung"
                  : "Confidential negotiation"}
              </span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide">
              {lang === "de" ? "Unternehmensbeschreibung *" : "Business description *"}
            </label>
            <span
              className={`font-mono text-[11px] ${
                data.description.length < 100
                  ? "text-[var(--red)]"
                  : "text-[var(--green)]"
              }`}
            >
              {data.description.length}/min. 100
            </span>
          </div>
          <textarea
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
            rows={6}
            placeholder={
              lang === "de"
                ? "Beschreiben Sie Ihr Unternehmen: Geschichte, Stärken, Kundenstamm, Grund für den Verkauf..."
                : "Describe your business: history, strengths, customer base, reason for sale..."
            }
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)] resize-none"
          />
        </div>

        {/* Business status */}
        <div>
          <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Unternehmensstatus *" : "Business status *"}
          </label>
          <select
            value={data.status_business}
            onChange={(e) =>
              updateData({ status_business: e.target.value as BusinessStatus })
            }
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans bg-white outline-none focus:border-[var(--accent)]"
          >
            <option value="">
              {lang === "de" ? "Status wählen..." : "Choose status..."}
            </option>
            <option value="active_profitable">
              {lang === "de" ? "Aktiv – Profitabel" : "Active – Profitable"}
            </option>
            <option value="in_development">
              {lang === "de" ? "In Entwicklung" : "In development"}
            </option>
            <option value="restructuring">
              {lang === "de" ? "Sanierungsbedarf" : "Needs restructuring"}
            </option>
          </select>
        </div>

        {/* Image upload */}
        <div>
          <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
            {lang === "de" ? "Fotos (max. 4)" : "Photos (max. 4)"}
          </label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleImageDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragOver
                ? "border-[var(--accent)] bg-[var(--accent-light)]"
                : "border-[var(--border)] bg-[var(--surface2)]"
            }`}
          >
            <Upload size={24} className="mx-auto mb-3 text-[var(--muted)]" />
            <p className="font-sans text-sm text-[var(--muted)] mb-2">
              {lang === "de"
                ? "Fotos hierher ziehen oder"
                : "Drag photos here or"}
            </p>
            <label className="inline-block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <span className="font-sans text-sm text-[var(--accent)] hover:underline">
                {lang === "de" ? "Dateien auswählen" : "Browse files"}
              </span>
            </label>
          </div>
          {data.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {data.images.map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-lg overflow-hidden bg-[var(--surface2)]"
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm hover:bg-red-50"
                  >
                    <X size={12} className="text-[var(--red)]" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
              {lang === "de" ? "Telefonnummer (optional)" : "Phone number (optional)"}
            </label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => updateData({ phone: e.target.value })}
              placeholder="+49 89 12345678"
              className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={data.show_phone}
                onChange={(e) => updateData({ show_phone: e.target.checked })}
                className="rounded"
              />
              <span className="font-sans text-sm text-[var(--ink)]">
                {lang === "de"
                  ? "Nummer im Inserat anzeigen"
                  : "Show number in listing"}
              </span>
            </label>
          </div>
        </div>

        {/* Optional fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
              {lang === "de" ? "Geschäftsmodell (optional)" : "Business model (optional)"}
            </label>
            <textarea
              value={data.business_model}
              onChange={(e) => updateData({ business_model: e.target.value })}
              rows={3}
              placeholder={lang === "de" ? "Wie funktioniert das Geschäftsmodell?" : "How does the business model work?"}
              className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>
          <div>
            <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
              {lang === "de" ? "Enthaltene Güter (optional)" : "Assets included (optional)"}
            </label>
            <textarea
              value={data.assets_included}
              onChange={(e) => updateData({ assets_included: e.target.value })}
              rows={3}
              placeholder={lang === "de" ? "Was ist im Kaufpreis enthalten?" : "What is included in the price?"}
              className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>
          <div>
            <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
              {lang === "de" ? "Verkaufsgrund (optional)" : "Reason for sale (optional)"}
            </label>
            <textarea
              value={data.reason_for_sale}
              onChange={(e) => updateData({ reason_for_sale: e.target.value })}
              rows={3}
              placeholder={lang === "de" ? "Warum verkaufen Sie?" : "Why are you selling?"}
              className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>
          <div>
            <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-2">
              {lang === "de" ? "Wettbewerb (optional)" : "Competition (optional)"}
            </label>
            <textarea
              value={data.competition}
              onChange={(e) => updateData({ competition: e.target.value })}
              rows={3}
              placeholder={lang === "de" ? "Beschreiben Sie die Wettbewerbssituation" : "Describe the competitive landscape"}
              className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setStep(1)}
          className="font-sans text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          ← {lang === "de" ? "Zurück" : "Back"}
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!canProceed}
          className="flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {lang === "de" ? "Weiter" : "Continue"}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Step 3 ────────────────────────────────────────────────────────────────────

function Step3() {
  const { data, setStep } = useWizard();
  const { lang } = useLanguage();

  const formatPrice = (p: string) => {
    const n = parseInt(p);
    if (!n) return "—";
    return `€${n.toLocaleString("de-DE")}`;
  };

  const rows: Array<{ key: string; value: string; step: number }> = [
    {
      key: lang === "de" ? "Transaktionsart" : "Type",
      value: data.type_of_operation || "—",
      step: 1,
    },
    { key: lang === "de" ? "Branche" : "Industry", value: data.category || "—", step: 1 },
    { key: lang === "de" ? "Stadt" : "City", value: data.city || "—", step: 1 },
    { key: lang === "de" ? "Region" : "Region", value: data.region || "—", step: 1 },
    { key: lang === "de" ? "Land" : "Country", value: data.country, step: 1 },
    { key: lang === "de" ? "Titel" : "Title", value: data.title || "—", step: 2 },
    {
      key: lang === "de" ? "Kaufpreis" : "Price",
      value: data.price_confidential
        ? lang === "de" ? "Vertraulich" : "Confidential"
        : formatPrice(data.asking_price),
      step: 2,
    },
    {
      key: lang === "de" ? "Status" : "Status",
      value:
        {
          active_profitable: lang === "de" ? "Aktiv & Profitabel" : "Active & Profitable",
          in_development: lang === "de" ? "In Entwicklung" : "In development",
          restructuring: lang === "de" ? "Sanierungsbedarf" : "Needs restructuring",
          "": "—",
        }[data.status_business] ?? "—",
      step: 2,
    },
    {
      key: lang === "de" ? "Fotos" : "Photos",
      value: `${data.images.length} ${lang === "de" ? "Foto(s)" : "photo(s)"}`,
      step: 2,
    },
  ].filter(Boolean);

  return (
    <div>
      <h2 className="font-fraunces text-[28px] text-[var(--ink)] mb-2">
        {lang === "de" ? "Zusammenfassung" : "Review"}
      </h2>
      <p className="font-sans text-[15px] text-[var(--muted)] mb-8">
        {lang === "de"
          ? "Überprüfen Sie Ihre Angaben vor der Veröffentlichung"
          : "Review your information before publishing"}
      </p>

      <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden mb-6">
        {rows.map((row, i) => (
          <div
            key={row.key}
            className={`flex items-center justify-between px-5 py-3.5 ${
              i < rows.length - 1 ? "border-b border-[var(--border)]" : ""
            }`}
          >
            <span className="font-mono text-[12px] text-[var(--muted)]">{row.key}</span>
            <div className="flex items-center gap-3">
              <span className="font-sans text-sm text-[var(--ink)] max-w-[300px] truncate">
                {row.value}
              </span>
              <button
                onClick={() => setStep(row.step)}
                className="font-mono text-[10px] text-[var(--accent)] hover:underline"
              >
                {lang === "de" ? "Bearbeiten" : "Edit"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--accent-light)] border border-[var(--accent)]/20 rounded-xl p-5 mb-8">
        <p className="font-sans text-sm text-[var(--accent)]">
          {lang === "de"
            ? "Ihr Inserat wird nach Auswahl eines Plans sofort veröffentlicht."
            : "Your listing will be published immediately after selecting a plan."}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(2)}
          className="font-sans text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          ← {lang === "de" ? "Zurück" : "Back"}
        </button>
        <button
          onClick={() => setStep(4)}
          className="flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          {lang === "de" ? "Bestätigen und Plan wählen →" : "Confirm and choose plan →"}
        </button>
      </div>
    </div>
  );
}

// ── Step 4 ────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "base" as const,
    name: "Base",
    price: 49,
    months: 4,
    popular: false,
    badge: null,
    features: {
      de: [
        "Inserat aufgeben",
        "4 Monate aktiv",
        "Professionelle Überprüfung",
        "Kontaktformular",
      ],
      en: [
        "Post listing",
        "Active for 4 months",
        "Professional review",
        "Contact form",
      ],
    },
  },
  {
    id: "plus" as const,
    name: "Plus",
    price: 89,
    months: 6,
    popular: true,
    badge: { de: "Beliebteste Wahl", en: "Most Popular" },
    features: {
      de: [
        "Alles aus Base",
        "6 Monate aktiv",
        "Featured Inserat",
        "Vertrauenssiegel",
        "Social Media Erwähnung",
      ],
      en: [
        "Everything in Base",
        "Active for 6 months",
        "Featured listing",
        "Trust badge",
        "Social media mention",
      ],
    },
  },
  {
    id: "premium" as const,
    name: "Premium",
    price: 149,
    months: 8,
    popular: false,
    badge: { de: "Maximale Sichtbarkeit", en: "Maximum Visibility" },
    features: {
      de: [
        "Alles aus Plus",
        "8 Monate aktiv",
        "Top-Priorität in Suche",
        "Social Media Werbung",
        "Dedizierter Support",
      ],
      en: [
        "Everything in Plus",
        "Active for 8 months",
        "Top priority in search",
        "Social media advertising",
        "Dedicated support",
      ],
    },
  },
];

function Step4() {
  const { data, updateData, setStep } = useWizard();
  const { lang } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelectPlan = async (planId: "base" | "plus" | "premium") => {
    setLoading(planId);
    updateData({ plan: planId });
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert(
        lang === "de"
          ? "Fehler beim Öffnen der Zahlungsseite. Bitte erneut versuchen."
          : "Error opening payment page. Please try again."
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <h2 className="font-fraunces text-[28px] text-[var(--ink)] mb-2">
        {lang === "de" ? "Sichtbarkeit wählen" : "Choose visibility"}
      </h2>
      <p className="font-sans text-[15px] text-[var(--muted)] mb-8">
        {lang === "de"
          ? "Wählen Sie den passenden Plan für Ihr Inserat"
          : "Choose the right plan for your listing"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white border-2 rounded-2xl p-6 ${
              plan.popular
                ? "border-[var(--accent)] shadow-[0_8px_32px_rgba(28,63,94,0.12)]"
                : "border-[var(--border)]"
            }`}
          >
            {plan.badge && (
              <div
                className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-mono font-medium ${
                  plan.popular
                    ? "bg-[var(--accent)] text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                {lang === "de" ? plan.badge.de : plan.badge.en}
              </div>
            )}

            <h3 className="font-fraunces text-[22px] text-[var(--ink)] mb-1">
              {plan.name}
            </h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-fraunces text-[36px] text-[var(--ink)]">
                €{plan.price}
              </span>
            </div>
            <p className="font-mono text-[11px] text-[var(--muted)] mb-5">
              {plan.months} {lang === "de" ? "Monate aktiv" : "months active"}
            </p>

            <ul className="space-y-2.5 mb-6">
              {(lang === "de" ? plan.features.de : plan.features.en).map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check size={14} className="text-[var(--green)] mt-0.5 flex-shrink-0" />
                  <span className="font-sans text-sm text-[var(--ink)]">{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan.id)}
              disabled={loading !== null}
              className={`w-full py-3 rounded-xl font-sans font-medium text-sm transition-all ${
                plan.popular
                  ? "bg-[var(--accent)] text-white hover:opacity-90"
                  : "border border-[var(--border)] text-[var(--ink)] hover:bg-[var(--accent-light)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              } disabled:opacity-70`}
            >
              {loading === plan.id
                ? lang === "de" ? "Wird geladen..." : "Loading..."
                : lang === "de" ? "Plan wählen →" : "Choose plan →"}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-xl p-5 flex items-center gap-3">
        <span className="text-2xl">⚡</span>
        <div>
          <p className="font-sans text-sm font-semibold text-[var(--ink)]">
            {lang === "de" ? "Wann wird mein Inserat live?" : "When will my listing go live?"}
          </p>
          <p className="font-sans text-sm text-[var(--muted)]">
            {lang === "de"
              ? "Sofort nach erfolgreicher Zahlung – innerhalb von Sekunden."
              : "Immediately after successful payment – within seconds."}
          </p>
        </div>
      </div>

      <div className="flex mt-6">
        <button
          onClick={() => setStep(3)}
          className="font-sans text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
        >
          ← {lang === "de" ? "Zurück" : "Back"}
        </button>
      </div>
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
