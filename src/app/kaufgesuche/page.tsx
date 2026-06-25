import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 300;

const SITE = "https://www.firmadeal.de";

export const metadata: Metadata = {
  title: "Aktuelle Kaufgesuche — wer sucht ein Unternehmen?",
  description:
    "Private Equity, Family Offices und Search Funds suchen über Firmadeal aktiv nach Unternehmen in Deutschland. Sehen Sie aktuelle Kaufgesuche nach Branche, Region und Budget — und reichen Sie Ihr Unternehmen anonym ein.",
  alternates: { canonical: `${SITE}/kaufgesuche` },
  openGraph: {
    title: "Aktuelle Kaufgesuche — wer sucht ein Unternehmen?",
    description: "Aktive Käufer aus dem Firmadeal-Netzwerk suchen nach Unternehmen in der DACH-Region. Nach Branche, Region und Budget.",
    url: `${SITE}/kaufgesuche`,
    type: "website",
    siteName: "Firmadeal",
    locale: "de_DE",
  },
};

type Gesuch = {
  buyer_type: string | null;
  branchen: string[] | null;
  regionen: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
};

function money(n: number | null): string | null {
  if (!n || n <= 0) return null;
  if (n >= 1_000_000) return "€" + (n / 1_000_000).toLocaleString("de-DE", { maximumFractionDigits: 1 }) + " Mio";
  return "€" + Math.round(n / 1000).toLocaleString("de-DE") + "k";
}
function budgetRange(min: number | null, max: number | null): string {
  const a = money(min);
  const b = money(max);
  if (a && b) return `${a}–${b}`;
  if (b) return `bis ${b}`;
  if (a) return `ab ${a}`;
  return "Budget flexibel";
}
function ago(d: string): string {
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
  if (days <= 0) return "heute";
  if (days === 1) return "gestern";
  if (days < 7) return `vor ${days} Tagen`;
  const w = Math.floor(days / 7);
  return w === 1 ? "vor 1 Woche" : `vor ${w} Wochen`;
}
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

async function getData(): Promise<{ gesuche: Gesuch[]; activeListings: number; cats: { label: string; n: number }[] }> {
  const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!urlEnv || !key) return { gesuche: [], activeListings: 0, cats: [] };
  try {
    const db = createClient(urlEnv, key, { auth: { persistSession: false } });
    const [g, l] = await Promise.all([
      db.from("buyer_leads").select("buyer_type, branchen, regionen, budget_min, budget_max, created_at").order("created_at", { ascending: false }).limit(60),
      db.from("listings").select("category").eq("status", "active"),
    ]);
    const rows = (l.data as { category: string | null }[]) ?? [];
    const map = new Map<string, number>();
    for (const r of rows) {
      const label = titleCase((r.category || "Sonstige").trim().toLowerCase());
      map.set(label, (map.get(label) ?? 0) + 1);
    }
    const cats = [...map.entries()].map(([label, n]) => ({ label, n })).sort((a, b) => b.n - a.n).slice(0, 8);
    return { gesuche: (g.data as Gesuch[]) ?? [], activeListings: rows.length, cats };
  } catch {
    return { gesuche: [], activeListings: 0, cats: [] };
  }
}

export default async function KaufgesuchePage() {
  const { gesuche, activeListings, cats } = await getData();
  const branchenCovered = new Set(gesuche.flatMap((g) => g.branchen ?? [])).size;
  const maxCat = Math.max(1, ...cats.map((c) => c.n));

  const card: CSSProperties = { background: "#fff", border: "1px solid #e3e0d6", borderRadius: 16, padding: "20px 22px" };

  return (
    <div style={{ background: "#f3efe7", fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: "#15281e", minHeight: "70vh" }}>
      {/* ── HERO ── */}
      <header style={{ background: "linear-gradient(160deg,#1f3d2f 0%,#16291f 100%)", color: "#fff", padding: "46px 0 76px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(143,207,176,.12)", border: "1px solid #2f5a44", borderRadius: 999, padding: "5px 13px", fontSize: 12.5, fontWeight: 700, letterSpacing: 1.5, color: "#8fcfb0", marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7fc6a3", display: "inline-block" }} /> KÄUFER-NETZWERK · DE · AT · CH
          </div>
          <h1 style={{ fontSize: "clamp(31px,5vw,52px)", fontWeight: 700, letterSpacing: "-1px", lineHeight: 1.05, maxWidth: 820, margin: 0 }}>
            Wer sucht gerade ein Unternehmen?
          </h1>
          <p style={{ fontSize: 18, color: "#cfe3d7", marginTop: 16, maxWidth: 660, lineHeight: 1.6 }}>
            Private Equity, Family Offices und Search Funds aus unserem Netzwerk suchen aktiv nach Nachfolge-Gelegenheiten — nach Branche, Region und Budget. Passt eines zu Ihrem Betrieb?
          </p>

          {/* Stat band */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 14, marginTop: 28, maxWidth: 720 }}>
            {[
              [String(gesuche.length || "—"), gesuche.length === 1 ? "aktives Kaufgesuch" : "aktive Kaufgesuche"],
              [String(activeListings), "Unternehmen gelistet"],
              [branchenCovered ? String(branchenCovered) : "15+", "Branchen gesucht"],
              ["0 %", "Provision für Verkäufer"],
            ].map(([n, l]) => (
              <div key={l} style={{ background: "rgba(255,255,255,.05)", border: "1px solid #2f5a44", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-1px", lineHeight: 1 }}>{n}</div>
                <div style={{ fontSize: 12.5, color: "#9ec7b1", marginTop: 6 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── GESUCHE ── */}
      <section style={{ maxWidth: 1040, margin: "-44px auto 0", padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.5px", margin: 0 }}>Aktuelle Kaufgesuche</h2>
          <span style={{ fontSize: 13, color: "#6b7d72", display: "inline-flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2d5a3d", display: "inline-block" }} /> anonymisiert · live aus dem Netzwerk
          </span>
        </div>

        {gesuche.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
            {gesuche.map((g, i) => {
              const br = (g.branchen ?? []).filter(Boolean);
              const re = (g.regionen ?? []).filter(Boolean);
              const headline = `${g.buyer_type || "Käufer"} sucht ${br.length ? br.slice(0, 2).join(" / ") : "Unternehmen"}${br.length > 2 ? ` +${br.length - 2}` : ""}`;
              return (
                <div key={i} style={{ ...card, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "16px 18px 14px", borderBottom: "1px solid #efe9dd" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#eaf4ee", color: "#1a3329", borderRadius: 999, padding: "4px 10px", fontSize: 11.5, fontWeight: 800, letterSpacing: .3 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2d5a3d" }} /> AKTIV
                      </span>
                      <span style={{ fontSize: 12, color: "#9aa89f" }}>{ago(g.created_at)}</span>
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>{headline}</div>
                  </div>
                  <div style={{ padding: "12px 18px 16px", display: "flex", flexDirection: "column", gap: 9, fontSize: 13.5, color: "#3f5249" }}>
                    <div style={{ display: "flex", gap: 8 }}><span style={{ color: "#8aa395", minWidth: 58, fontWeight: 600 }}>Region</span><span>{re.length ? re.slice(0, 2).join(", ") : "Ganz Deutschland"}</span></div>
                    <div style={{ display: "flex", gap: 8 }}><span style={{ color: "#8aa395", minWidth: 58, fontWeight: 600 }}>Budget</span><span style={{ fontWeight: 700, color: "#1a3329" }}>{budgetRange(g.budget_min, g.budget_max)}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ ...card, textAlign: "center", padding: "40px 24px" }}>
            <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Die ersten Kaufgesuche werden gerade ins Netzwerk aufgenommen.</p>
            <p style={{ fontSize: 14, color: "#6b7d72", margin: "8px 0 0" }}>
              Registrieren Sie Ihr Suchprofil als Käufer — oder reichen Sie Ihr Unternehmen ein und werden Sie gefunden.
            </p>
          </div>
        )}
      </section>

      {/* ── MARKET DATA: supply by sector (real) ── */}
      {cats.length > 0 && (
        <section style={{ maxWidth: 1040, margin: "44px auto 0", padding: "0 20px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.5px", margin: "0 0 4px" }}>Wo der Markt gerade aktiv ist</h2>
          <p style={{ fontSize: 14.5, color: "#52635a", margin: "0 0 18px", maxWidth: 640, lineHeight: 1.6 }}>
            {activeListings} Unternehmen sind aktuell auf Firmadeal gelistet. So verteilt sich das Angebot — und genau hier sucht das Käufer-Netzwerk.
          </p>
          <div style={{ ...card, padding: "22px 24px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {cats.map((c) => (
                <div key={c.label} style={{ display: "grid", gridTemplateColumns: "150px 1fr 34px", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#15281e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.label}</span>
                  <span style={{ background: "#ece7db", borderRadius: 999, height: 12, overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", width: `${Math.max(8, (c.n / maxCat) * 100)}%`, background: "linear-gradient(90deg,#2d5a3d,#4d8163)", borderRadius: 999 }} />
                  </span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: "#2d5a3d", textAlign: "right" }}>{c.n}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TRUST STRIP ── */}
      <section style={{ maxWidth: 1040, margin: "28px auto 0", padding: "0 20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {["0 % Provision", "Anonym bis zum Abschluss", "Geprüfte Käufer", "Einmalig €87", "DE · AT · CH"].map((t) => (
            <span key={t} style={{ background: "#fff", border: "1px solid #e3e0d6", borderRadius: 999, padding: "8px 14px", fontSize: 13, fontWeight: 600, color: "#2d5a3d" }}>✓ {t}</span>
          ))}
        </div>
      </section>

      {/* ── FOR SELLERS ── */}
      <section style={{ maxWidth: 1040, margin: "44px auto 0", padding: "0 20px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.5px", margin: "0 0 16px" }}>So werden Sie gefunden</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
          {[
            ["1", "Anonym einreichen", "Sie listen Ihr Unternehmen vertraulich — ohne Name, ohne dass Wettbewerber oder Mitarbeiter etwas erfahren. Einmalig €87, keine Provision."],
            ["2", "Wir matchen", "Wir gleichen Ihr Profil mit den Kaufgesuchen oben ab und stellen den Kontakt zu passenden, geprüften Käufern her."],
            ["3", "Sie verhandeln direkt", "Sobald beide Seiten Interesse haben, sprechen Sie direkt — kein Makler dazwischen, 0 % Erfolgsprovision."],
          ].map(([n, t, d]) => (
            <div key={n} style={card}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a3329", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, marginBottom: 12 }}>{n}</div>
              <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 6px" }}>{t}</p>
              <p style={{ fontSize: 14, color: "#52635a", lineHeight: 1.6, margin: 0 }}>{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={{ maxWidth: 1040, margin: "40px auto 0", padding: "0 20px 64px" }}>
        <div style={{ background: "linear-gradient(160deg,#1f3d2f,#16291f)", borderRadius: 20, padding: "36px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>Ihr Unternehmen könnte das nächste Match sein.</div>
            <div style={{ fontSize: 15, color: "#9ec7b1", marginTop: 6 }}>Anonym einreichen · 0 % Provision · einmalig €87</div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/sell" style={{ background: "#f3ece0", color: "#15281e", borderRadius: 12, padding: "15px 26px", fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
              Unternehmen einreichen →
            </Link>
            <Link href="/kaeufer" style={{ background: "transparent", color: "#fff", border: "1px solid #3f6e54", borderRadius: 12, padding: "15px 26px", fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
              Als Käufer suchen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
