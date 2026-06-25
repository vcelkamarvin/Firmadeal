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

async function getData(): Promise<{ gesuche: Gesuch[]; activeListings: number }> {
  const urlEnv = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!urlEnv || !key) return { gesuche: [], activeListings: 0 };
  try {
    const db = createClient(urlEnv, key, { auth: { persistSession: false } });
    const [g, l] = await Promise.all([
      db.from("buyer_leads").select("buyer_type, branchen, regionen, budget_min, budget_max, created_at").order("created_at", { ascending: false }).limit(60),
      db.from("listings").select("id", { count: "exact", head: true }).eq("status", "active"),
    ]);
    return { gesuche: (g.data as Gesuch[]) ?? [], activeListings: l.count ?? 0 };
  } catch {
    return { gesuche: [], activeListings: 0 };
  }
}

export default async function KaufgesuchePage() {
  const { gesuche, activeListings } = await getData();
  const branchenCovered = new Set(gesuche.flatMap((g) => g.branchen ?? [])).size;

  const card: CSSProperties = { background: "#fff", border: "1px solid #e3e0d6", borderRadius: 16, padding: "20px 22px" };

  return (
    <div style={{ background: "#f3efe7", fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: "#15281e", minHeight: "70vh" }}>
      {/* ── HERO ── */}
      <header style={{ background: "#1a3329", color: "#fff", padding: "44px 0 72px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2.5, color: "#8fcfb0", marginBottom: 14 }}>
            KÄUFER-NETZWERK · DE · AT · CH
          </div>
          <h1 style={{ fontSize: "clamp(30px,5vw,50px)", fontWeight: 700, letterSpacing: "-1px", lineHeight: 1.05, maxWidth: 800, margin: 0 }}>
            Wer sucht gerade ein Unternehmen?
          </h1>
          <p style={{ fontSize: 18, color: "#cfe3d7", marginTop: 16, maxWidth: 680, lineHeight: 1.6 }}>
            Private Equity, Family Offices und Search Funds aus unserem Netzwerk suchen aktiv nach Nachfolge-Gelegenheiten.
            Hier sehen Sie aktuelle Kaufgesuche — nach Branche, Region und Budget. Passt eines zu Ihrem Betrieb?
          </p>

          {/* Stat bar (real numbers) */}
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginTop: 26 }}>
            {[
              [String(gesuche.length), gesuche.length === 1 ? "aktives Kaufgesuch" : "aktive Kaufgesuche"],
              [String(activeListings), "Unternehmen gelistet"],
              [branchenCovered ? String(branchenCovered) : "15+", "Branchen abgedeckt"],
              ["0 %", "Provision für Verkäufer"],
            ].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-1px" }}>{n}</div>
                <div style={{ fontSize: 13, color: "#9ec7b1" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── GESUCHE ── */}
      <section style={{ maxWidth: 1040, margin: "-40px auto 0", padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.5px", margin: 0 }}>Aktuelle Kaufgesuche</h2>
          <span style={{ fontSize: 13, color: "#6b7d72" }}>anonymisiert · live aus dem Netzwerk</span>
        </div>

        {gesuche.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {gesuche.map((g, i) => {
              const br = (g.branchen ?? []).filter(Boolean);
              const re = (g.regionen ?? []).filter(Boolean);
              return (
                <div key={i} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ background: "#eaf4ee", color: "#1a3329", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>
                      {g.buyer_type || "Käufer"}
                    </span>
                    <span style={{ fontSize: 12, color: "#9aa89f" }}>{ago(g.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3 }}>
                    sucht {br.length ? br.slice(0, 2).join(" / ") : "Unternehmen"}
                    {br.length > 2 ? ` +${br.length - 2}` : ""}
                  </div>
                  <div style={{ fontSize: 14, color: "#52635a", marginTop: 8, display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <span>📍 {re.length ? re.slice(0, 2).join(", ") : "Ganz Deutschland"}</span>
                    <span>💶 {budgetRange(g.budget_min, g.budget_max)}</span>
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

      {/* ── FOR SELLERS ── */}
      <section style={{ maxWidth: 1040, margin: "44px auto 0", padding: "0 20px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.5px", margin: "0 0 16px" }}>So werden Sie gefunden</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
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
        <div style={{ background: "#1a3329", borderRadius: 20, padding: "36px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
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
