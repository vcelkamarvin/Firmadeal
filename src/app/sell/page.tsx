"use client";

import { useState, useEffect } from "react";
import { Check, ChevronRight, Upload, X } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useLanguage } from "@/context/LanguageContext";
import { WizardProvider, useWizard } from "@/context/WizardContext";
import { CATEGORIES, DACH_REGIONS, OperationType, BusinessStatus } from "@/lib/types";
import PricingCards from "@/components/PricingCards";
import TransferabilityWizard from "@/components/TransferabilityWizard";
import { createClient } from "@/lib/supabase";

// ── Step 0 — Auth gate ────────────────────────────────────────────────────────

const GOOGLE_SVG = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

function Step0Auth({ onComplete }: { onComplete: () => void }) {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/sell`, queryParams: { prompt: "select_account" } },
    });
  };

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("Bitte E-Mail und Passwort eingeben."); return; }
    if (mode === "register") {
      if (!name) { setError("Bitte Ihren Namen eingeben."); return; }
      if (!gdpr) { setError("Bitte Datenschutzerklärung akzeptieren."); return; }
      if (password.length < 8) { setError("Passwort muss mindestens 8 Zeichen haben."); return; }
    }
    setLoading(true);
    if (mode === "register") {
      const { error: err } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } },
      });
      if (err) {
        if (err.message.toLowerCase().includes("already")) {
          setMode("login");
          setError("E-Mail bereits registriert — bitte anmelden.");
        } else {
          setError(err.message);
        }
        setLoading(false);
        return;
      }
    } else {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) {
        setError("Falsche E-Mail oder falsches Passwort.");
        setLoading(false);
        return;
      }
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      onComplete();
    } else {
      setError("Bitte bestätigen Sie Ihre E-Mail-Adresse, dann melden Sie sich hier an.");
    }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    height: 52, padding: "0 16px", borderRadius: 10,
    border: "1.5px solid #e5e5e5", fontSize: 16,
    fontFamily: "inherit", outline: "none",
    width: "100%", boxSizing: "border-box" as const,
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      <div className="mb-8">
        <h2 className="font-sans text-[26px] font-bold text-[var(--ink)] tracking-tight mb-2">
          {mode === "register" ? "Konto erstellen" : "Anmelden"}
        </h2>
        <p className="font-sans text-[14px] text-[var(--muted)]">
          {mode === "register"
            ? "Damit Ihr Inserat gespeichert wird und Käuferanfragen ankommen."
            : "Melden Sie sich an, um fortzufahren."}
        </p>
      </div>

      {/* Google OAuth — primary CTA */}
      <button
        onClick={handleGoogle}
        disabled={loading}
        style={{
          width: "100%", height: 52, display: "flex", alignItems: "center", justifyContent: "center",
          gap: 12, background: "white", border: "2px solid #1a3329", borderRadius: 10,
          fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 20,
          fontFamily: "inherit", color: "#1a3329",
        }}
      >
        {GOOGLE_SVG}
        Mit Google fortfahren
      </button>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
        <span className="font-mono text-[11px] text-[var(--muted)]">oder mit E-Mail</span>
        <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
      </div>

      {/* Email form */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "register" && (
          <input
            type="text" placeholder="Ihr vollständiger Name"
            value={name} onChange={(e) => setName(e.target.value)}
            style={inputStyle} autoComplete="name"
          />
        )}
        <input
          type="email" placeholder="ihre@email.de"
          value={email} onChange={(e) => setEmail(e.target.value)}
          style={inputStyle} autoComplete="email"
        />
        <input
          type="password" placeholder={mode === "register" ? "Passwort (mind. 8 Zeichen)" : "Passwort"}
          value={password} onChange={(e) => setPassword(e.target.value)}
          style={inputStyle} autoComplete={mode === "register" ? "new-password" : "current-password"}
        />

        {/* GDPR — required for EU compliance */}
        {mode === "register" && (
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", padding: "4px 0" }}>
            <input
              type="checkbox" checked={gdpr} onChange={(e) => setGdpr(e.target.checked)}
              style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0, accentColor: "#1a3329" }}
            />
            <span style={{ fontSize: 13, color: "#555", lineHeight: 1.5, fontFamily: "inherit" }}>
              Ich akzeptiere die{" "}
              <a href="/agb" target="_blank" rel="noopener noreferrer" style={{ color: "#2d5a3d" }}>AGB</a>{" "}
              und die{" "}
              <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: "#2d5a3d" }}>Datenschutzerklärung</a>{" "}
              von Firmadeal.de. *
            </span>
          </label>
        )}

        {error && (
          <p style={{ fontSize: 13, color: "#dc2626", margin: 0, fontFamily: "inherit" }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || (mode === "register" && !gdpr)}
          style={{
            height: 52,
            background: loading || (mode === "register" && !gdpr) ? "#ccc" : "#1a3329",
            color: "white", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600,
            cursor: loading || (mode === "register" && !gdpr) ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "background 0.15s",
          }}
        >
          {loading ? "Bitte warten…" : mode === "register" ? "Kostenlos registrieren →" : "Anmelden →"}
        </button>
      </div>

      {/* Mode toggle */}
      <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#888", fontFamily: "inherit" }}>
        {mode === "register" ? "Bereits registriert? " : "Noch kein Konto? "}
        <button
          onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}
          style={{ color: "#2d5a3d", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}
        >
          {mode === "register" ? "Hier anmelden" : "Jetzt registrieren"}
        </button>
      </p>

      {/* Trust signals */}
      {mode === "register" && (
        <div style={{ marginTop: 24, padding: "14px 16px", background: "#f5faf7", borderRadius: 10, display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            "Kein Spam — nur Käuferanfragen",
            "Jederzeit kündbar",
            "0% Provision beim Verkauf",
            "Ihre Daten sind verschlüsselt (SSL)",
          ].map((item) => (
            <p key={item} style={{ fontSize: 12, color: "#2d5a3d", margin: 0, fontFamily: "inherit" }}>✓ {item}</p>
          ))}
        </div>
      )}
    </div>
  );
}

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
          <select
            value={data.founded_year}
            onChange={(e) => updateData({ founded_year: e.target.value })}
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans bg-white outline-none focus:border-[var(--accent)]"
          >
            <option value="">{lang === "de" ? "Jahr wählen…" : "Choose year…"}</option>
            {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
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
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Create object URLs once when images array changes; revoke old ones to prevent memory leaks.
  // Never call URL.createObjectURL() inline in JSX — it runs on every render.
  useEffect(() => {
    const urls = data.images.map((f) => {
      try { return URL.createObjectURL(f); } catch { return ""; }
    });
    setImageUrls(urls);
    return () => { urls.forEach((u) => { if (u) URL.revokeObjectURL(u); }); };
  }, [data.images]);

  const canProceed = (data.title?.length ?? 0) >= 10 && (data.description?.length ?? 0) >= 100 && data.status_business !== "";

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

  const wordCount = (data.description ?? "").trim().split(/\s+/).filter(Boolean).length;

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

        {/* 4. Competition chips + free text */}
        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-3">
            Wettbewerbssituation
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
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
          <textarea
            value={data.competition}
            onChange={(e) => updateData({ competition: e.target.value })}
            rows={3}
            placeholder="Beschreiben Sie Ihre Wettbewerber (optional) — z.B. Hauptkonkurrenten, Alleinstellungsmerkmale, Marktposition..."
            className="w-full px-3 py-2.5 border border-[var(--border)] rounded-lg text-sm font-sans outline-none focus:border-[var(--accent)] resize-none"
          />
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
          {imageUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {imageUrls.map((url, i) => url ? (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-[var(--surface2)]">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => updateData({ images: data.images.filter((_, idx) => idx !== i) })}
                    className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-sm">
                    <X size={12} className="text-[var(--red)]" />
                  </button>
                </div>
              ) : null)}
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
  const [savedPromo, setSavedPromo] = useState<string | null>(null);

  useEffect(() => {
    try { setSavedPromo(localStorage.getItem("firmadeal_promo")); } catch {}
  }, []);

  const investorCount = INVESTORS_BY_CATEGORY[data.category] ?? 1200;
  const categoryLabel = data.category || "DACH";

  const handleSelectPlan = async (planId: "basic" | "advanced" | "premium") => {
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
            // Step 1
            type_of_operation: data.type_of_operation,
            category: data.category,
            city: data.city,
            region: data.region,
            country: data.country,
            company_name: data.company_name || null,
            vat_number: data.vat_number || null,
            founded_year: data.founded_year ? Number(data.founded_year) : null,
            // Step 2
            title: data.title,
            asking_price: data.asking_price ? Number(data.asking_price) : null,
            price_confidential: data.price_confidential,
            annual_revenue: data.annual_revenue ? Number(data.annual_revenue) : null,
            ebitda: data.ebitda ? Number(data.ebitda) : null,
            employees: data.employees ? Number(data.employees) : null,
            description: data.description,
            phone: data.phone || null,
            show_phone: data.show_phone,
            status_business: data.status_business || "active_profitable",
            reason_for_sale: data.reason_for_sale || null,
            business_model: data.business_model || null,
            business_model_chips: data.business_model_chips,
            competition_chips: data.competition_chips,
            assets_included: null,
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

      // Create Stripe checkout session (pass saved promo code if present)
      const promoCode = typeof window !== "undefined" ? localStorage.getItem("firmadeal_promo") : null;
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(promoCode ? { "x-promo-code": promoCode } : {}),
        },
        body: JSON.stringify({ plan: planId, listingId: id }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);

      // Clear saved promo after using it
      try { localStorage.removeItem("firmadeal_promo"); } catch {}
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
        <p className="font-sans font-bold text-[var(--ink)] mb-2" style={{ fontSize: "clamp(16px, 4vw, 22px)" }}>
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

      {savedPromo && (
        <div className="bg-[var(--accent-light)] border border-[var(--accent)]/20 rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-[var(--accent)]">🎁 AKTIONSCODE GESPEICHERT:</span>
          <span className="font-mono text-[13px] font-bold text-[var(--accent)]">{savedPromo}</span>
          <span className="font-sans text-[12px] text-[var(--muted)] ml-auto">Wird bei Stripe automatisch angewendet</span>
        </div>
      )}

      {checkoutError && (
        <div className="bg-red-50 border border-red-200 text-red-700 font-sans text-[13px] px-4 py-3 rounded-lg mb-6">
          {checkoutError}
        </div>
      )}

      <PricingCards
        onSelectPlan={handleSelectPlan}
        loadingPlan={loadingPlan}
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
  const [authed, setAuthed] = useState<boolean | null>(null);

  // Check auth on mount — null = still checking, false = not logged in, true = logged in
  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  if (authed === null) {
    return (
      <div className="bg-[var(--bg)] min-h-screen flex items-center justify-center">
        <span className="font-mono text-sm text-[var(--muted)]">Lädt…</span>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!authed ? (
          /* Step 0: Auth gate — register/login before filling wizard */
          <Step0Auth onComplete={() => setAuthed(true)} />
        ) : (
          <>
            <ProgressBar step={step} />
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            {step === 4 && <Step4 />}
          </>
        )}
      </div>
    </div>
  );
}

export default function SellPage() {
  return (
    <ErrorBoundary>
      <WizardProvider>
        <WizardShell />
      </WizardProvider>
    </ErrorBoundary>
  );
}
