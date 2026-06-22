"use client";

import { useState, useEffect } from "react";
import { Check, ChevronRight, Info } from "lucide-react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WizardProvider, useWizard } from "@/context/WizardContext";
import { CATEGORIES, DACH_REGIONS, OperationType } from "@/lib/types";
import PricingCards from "@/components/PricingCards";
import { createClient } from "@/lib/supabase";

// ── Analytics ──────────────────────────────────────────────────────────────────

function trackStep(num: number, label?: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gtag?.("event", `wizard_step_${num}_complete`, { event_category: "wizard", event_label: label ?? `step_${num}` });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).clarity?.("event", `wizard_step_${num}`);
  } catch {}
}

function trackEvent(name: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gtag?.("event", name, { event_category: "wizard" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).clarity?.("event", name);
  } catch {}
}

// ── Valuation helpers ─────────────────────────────────────────────────────────

const CATEGORY_MULTIPLES: Record<string, { lo: number; hi: number }> = {
  "Gastronomie & Lebensmittel": { lo: 2.5, hi: 4.0 },
  "IT & Software":              { lo: 4.0, hi: 8.0 },
  "Handwerk & Bau":             { lo: 2.0, hi: 3.5 },
  "Gesundheit & Pflege":        { lo: 3.0, hi: 5.0 },
  "E-Commerce & Retail":        { lo: 2.0, hi: 4.0 },
  "Dienstleistungen":           { lo: 2.0, hi: 4.0 },
  "Produktion & Industrie":     { lo: 3.0, hi: 5.0 },
  "Immobilien":                 { lo: 3.0, hi: 6.0 },
};

const EBITDA_MIDPOINTS: Record<string, number> = {
  "< 50k":      35_000,
  "50k–150k":  100_000,
  "150k–300k": 225_000,
  "300k–600k": 450_000,
  "600k–1M":   800_000,
  "> 1M":    1_500_000,
};

const REVENUE_MIDPOINTS: Record<string, number> = {
  "< 250k":    150_000,
  "250k–500k": 375_000,
  "500k–1M":   750_000,
  "1M–2,5M": 1_750_000,
  "2,5M–5M": 3_750_000,
  "> 5M":    7_000_000,
};

const EMPLOYEES_MIDPOINTS: Record<string, number> = {
  "1": 1, "2–5": 3, "6–15": 10, "16–50": 30, "51–200": 100, "> 200": 250,
};

function fmtEur(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(".", ",")} Mio. €`;
  if (n >= 1_000)     return `${Math.round(n / 1_000)}k €`;
  return `${n.toLocaleString("de-DE")} €`;
}

// ── Google SVG ─────────────────────────────────────────────────────────────────

const GOOGLE_SVG = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

// ── Step 0 — Auth gate ────────────────────────────────────────────────────────

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
      const { error: err } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
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
      if (err) { setError("Falsche E-Mail oder falsches Passwort."); setLoading(false); return; }
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) { onComplete(); } else { setError("Bitte bestätigen Sie Ihre E-Mail-Adresse, dann melden Sie sich hier an."); }
    setLoading(false);
  };

  const inp: React.CSSProperties = { height: 52, padding: "0 16px", borderRadius: 10, border: "1.5px solid #e5e5e5", fontSize: 16, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" };

  return (
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      <div className="mb-8">
        <h2 className="font-sans text-[26px] font-bold text-[var(--ink)] tracking-tight mb-2">
          {mode === "register" ? "Konto erstellen" : "Anmelden"}
        </h2>
        <p className="font-sans text-[14px] text-[var(--muted)]">
          {mode === "register" ? "Damit Ihr Inserat gespeichert wird und Käuferanfragen ankommen." : "Melden Sie sich an, um fortzufahren."}
        </p>
      </div>

      <button onClick={handleGoogle} disabled={loading} style={{ width: "100%", height: 52, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, background: "white", border: "2px solid #1a3329", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: "pointer", marginBottom: 20, fontFamily: "inherit", color: "#1a3329" }}>
        {GOOGLE_SVG} Mit Google fortfahren
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
        <span className="font-mono text-[11px] text-[var(--muted)]">oder mit E-Mail</span>
        <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "register" && <input type="text" placeholder="Ihr vollständiger Name" value={name} onChange={(e) => setName(e.target.value)} style={inp} autoComplete="name" />}
        <input type="email" placeholder="ihre@email.de" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} autoComplete="email" />
        <input type="password" placeholder={mode === "register" ? "Passwort (mind. 8 Zeichen)" : "Passwort"} value={password} onChange={(e) => setPassword(e.target.value)} style={inp} autoComplete={mode === "register" ? "new-password" : "current-password"} />

        {mode === "register" && (
          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", padding: "4px 0" }}>
            <input type="checkbox" checked={gdpr} onChange={(e) => setGdpr(e.target.checked)} style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0, accentColor: "#1a3329" }} />
            <span style={{ fontSize: 13, color: "#555", lineHeight: 1.5, fontFamily: "inherit" }}>
              Ich akzeptiere die <a href="/agb" target="_blank" rel="noopener noreferrer" style={{ color: "#2d5a3d" }}>AGB</a> und die <a href="/datenschutz" target="_blank" rel="noopener noreferrer" style={{ color: "#2d5a3d" }}>Datenschutzerklärung</a>. *
            </span>
          </label>
        )}

        {error && <p style={{ fontSize: 13, color: "#dc2626", margin: 0, fontFamily: "inherit" }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading || (mode === "register" && !gdpr)} style={{ height: 52, background: loading || (mode === "register" && !gdpr) ? "#ccc" : "#1a3329", color: "white", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: loading || (mode === "register" && !gdpr) ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {loading ? "Bitte warten…" : mode === "register" ? "Kostenlos registrieren →" : "Anmelden →"}
        </button>
      </div>

      <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#888", fontFamily: "inherit" }}>
        {mode === "register" ? "Bereits registriert? " : "Noch kein Konto? "}
        <button onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }} style={{ color: "#2d5a3d", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "inherit" }}>
          {mode === "register" ? "Hier anmelden" : "Jetzt registrieren"}
        </button>
      </p>

      {mode === "register" && (
        <div style={{ marginTop: 24, padding: "14px 16px", background: "#f5faf7", borderRadius: 10, display: "flex", flexDirection: "column", gap: 5 }}>
          {["Kein Spam — nur Käuferanfragen", "Jederzeit kündbar", "0% Provision beim Verkauf", "Ihre Daten sind verschlüsselt (SSL)"].map((item) => (
            <p key={item} style={{ fontSize: 12, color: "#2d5a3d", margin: 0, fontFamily: "inherit" }}>✓ {item}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Progress bar — 5 steps ────────────────────────────────────────────────────

const STEP_LABELS = ["Grunddaten", "Finanzen", "Titel & Preis", "Ihre Bewertung", "Einreichen"];
const TOTAL_STEPS = 5;

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div style={{ height: "4px", background: "#e5e5e5", borderRadius: "2px", marginBottom: "10px" }}>
        <div style={{ height: "100%", width: `${(step / TOTAL_STEPS) * 100}%`, background: "#1a3329", borderRadius: "2px", transition: "width 0.4s ease" }} />
      </div>
      <div className="flex items-center justify-between">
        <p className="font-sans text-[13px] text-[var(--muted)]">
          Schritt {step} von {TOTAL_STEPS} — <span className="font-semibold text-[var(--ink)]">{STEP_LABELS[step - 1]}</span>
        </p>
        {step >= 4 && (
          <span className="font-sans text-[12px] font-semibold text-[var(--accent)]">
            noch {TOTAL_STEPS - step + 1} {TOTAL_STEPS - step + 1 === 1 ? "Schritt" : "Schritte"}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Persistent anonymity reassurance ─────────────────────────────────────────

function AnonBadge() {
  return (
    <div className="mt-8 flex items-center gap-2 text-[var(--muted)]">
      <span className="text-[16px]">🔒</span>
      <p className="font-sans text-[12px]">
        Ihr Firmenname bleibt verborgen, bis Sie einen Kontakt einzeln freigeben.
      </p>
    </div>
  );
}

// ── Operation types ────────────────────────────────────────────────────────────

const OPERATION_TYPES: Array<{ value: OperationType; de: string; icon: string; sub: string }> = [
  { value: "vollstaendige_uebertragung", de: "Vollverkauf",                     icon: "🤝", sub: "Gesamtes Unternehmen" },
  { value: "unternehmensuebertragung",   de: "Verkauf ohne Immobilien",         icon: "🏢", sub: "Betrieb ohne Grundstück" },
  { value: "anteilsuebertragung",        de: "Teilverkauf / Investor gesucht",  icon: "📊", sub: "Anteile + Kapital" },
  { value: "unternehmensverpachtung",    de: "Betrieb verpachten",              icon: "🔑", sub: "Gesamten Betrieb verpachten" },
  { value: "gewerbeimmobilie",           de: "Immobilie verkaufen",             icon: "🏗️", sub: "Gewerbliche Immobilie" },
  { value: "immobilienvermietung",       de: "Gewerbefläche vermieten",         icon: "🏠", sub: "Büro, Laden, Lager" },
];

// ── Step 1 — Grunddaten ───────────────────────────────────────────────────────

function Step1() {
  const { data, updateData, setStep } = useWizard();
  const canProceed = !!data.category;

  return (
    <div>
      <h2 className="font-sans text-[26px] font-bold text-[var(--ink)] tracking-tight mb-1">Ihr Unternehmen</h2>
      <p className="font-sans text-[14px] text-[var(--muted)] mb-8">Ein paar Grunddaten — dauert 60 Sekunden.</p>

      {/* Transaction type */}
      <div className="mb-7">
        <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-3">Art der Transaktion</label>
        <div className="wizard-op-grid grid grid-cols-2 md:grid-cols-3 gap-3">
          {OPERATION_TYPES.map((op) => (
            <button
              key={op.value}
              onClick={() => updateData({ type_of_operation: op.value })}
              className={`text-left p-4 rounded-xl border-2 transition-all ${data.type_of_operation === op.value ? "border-[var(--accent)] bg-[var(--accent-light)]" : "border-[var(--border)] bg-white hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"}`}
            >
              <div className="text-2xl mb-2">{op.icon}</div>
              <div className="font-sans text-[13px] font-semibold text-[var(--ink)]">{op.de}</div>
              <div className="font-sans text-[11px] text-[var(--muted)] mt-0.5">{op.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Industry — required */}
      <div className="mb-5">
        <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">
          Branche <span className="text-red-400">*</span>
        </label>
        <select value={data.category} onChange={(e) => updateData({ category: e.target.value })} className="w-full border border-[var(--border)] rounded-lg font-sans bg-white outline-none" style={{ height: 52, fontSize: 16, padding: "0 16px", WebkitAppearance: "none", appearance: "none" }}>
          <option value="">Branche wählen…</option>
          {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">Stadt</label>
          <input type="text" value={data.city} onChange={(e) => updateData({ city: e.target.value })} placeholder="z.B. München" className="w-full px-4 py-3 border border-[var(--border)] rounded-lg font-sans outline-none focus:border-[var(--accent)]" style={{ fontSize: 16 }} />
        </div>
        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">Region</label>
          <select value={data.region} onChange={(e) => updateData({ region: e.target.value })} className="w-full border border-[var(--border)] rounded-lg font-sans bg-white outline-none" style={{ height: 52, fontSize: 16, padding: "0 16px", WebkitAppearance: "none", appearance: "none" }}>
            <option value="">Region wählen…</option>
            {DACH_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">Land</label>
          <select value={data.country} onChange={(e) => updateData({ country: e.target.value })} className="w-full border border-[var(--border)] rounded-lg font-sans bg-white outline-none" style={{ height: 52, fontSize: 16, padding: "0 16px", WebkitAppearance: "none", appearance: "none" }}>
            <option value="DE">🇩🇪 Deutschland</option>
            <option value="AT">🇦🇹 Österreich</option>
            <option value="CH">🇨🇭 Schweiz</option>
          </select>
        </div>
      </div>

      {/* Founded year + company name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">Gründungsjahr (optional)</label>
          <select value={data.founded_year} onChange={(e) => updateData({ founded_year: e.target.value })} className="w-full border border-[var(--border)] rounded-lg font-sans bg-white outline-none" style={{ height: 52, fontSize: 16, padding: "0 16px", WebkitAppearance: "none", appearance: "none" }}>
            <option value="">Jahr wählen…</option>
            {Array.from({ length: new Date().getFullYear() - 1899 }, (_, i) => new Date().getFullYear() - i).map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-2">Firmenname (optional)</label>
          <input type="text" value={data.company_name} onChange={(e) => updateData({ company_name: e.target.value })} placeholder="Muster GmbH" className="w-full px-4 py-3 border border-[var(--border)] rounded-lg font-sans outline-none focus:border-[var(--accent)]" style={{ fontSize: 16 }} />
        </div>
      </div>

      <div className="wizard-nav">
        <button onClick={() => { trackStep(1, "grunddaten"); setStep(2); }} disabled={!canProceed} className="wizard-nav-next flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-semibold px-6 py-3 rounded-full hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          Weiter <ChevronRight size={16} />
        </button>
      </div>
      <AnonBadge />
    </div>
  );
}

// ── Step 2 — Finanzen ─────────────────────────────────────────────────────────

const REVENUE_RANGES = ["< 250k", "250k–500k", "500k–1M", "1M–2,5M", "2,5M–5M", "> 5M"];
const EBITDA_RANGES  = ["< 50k", "50k–150k", "150k–300k", "300k–600k", "600k–1M", "> 1M"];
const EMPLOYEES_RANGES = ["1", "2–5", "6–15", "16–50", "51–200", "> 200"];
const REASON_CHIPS = ["Ruhestand / Nachfolge", "Neuausrichtung", "Gesundheitliche Gründe", "Kein Nachfolger", "Strategischer Verkauf", "Sonstiges"];

function RangeButtons({ options, value, onSelect }: { options: string[]; value: string; onSelect: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          style={{ minHeight: 48 }}
          className={`px-4 py-2 rounded-xl border-2 font-sans text-[14px] font-semibold transition-all ${value === opt ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--border)] bg-white text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function Tooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button type="button" onClick={() => setOpen(!open)} className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors ml-1.5">
        <Info size={14} />
      </button>
      {open && (
        <span className="absolute left-6 top-0 z-20 bg-[var(--ink)] text-white font-sans text-[12px] rounded-lg px-3 py-2 w-56 shadow-xl" style={{ lineHeight: 1.5 }}>
          {text}
        </span>
      )}
    </span>
  );
}

function Step2() {
  const { data, updateData, setStep } = useWizard();
  const canProceed = !!data.revenue_range;

  return (
    <div>
      <h2 className="font-sans text-[26px] font-bold text-[var(--ink)] tracking-tight mb-1">Finanzen</h2>
      <p className="font-sans text-[14px] text-[var(--muted)] mb-8">Grobe Angaben genügen — wir berechnen sofort Ihren indikativen Wert.</p>

      {/* Revenue */}
      <div className="mb-7">
        <div className="flex items-center mb-3">
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">
            Jahresumsatz <span className="text-red-400">*</span>
          </label>
          <Tooltip text="Gesamtumsatz vor Abzug aller Kosten (Bruttoumsatz). Grobe Angabe reicht." />
        </div>
        <RangeButtons
          options={REVENUE_RANGES}
          value={data.revenue_range}
          onSelect={(v) => updateData({ revenue_range: v, annual_revenue: String(REVENUE_MIDPOINTS[v] ?? "") })}
        />
      </div>

      {/* EBITDA */}
      <div className="mb-7">
        <div className="flex items-center mb-3">
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">
            EBITDA / Jahresgewinn
          </label>
          <Tooltip text="Gewinn vor Zinsen, Steuern, Abschreibungen. Falls unbekannt: Ihr Jahresgewinn reicht als Näherung." />
        </div>
        <RangeButtons
          options={EBITDA_RANGES}
          value={data.ebitda_range}
          onSelect={(v) => updateData({ ebitda_range: v, ebitda: String(EBITDA_MIDPOINTS[v] ?? "") })}
        />
        <p className="font-sans text-[11px] text-[var(--muted)] mt-2">Optional — aber wichtig für die Bewertung</p>
      </div>

      {/* Employees */}
      <div className="mb-7">
        <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-3">Mitarbeiter</label>
        <div className="flex flex-wrap gap-2">
          {EMPLOYEES_RANGES.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => updateData({ employees: String(EMPLOYEES_MIDPOINTS[opt] ?? opt) })}
              style={{ minHeight: 48 }}
              className={`px-5 py-2 rounded-xl border-2 font-sans text-[14px] font-semibold transition-all ${
                data.employees === String(EMPLOYEES_MIDPOINTS[opt] ?? opt)
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--border)] bg-white text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Reason for sale */}
      <div className="mb-8">
        <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-3">Verkaufsgrund (optional)</label>
        <div className="flex flex-wrap gap-2">
          {REASON_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => updateData({ reason_for_sale: data.reason_for_sale === chip ? "" : chip })}
              style={{ minHeight: 44 }}
              className={`px-4 py-2 rounded-full border font-sans text-[13px] transition-all ${data.reason_for_sale === chip ? "bg-[var(--accent)] text-white border-[var(--accent)]" : "bg-white text-[var(--ink)] border-[var(--border)] hover:border-[var(--accent)]"}`}
            >
              {data.reason_for_sale === chip && "✓ "}{chip}
            </button>
          ))}
        </div>
      </div>

      <div className="wizard-nav">
        <div className="flex items-center justify-between">
          <button onClick={() => setStep(1)} className="wizard-nav-back font-sans text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">← Zurück</button>
          <button onClick={() => { trackStep(2, "finanzen"); setStep(3); }} disabled={!canProceed} className="wizard-nav-next flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-semibold px-6 py-3 rounded-full hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Weiter <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <AnonBadge />
    </div>
  );
}

// ── Step 3 — Titel & Preis ────────────────────────────────────────────────────

const TITLE_CHIPS = [
  "Etabliertes Restaurant mit Biergarten — 15 Jahre",
  "E-Commerce-Shop mit 50k Besuchern/Monat",
  "Physiotherapiepraxis mit Kassenzulassung",
  "SaaS für KMU — 200 Kunden — Berlin",
  "Familiengeführte Bäckerei — 3 Filialen",
];

function Step3() {
  const { data, updateData, setStep } = useWizard();
  const canProceed = !!data.title;

  return (
    <div>
      <h2 className="font-sans text-[26px] font-bold text-[var(--ink)] tracking-tight mb-1">Titel & Kaufpreis</h2>
      <p className="font-sans text-[14px] text-[var(--muted)] mb-8">Wie soll Ihr Inserat heißen? Und welchen Preis stellen Sie vor?</p>

      {/* Title */}
      <div className="mb-7">
        <div className="flex items-center justify-between mb-2">
          <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide">
            Inseratstitel <span className="text-red-400">*</span>
          </label>
          <span className="font-mono text-[11px] text-[var(--muted)]">{data.title.length}/80</span>
        </div>
        <p className="font-sans text-[11px] text-[var(--muted)] mb-2">Struktur: <strong>Was</strong> — <strong>USP</strong> — <strong>Standort</strong></p>
        <input
          type="text"
          value={data.title}
          onChange={(e) => updateData({ title: e.target.value.slice(0, 80) })}
          placeholder="z.B. Etabliertes Restaurant mit Biergarten — 15 Jahre — München"
          className="w-full px-4 py-3 border border-[var(--border)] rounded-lg font-sans outline-none focus:border-[var(--accent)]"
          style={{ fontSize: 16 }}
        />
        {data.title.length > 0 && (
          <div className="h-1 rounded-full mt-1.5 hidden sm:block" style={{ background: `linear-gradient(to right, #4e9a66 ${Math.min(100, (data.title.length / 70) * 100)}%, #e5e5e5 ${Math.min(100, (data.title.length / 70) * 100)}%)` }} />
        )}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <span className="font-sans text-[11px] text-[var(--muted)]">Beispiel:</span>
          {TITLE_CHIPS.map((chip) => (
            <button key={chip} type="button" onClick={() => updateData({ title: chip.slice(0, 80) })} className="font-sans text-[11px] text-[var(--accent)] bg-[var(--accent-light)] hover:bg-[var(--accent)] hover:text-white px-2 py-0.5 rounded transition-colors">
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Asking price */}
      <div className="mb-8">
        <label className="font-sans text-[11px] font-bold text-[var(--muted)] uppercase tracking-wide block mb-3">Kaufpreisvorstellung</label>
        <div className="flex gap-3 items-start flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-sans font-bold text-[var(--muted)]">€</span>
            <input
              type="number"
              value={data.asking_price}
              onChange={(e) => updateData({ asking_price: e.target.value })}
              disabled={data.price_confidential}
              placeholder="350000"
              className="w-full pl-8 pr-4 py-3 border border-[var(--border)] rounded-lg font-sans outline-none focus:border-[var(--accent)] disabled:opacity-50 disabled:bg-[var(--surface2)] tabular-nums"
              style={{ fontSize: 16 }}
            />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", minHeight: 52, cursor: "pointer", borderRadius: 10, border: `1.5px solid ${data.price_confidential ? "#1a3329" : "#e5e5e5"}`, background: data.price_confidential ? "#e8f5ed" : "white", whiteSpace: "nowrap" }}>
            <input type="checkbox" checked={data.price_confidential} onChange={(e) => updateData({ price_confidential: e.target.checked })} style={{ width: 18, height: 18, flexShrink: 0, accentColor: "#1a3329" }} />
            <span className="font-sans text-[14px] text-[var(--ink)]">Auf Anfrage</span>
          </label>
        </div>
      </div>

      <div className="wizard-nav">
        <div className="flex items-center justify-between">
          <button onClick={() => setStep(2)} className="wizard-nav-back font-sans text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">← Zurück</button>
          <button onClick={() => { trackStep(3, "titel_preis"); setStep(4); }} disabled={!canProceed} className="wizard-nav-next flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-semibold px-6 py-3 rounded-full hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Weiter <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <AnonBadge />
    </div>
  );
}

// ── Step 4 — Bewertung + E-Mail ───────────────────────────────────────────────

function Step4() {
  const { data, setStep } = useWizard();
  const [userEmail, setUserEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);

  // Prefill email from auth session
  useEffect(() => {
    createClient().auth.getUser().then(({ data: d }) => {
      if (d.user?.email) setUserEmail(d.user.email);
    });
  }, []);

  // Compute valuation
  const m = CATEGORY_MULTIPLES[data.category] ?? { lo: 2.5, hi: 4.5 };
  const ebitdaNum = EBITDA_MIDPOINTS[data.ebitda_range] ?? (data.ebitda ? parseInt(data.ebitda) : 0);
  const hasValuation = ebitdaNum > 0;
  const lo = Math.round(ebitdaNum * m.lo);
  const hi = Math.round(ebitdaNum * m.hi);

  const handleSend = async () => {
    if (!userEmail) return;
    setSending(true);
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
    } catch { /* ignore */ }
    trackEvent("email_captured");
    setEmailSent(true);
    setSending(false);
  };

  return (
    <div>
      <h2 className="font-sans text-[28px] font-bold text-[var(--ink)] tracking-tight mb-2">
        Ihre Bewertung ist fertig.
      </h2>
      <p className="font-sans text-[14px] text-[var(--muted)] mb-6">
        Auf Basis Ihrer Angaben und Branchenmultiplikatoren für {data.category || "Ihr Segment"}.
      </p>

      {/* Valuation block */}
      {hasValuation ? (
        <div className="bg-[var(--accent)] rounded-2xl p-6 mb-6">
          <p className="font-mono text-[11px] text-white/50 uppercase tracking-widest mb-2">Indikativer Unternehmenswert</p>
          <div className="font-sans text-[36px] sm:text-[42px] font-bold text-white tracking-tight leading-none mb-2">
            {fmtEur(lo)} – {fmtEur(hi)}
          </div>
          <p className="font-sans text-[12px] text-white/60">
            Basis: {m.lo}×–{m.hi}× EBITDA · {data.category} · Indikative Schätzung, keine Finanzberatung
          </p>
        </div>
      ) : (
        <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-2xl p-6 mb-6">
          <p className="font-sans text-[14px] text-[var(--muted)]">
            Für eine Bewertung bitte in Schritt 2 den EBITDA angeben. Wir schicken Ihnen eine manuelle Einschätzung per E-Mail.
          </p>
        </div>
      )}

      {/* Key details summary */}
      <div className="bg-white border border-[var(--border)] rounded-xl px-5 py-4 mb-6 space-y-2">
        {[
          { k: "Branche", v: data.category || "—" },
          { k: "Umsatz", v: data.revenue_range || "—" },
          { k: "EBITDA", v: data.ebitda_range || "—" },
          { k: "Mitarbeiter", v: data.employees || "—" },
        ].map((row) => (
          <div key={row.k} className="flex justify-between">
            <span className="font-sans text-[12px] text-[var(--muted)]">{row.k}</span>
            <span className="font-sans text-[13px] font-semibold text-[var(--ink)]">{row.v}</span>
          </div>
        ))}
      </div>

      {/* Email capture */}
      <div className="bg-[var(--surface2)] border border-[var(--border)] rounded-xl p-5 mb-6">
        <p className="font-sans text-[14px] font-semibold text-[var(--ink)] mb-1">
          Wohin sollen wir die detaillierte Bewertung und passende Käufer senden?
        </p>
        <p className="font-sans text-[12px] text-[var(--muted)] mb-4">Kostenlos · kein Spam · DSGVO-konform</p>

        {emailSent ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check size={16} />
            <p className="font-sans text-[14px] font-semibold">Wird zugestellt! Weiter zur Einreichung →</p>
          </div>
        ) : (
          <div className="flex gap-3 flex-wrap">
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="ihre@email.de"
              className="flex-1 min-w-[200px] px-4 py-3 border border-[var(--border)] rounded-xl font-sans outline-none focus:border-[var(--accent)]"
              style={{ fontSize: 16 }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !userEmail}
              className="px-5 py-3 bg-[var(--accent)] text-white font-sans font-semibold rounded-xl hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {sending ? "Wird gesendet…" : "Bewertung + Käufer-Matching erhalten →"}
            </button>
          </div>
        )}
      </div>

      <div className="wizard-nav">
        <div className="flex items-center justify-between">
          <button onClick={() => setStep(3)} className="wizard-nav-back font-sans text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">← Zurück</button>
          <button
            onClick={() => { trackStep(4, "bewertung_email"); setStep(5); }}
            className="wizard-nav-next flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-semibold px-6 py-3 rounded-full hover:bg-[var(--accent-hover)] transition-colors"
          >
            Aktiv vor Investoren bringen →
          </button>
        </div>
      </div>
      <AnonBadge />
    </div>
  );
}

// ── Step 5 — Zahlung ──────────────────────────────────────────────────────────

function Step5() {
  const { data, updateData, setStep, listingId, setListingId } = useWizard();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [savedPromo, setSavedPromo] = useState<string | null>(null);

  useEffect(() => {
    try { setSavedPromo(localStorage.getItem("firmadeal_promo")); } catch {}
  }, []);

  const handleSelectPlan = async (planId: string) => {
    updateData({ plan: planId as "test" });
    setLoadingPlan(planId);
    setCheckoutError(null);
    trackEvent("payment_started");

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login?redirect=/sell"; return; }

      let id = listingId;
      if (!id) {
        const listingRes = await fetch("/api/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type_of_operation: data.type_of_operation,
            category: data.category,
            city: data.city,
            region: data.region,
            country: data.country,
            company_name: data.company_name || null,
            founded_year: data.founded_year ? Number(data.founded_year) : null,
            title: data.title,
            asking_price: data.asking_price ? Number(data.asking_price) : null,
            price_confidential: data.price_confidential,
            annual_revenue: data.annual_revenue ? Number(data.annual_revenue) : null,
            ebitda: data.ebitda ? Number(data.ebitda) : null,
            employees: data.employees ? Number(data.employees) : null,
            description: data.description || null,
            phone: data.phone || null,
            show_phone: data.show_phone,
            status_business: data.status_business || "active_profitable",
            reason_for_sale: data.reason_for_sale || null,
            business_model: data.business_model || null,
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

      const promoCode = typeof window !== "undefined" ? localStorage.getItem("firmadeal_promo") : null;
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(promoCode ? { "x-promo-code": promoCode } : {}) },
        body: JSON.stringify({ plan: planId, listingId: id }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      try { localStorage.removeItem("firmadeal_promo"); } catch {}
      trackEvent("payment_redirect_stripe");
      window.location.href = json.url;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Unbekannter Fehler");
      setLoadingPlan(null);
    }
  };

  return (
    <div>
      <h2 className="font-sans text-[26px] font-bold text-[var(--ink)] tracking-tight mb-2">
        Aktiv vor unsere Investoren bringen
      </h2>
      <p className="font-sans text-[14px] text-[var(--muted)] mb-4">
        Einmalig €87 · 0% Provision · keine Verlängerung
      </p>

      {/* Risk reversal */}
      <div className="bg-[var(--accent-light)] border border-[var(--accent)]/30 rounded-xl px-5 py-4 mb-6">
        <p className="font-sans text-[14px] font-semibold text-[var(--accent)] mb-1">
          14 Tage Geld-zurück, wenn kein Käuferkontakt zustande kommt.
        </p>
        <p className="font-sans text-[13px] text-[var(--muted)]">
          Nach Zahlung: Ihr Profil geht sofort in unser Investoren-Netzwerk und Sie erhalten Zugang zu Ihrem Dashboard.
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
        <div className="bg-red-50 border border-red-200 text-red-700 font-sans text-[13px] px-4 py-3 rounded-lg mb-6">{checkoutError}</div>
      )}

      <PricingCards onSelectPlan={handleSelectPlan} loadingPlan={loadingPlan} />

      {/* Trust row */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6 pt-4 border-t border-[var(--border)]">
        {["🔒 Sichere Zahlung", "Stripe", "Anonym bis Abschluss", "0% Provision", "Kein Abo"].map((item) => (
          <span key={item} className="font-sans text-[12px] text-[var(--muted)]">{item}</span>
        ))}
      </div>

      <div className="wizard-nav mt-6">
        <button onClick={() => setStep(4)} className="wizard-nav-back font-sans text-sm text-[var(--muted)] hover:text-[var(--ink)] transition-colors">← Zurück</button>
      </div>
    </div>
  );
}

// ── Wizard shell ───────────────────────────────────────────────────────────────

function WizardShell() {
  const { step, resetWizard } = useWizard();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("firmadeal_wizard_draft");
      if (raw) {
        const parsed = JSON.parse(raw);
        if ((parsed._step && parsed._step > 1) || parsed.title || parsed.category) {
          setShowResumeBanner(true);
        }
      }
    } catch {}
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
      <div className="wizard-page-body max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!authed ? (
          <Step0Auth onComplete={() => setAuthed(true)} />
        ) : (
          <>
            {showResumeBanner && (
              <div style={{ background: "#E8F5EE", border: "1px solid #1A5C3A", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, color: "#1A5C3A", fontFamily: "inherit" }}>
                  ✓ Sie haben ein angefangenes Inserat — Schritt {step} von {TOTAL_STEPS}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => setShowResumeBanner(false)} style={{ padding: "6px 14px", background: "#1A5C3A", color: "white", border: "none", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    Weiter machen
                  </button>
                  <button onClick={() => { resetWizard(); setShowResumeBanner(false); }} style={{ padding: "6px 14px", background: "transparent", color: "#6B7280", border: "1px solid #E2E8E4", borderRadius: 6, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                    Neu beginnen
                  </button>
                </div>
              </div>
            )}
            <ProgressBar step={step} />
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            {step === 4 && <Step4 />}
            {step === 5 && <Step5 />}
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
