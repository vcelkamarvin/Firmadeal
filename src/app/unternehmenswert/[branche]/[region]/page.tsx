import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Rechner from "../../Rechner";
import { BRANCHEN, REGIONEN, getBranche, getRegion } from "../../pseoData";

export const dynamicParams = false;

type Params = { branche: string; region: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  for (const b of BRANCHEN) for (const r of REGIONEN) out.push({ branche: b.slug, region: r.slug });
  return out;
}

const SITE = "https://www.firmadeal.de";
const num = (n: number) => n.toLocaleString("de-DE");
const eur = (n: number) => "€" + Math.round(n).toLocaleString("de-DE");

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { branche, region } = await params;
  const b = getBranche(branche);
  const r = getRegion(region);
  if (!b || !r) return { title: "Seite nicht gefunden | Firmadeal" };

  const url = `${SITE}/unternehmenswert/${b.slug}/${r.slug}`;
  const title = `${b.label} verkaufen in ${r.name}: Wert berechnen`;
  const description = `Was ist ein ${b.label} in ${r.name} wert? Kostenlose Sofort-Bewertung nach EBITDA-Multiplikator (${num(b.m[0])}–${num(b.m[1])}×), regional gewichtet. Anonym verkaufen — 0 % Provision, ohne Makler.`;

  return {
    title,
    description,
    keywords: [`${b.label} verkaufen`, `${b.label} verkaufen ${r.name}`, `${b.label} Wert`, "Unternehmen verkaufen", "Unternehmensbewertung", "Nachfolge"],
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: "Firmadeal", locale: "de_DE" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { branche, region } = await params;
  const b = getBranche(branche);
  const r = getRegion(region);
  if (!b || !r) notFound();

  const url = `${SITE}/unternehmenswert/${b.slug}/${r.slug}`;
  const exEbitda = 250000;
  const exLo = exEbitda * b.m[0] * r.f;
  const exHi = exEbitda * b.m[1] * r.f;
  const regPct = Math.round((r.f - 1) * 100);
  const regText = regPct === 0 ? "Bundesschnitt" : regPct > 0 ? `+${regPct} % über dem Schnitt` : `${regPct} % unter dem Schnitt`;

  const faqs: { q: string; a: string }[] = [
    {
      q: `Was ist ein ${b.label} in ${r.name} wert?`,
      a: `Faustregel: ${num(b.m[0])}–${num(b.m[1])}× EBITDA, regional gewichtet für ${r.name} (${regText}). Beispiel: bei ${eur(exEbitda)} EBITDA rund ${eur(exLo)}–${eur(exHi)}.`,
    },
    {
      q: `Wie verkaufe ich meinen ${b.label} in ${r.name} ohne Makler?`,
      a: `Anonym einreichen, direkt mit geprüften Käufern aus dem DACH-Netzwerk gematcht — kein Makler, keine Erfolgsprovision, einmalig €87.`,
    },
    {
      q: `Welcher Multiplikator gilt für einen ${b.label}?`,
      a: `${num(b.m[0])}–${num(b.m[1])}× EBITDA. Den oberen Wert erreichen Betriebe mit Wachstum, geringer Inhaberabhängigkeit und wiederkehrenden Umsätzen. Standort ${r.name}: Faktor ${num(r.f)}.`,
    },
    {
      q: `Wie lange dauert ein Unternehmensverkauf?`,
      a: `Meist 2 bis 6 Monate. Eine realistische Bewertung verkürzt den Prozess — der erste Schritt ist diese Sofort-Bewertung.`,
    },
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Unternehmenswert", item: `${SITE}/unternehmenswert` },
      { "@type": "ListItem", position: 2, name: b.label, item: `${SITE}/unternehmenswert/${b.slug}/bayern` },
      { "@type": "ListItem", position: 3, name: r.name, item: url },
    ],
  };

  const otherRegions = REGIONEN.filter((x) => x.slug !== r.slug);
  const otherBranchen = BRANCHEN.filter((x) => x.slug !== b.slug);

  const card: CSSProperties = { background: "#fff", border: "1px solid #e3e0d6", borderRadius: 16, padding: 22 };
  const stat: CSSProperties = { background: "#fff", border: "1px solid #e3e0d6", borderRadius: 14, padding: "18px 20px" };

  return (
    <div style={{ background: "#f3efe7", fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", color: "#15281e" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* ── HERO ── */}
      <header style={{ background: "#1a3329", color: "#fff", padding: "40px 0 84px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", padding: "0 20px" }}>
          <nav style={{ fontSize: 13, color: "#8fcfb0", marginBottom: 18 }}>
            <Link href="/unternehmenswert" style={{ color: "#8fcfb0", textDecoration: "none" }}>Unternehmenswert</Link>
            <span style={{ opacity: 0.5 }}> / </span>
            <span style={{ color: "#cfe3d7" }}>{b.label}</span>
            <span style={{ opacity: 0.5 }}> / </span>
            <span style={{ color: "#cfe3d7" }}>{r.name}</span>
          </nav>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2.5, color: "#8fcfb0", marginBottom: 14 }}>
            KOSTENLOSE SOFORT-BEWERTUNG · {r.name.toUpperCase()}
          </div>
          <h1 style={{ fontSize: "clamp(30px,5vw,50px)", fontWeight: 700, letterSpacing: "-1px", lineHeight: 1.05, maxWidth: 820, margin: 0 }}>
            {b.label} verkaufen in {r.name}: Was ist Ihr Betrieb wert?
          </h1>
          <p style={{ fontSize: 18, color: "#cfe3d7", marginTop: 16, maxWidth: 600, lineHeight: 1.6 }}>
            Gewinn eingeben, Wert sehen — in Sekunden. {num(b.m[0])}–{num(b.m[1])}× EBITDA, regional gewichtet. Anonym & kostenlos.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
            {["0 % Provision", "Anonym bis zum Abschluss", "DACH-Käufernetzwerk", "Einmalig €87"].map((p) => (
              <span key={p} style={{ border: "1px solid #3f6e54", color: "#cfe3d7", borderRadius: 18, padding: "6px 14px", fontSize: 13, fontWeight: 500 }}>{p}</span>
            ))}
          </div>
        </div>
      </header>

      {/* ── CALCULATOR (pre-filled) ── */}
      <Rechner initialBranche={b.calc} initialRegion={r.name} hideHero />

      {/* ── MARKET DATA PANEL ── */}
      <section style={{ maxWidth: 1040, margin: "8px auto 0", padding: "0 20px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.5px", margin: "0 0 6px" }}>
          Marktdaten: {b.label} in {r.name}
        </h2>
        <p style={{ fontSize: 15, color: "#52635a", margin: "0 0 18px", maxWidth: 700, lineHeight: 1.6 }}>
          So setzt sich der Wert eines {b.label} in {r.name} zusammen — die Kennzahlen hinter der Bewertung oben.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
          <div style={stat}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#2d5a3d", textTransform: "uppercase" }}>EBITDA-Multiplikator</div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-1px", marginTop: 6 }}>{num(b.m[0])}–{num(b.m[1])}×</div>
            <div style={{ fontSize: 13, color: "#6b7d72", marginTop: 4 }}>branchenüblich ({b.label})</div>
          </div>
          <div style={stat}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#2d5a3d", textTransform: "uppercase" }}>Regionaler Faktor</div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-1px", marginTop: 6 }}>{num(r.f)}×</div>
            <div style={{ fontSize: 13, color: "#6b7d72", marginTop: 4 }}>{r.name} — {regText}</div>
          </div>
          <div style={stat}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#2d5a3d", textTransform: "uppercase" }}>Rechenbeispiel</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.5px", marginTop: 6 }}>{eur(exLo)} – {eur(exHi)}</div>
            <div style={{ fontSize: 13, color: "#6b7d72", marginTop: 4 }}>bei {eur(exEbitda)} EBITDA</div>
          </div>
          <div style={stat}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: "#2d5a3d", textTransform: "uppercase" }}>Verkauf über</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.5px", marginTop: 6 }}>0 % Provision</div>
            <div style={{ fontSize: 13, color: "#6b7d72", marginTop: 4 }}>einmalig €87 · anonym</div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: "#8a988f", marginTop: 12, lineHeight: 1.5, maxWidth: 760 }}>
          Indikative Werte auf Basis branchenüblicher EBITDA-Multiplikatoren (DACH) und eines regionalen Faktors. Keine verbindliche Wertermittlung oder Finanzberatung.
        </p>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 1040, margin: "40px auto 0", padding: "0 20px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-.5px", margin: "0 0 18px" }}>
          Häufige Fragen: {b.label} verkaufen in {r.name}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((f) => (
            <details key={f.q} style={card}>
              <summary style={{ fontSize: 16, fontWeight: 700, cursor: "pointer", listStyle: "none" }}>{f.q}</summary>
              <p style={{ fontSize: 15, color: "#52635a", lineHeight: 1.7, margin: "12px 0 0" }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── INTERNAL LINKS ── */}
      <section style={{ maxWidth: 1040, margin: "40px auto 0", padding: "0 20px 64px" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>{b.label} verkaufen in anderen Bundesländern</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {otherRegions.map((x) => (
            <Link key={x.slug} href={`/unternehmenswert/${b.slug}/${x.slug}`}
              style={{ background: "#fff", border: "1px solid #e3e0d6", borderRadius: 18, padding: "7px 13px", fontSize: 13, color: "#2d5a3d", fontWeight: 600, textDecoration: "none" }}>
              {b.label} verkaufen {x.name}
            </Link>
          ))}
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 12px" }}>Andere Branchen in {r.name} bewerten</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {otherBranchen.map((x) => (
            <Link key={x.slug} href={`/unternehmenswert/${x.slug}/${r.slug}`}
              style={{ background: "#fff", border: "1px solid #e3e0d6", borderRadius: 18, padding: "7px 13px", fontSize: 13, color: "#2d5a3d", fontWeight: 600, textDecoration: "none" }}>
              {x.label} · {r.name}
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/sell" style={{ background: "#1a3329", color: "#fff", borderRadius: 12, padding: "15px 26px", fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
            {b.label} jetzt anonym einreichen →
          </Link>
          <Link href="/kaeufer" style={{ background: "#fff", color: "#15281e", border: "1px solid #d8d4c8", borderRadius: 12, padding: "15px 26px", fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
            Als Käufer registrieren
          </Link>
        </div>
      </section>
    </div>
  );
}
