"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { CATEGORIES, REGIONS_BY_COUNTRY } from "@/lib/types";
import Link from "next/link";

const STATUS_OPTIONS = ["active", "draft", "paused", "expired"];
const STATUS_BUSINESS_OPTIONS = [
  { value: "active_profitable", label: "Aktiv & Profitabel" },
  { value: "in_development",    label: "In Entwicklung" },
  { value: "restructuring",     label: "Sanierungsbedarf" },
];
const OPERATION_OPTIONS = [
  { value: "vollstaendige_uebertragung", label: "Vollständige Übertragung" },
  { value: "unternehmensuebertragung",   label: "Unternehmensübertragung" },
  { value: "gewerbeimmobilie",           label: "Gewerbeimmobilie" },
  { value: "anteilsuebertragung",        label: "Anteilsübertragung" },
  { value: "unternehmensverpachtung",    label: "Unternehmensverpachtung" },
  { value: "immobilienvermietung",       label: "Immobilienvermietung" },
];
const PLAN_OPTIONS = ["basic", "advanced", "premium"];
const COUNTRY_OPTIONS = [
  { value: "DE", label: "Deutschland" },
  { value: "AT", label: "Österreich" },
  { value: "CH", label: "Schweiz" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", fontSize: 14, border: "1px solid #e5e5e5",
  borderRadius: 8, fontFamily: "inherit", boxSizing: "border-box", outline: "none",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: "vertical", minHeight: 100,
};

const selectStyle: React.CSSProperties = {
  ...inputStyle, background: "white",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e5e5", padding: 24, marginBottom: 20 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#1a3329", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 20px" }}>
        {title}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

function FullRow({ children }: { children: React.ReactNode }) {
  return <div style={{ gridColumn: "1 / -1" }}>{children}</div>;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminEditListing() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [form, setForm] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    createClient()
      .from("listings")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => { if (data) setForm(data); });
  }, [id]);

  if (!form) {
    return <div style={{ padding: 40, color: "#999" }}>Lädt…</div>;
  }

  const set = (key: string, value: any) => setForm((f) => ({ ...f!, [key]: value }));

  const regions = form.country ? (REGIONS_BY_COUNTRY[form.country] ?? []) : Object.values(REGIONS_BY_COUNTRY).flat();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    setSuccess(false);

    // Sanitize numeric fields
    const payload = {
      ...form,
      asking_price:   form.asking_price   ? parseInt(form.asking_price)   : null,
      annual_revenue: form.annual_revenue ? parseInt(form.annual_revenue) : null,
      ebitda:         form.ebitda         ? parseInt(form.ebitda)         : null,
      employees:      form.employees      ? parseInt(form.employees)      : null,
      founded_year:   form.founded_year   ? parseInt(form.founded_year)   : null,
    };

    const res = await fetch("/api/admin/update-listing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(json.error ?? "Fehler beim Speichern.");
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
        <Link href="/admin/listings" style={{ color: "#999", textDecoration: "none", fontSize: 13 }}>
          ← Zurück
        </Link>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {form.title || "Inserat bearbeiten"}
        </h1>
        <a href={`/listings/${id}`} target="_blank" rel="noreferrer"
          style={{ fontSize: 13, color: "#2d5a3d", textDecoration: "none", fontWeight: 600 }}>
          Vorschau ↗
        </a>
      </div>

      <form onSubmit={handleSave}>

        {/* ── Basis ── */}
        <Section title="Basis">
          <FullRow>
            <Field label="Titel">
              <input style={inputStyle} value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} required />
            </Field>
          </FullRow>
          <FullRow>
            <Field label="Beschreibung">
              <textarea style={textareaStyle} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </FullRow>
          <Field label="Kategorie">
            <select style={selectStyle} value={form.category ?? ""} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select style={selectStyle} value={form.status ?? "draft"} onChange={(e) => set("status", e.target.value)}>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Land">
            <select style={selectStyle} value={form.country ?? "DE"}
              onChange={(e) => { set("country", e.target.value); set("region", ""); }}>
              {COUNTRY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Bundesland / Kanton">
            <select style={selectStyle} value={form.region ?? ""} onChange={(e) => set("region", e.target.value)}>
              <option value="">– keine –</option>
              {regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Stadt">
            <input style={inputStyle} value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Art der Transaktion">
            <select style={selectStyle} value={form.type_of_operation ?? ""} onChange={(e) => set("type_of_operation", e.target.value)}>
              {OPERATION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        </Section>

        {/* ── Finanzen ── */}
        <Section title="Finanzen">
          <Field label="Kaufpreis (€)">
            <input type="number" style={inputStyle} value={form.asking_price ?? ""}
              onChange={(e) => set("asking_price", e.target.value)} />
          </Field>
          <Field label="Preis vertraulich">
            <div style={{ paddingTop: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={!!form.price_confidential}
                  onChange={(e) => set("price_confidential", e.target.checked)} />
                Kaufpreis nicht öffentlich anzeigen
              </label>
            </div>
          </Field>
          <Field label="Jahresumsatz (€)">
            <input type="number" style={inputStyle} value={form.annual_revenue ?? ""}
              onChange={(e) => set("annual_revenue", e.target.value)} />
          </Field>
          <Field label="EBITDA (€)">
            <input type="number" style={inputStyle} value={form.ebitda ?? ""}
              onChange={(e) => set("ebitda", e.target.value)} />
          </Field>
          <Field label="Mitarbeiter">
            <input type="number" style={inputStyle} value={form.employees ?? ""}
              onChange={(e) => set("employees", e.target.value)} />
          </Field>
          <Field label="Gründungsjahr">
            <input type="number" style={inputStyle} value={form.founded_year ?? ""}
              onChange={(e) => set("founded_year", e.target.value)} />
          </Field>
        </Section>

        {/* ── Details ── */}
        <Section title="Details">
          <Field label="Unternehmensstatus">
            <select style={selectStyle} value={form.status_business ?? ""} onChange={(e) => set("status_business", e.target.value)}>
              {STATUS_BUSINESS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <div /> {/* spacer */}
          <FullRow>
            <Field label="Geschäftsmodell">
              <textarea style={textareaStyle} value={form.business_model ?? ""}
                onChange={(e) => set("business_model", e.target.value)} />
            </Field>
          </FullRow>
          <FullRow>
            <Field label="Wettbewerb">
              <textarea style={textareaStyle} value={form.competition ?? ""}
                onChange={(e) => set("competition", e.target.value)} />
            </Field>
          </FullRow>
          <FullRow>
            <Field label="Enthaltene Vermögenswerte">
              <textarea style={textareaStyle} value={form.assets_included ?? ""}
                onChange={(e) => set("assets_included", e.target.value)} />
            </Field>
          </FullRow>
          <FullRow>
            <Field label="Verkaufsgrund">
              <textarea style={textareaStyle} value={form.reason_for_sale ?? ""}
                onChange={(e) => set("reason_for_sale", e.target.value)} />
            </Field>
          </FullRow>
        </Section>

        {/* ── Kontakt ── */}
        <Section title="Kontakt & Firma">
          <Field label="Firmenname">
            <input style={inputStyle} value={form.company_name ?? ""}
              onChange={(e) => set("company_name", e.target.value)} />
          </Field>
          <Field label="USt-IdNr.">
            <input style={inputStyle} value={form.vat_number ?? ""}
              onChange={(e) => set("vat_number", e.target.value)} />
          </Field>
          <Field label="Telefon">
            <input style={inputStyle} value={form.phone ?? ""}
              onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Telefon anzeigen">
            <div style={{ paddingTop: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={!!form.show_phone}
                  onChange={(e) => set("show_phone", e.target.checked)} />
                Telefonnummer im Inserat anzeigen
              </label>
            </div>
          </Field>
        </Section>

        {/* ── Sichtbarkeit ── */}
        <Section title="Sichtbarkeit & Plan">
          <Field label="Plan">
            <select style={selectStyle} value={form.plan ?? "basic"} onChange={(e) => set("plan", e.target.value)}>
              {PLAN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Featured">
            <div style={{ paddingTop: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer" }}>
                <input type="checkbox" checked={!!form.featured}
                  onChange={(e) => set("featured", e.target.checked)} />
                Als Featured-Inserat hervorheben
              </label>
            </div>
          </Field>
        </Section>

        {/* ── Bilder ── */}
        <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e5e5", padding: 24, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: "#1a3329", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
              Bilder (URLs)
            </h2>
            <button type="button"
              onClick={() => set("images", [...(form.images ?? []), ""])}
              style={{ fontSize: 13, fontWeight: 600, color: "#2d5a3d", background: "none", border: "1px solid #2d5a3d", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" }}>
              + Bild hinzufügen
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {(form.images ?? []).map((url: string, i: number) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <input
                    style={inputStyle}
                    value={url}
                    placeholder="https://images.unsplash.com/..."
                    onChange={(e) => {
                      const imgs = [...(form.images ?? [])];
                      imgs[i] = e.target.value;
                      set("images", imgs);
                    }}
                  />
                  {url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt="" style={{ marginTop: 8, height: 80, width: 140, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e5e5" }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  )}
                </div>
                <button type="button"
                  onClick={() => { const imgs = (form.images ?? []).filter((_: string, j: number) => j !== i); set("images", imgs); }}
                  style={{ marginTop: 8, fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                  Entfernen
                </button>
              </div>
            ))}
            {!(form.images ?? []).length && (
              <p style={{ fontSize: 13, color: "#999" }}>Noch keine Bilder. Fügen Sie eine Bild-URL hinzu.</p>
            )}
          </div>
        </div>

        {/* ── Save bar ── */}
        <div style={{ position: "sticky", bottom: 0, background: "white", border: "1px solid #e5e5e5", borderRadius: 12, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}>
          {error && <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>{error}</p>}
          {success && <p style={{ fontSize: 13, color: "#2d5a3d", margin: 0, fontWeight: 600 }}>✓ Gespeichert!</p>}
          <div style={{ flex: 1 }} />
          <Link href="/admin/listings"
            style={{ fontSize: 14, color: "#666", textDecoration: "none", padding: "10px 20px" }}>
            Abbrechen
          </Link>
          <button type="submit" disabled={saving}
            style={{ background: "#1a3329", color: "white", border: "none", borderRadius: 8, padding: "10px 28px", fontSize: 14, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Speichert…" : "Änderungen speichern"}
          </button>
        </div>
      </form>
    </div>
  );
}
