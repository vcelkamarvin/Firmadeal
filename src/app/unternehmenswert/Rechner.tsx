"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BRANCHEN as PSEO_BRANCHEN, REGIONEN as PSEO_REGIONEN } from "./pseoData";

const BRANCHEN: Record<string, [number, number]> = {
  "Pflegedienst": [4.0, 6.0], "Arztpraxis (Kassensitz)": [3.5, 5.5], "Steuerkanzlei": [4.5, 7.0],
  "KFZ-Werkstatt": [2.5, 4.0], "Bäckerei / Café": [2.0, 3.5], "Friseursalon": [1.5, 3.0],
  "Physiotherapie-Praxis": [3.0, 4.5], "Online-Shop / E-Commerce": [2.5, 4.5], "Restaurant / Gastronomie": [1.5, 3.0],
  "Elektro- / SHK-Handwerk": [3.0, 5.0], "IT-Dienstleister / Agentur": [4.0, 7.0], "Hotel / Pension": [3.5, 6.0],
  "Reinigungsfirma": [2.5, 4.0], "Logistik / Spedition": [3.0, 5.0], "Produktion / Maschinenbau": [4.0, 6.5],
};
const REGIONEN: Record<string, number> = {
  "Bayern": 1.05, "Baden-Württemberg": 1.05, "Hamburg": 1.05, "Berlin": 1.0, "Hessen": 1.02, "Nordrhein-Westfalen": 1.0,
  "Niedersachsen": 0.98, "Rheinland-Pfalz": 0.98, "Sachsen": 0.95, "Schleswig-Holstein": 0.97, "Brandenburg": 0.95,
  "Thüringen": 0.93, "Sachsen-Anhalt": 0.93, "Mecklenburg-Vorpommern": 0.92, "Saarland": 0.96, "Bremen": 0.99,
};

export default function Rechner({ initialBranche, initialRegion, hideHero = false }: { initialBranche?: string; initialRegion?: string; hideHero?: boolean } = {}) {
  const [branche, setBranche] = useState(initialBranche && BRANCHEN[initialBranche] ? initialBranche : "Pflegedienst");
  const [region, setRegion] = useState(initialRegion && REGIONEN[initialRegion] ? initialRegion : "Bayern");
  const [ebitda, setEbitda] = useState(160000);
  const [growth, setGrowth] = useState(8);
  const [disp, setDisp] = useState<[number, number]>([640000, 960000]);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const dispRef = useRef<[number, number]>([640000, 960000]);
  const rafRef = useRef<number>(0);

  const [m1, m2] = BRANCHEN[branche];
  const rf = REGIONEN[region];
  const gf = 1 + (growth / 100) * 0.6;
  const targetLo = Math.max(0, ebitda * m1 * rf);
  const targetHi = Math.max(0, ebitda * m2 * rf * gf);
  const short = branche.split(" ")[0].replace("/", "");
  const brancheSlug = PSEO_BRANCHEN.find((b) => b.calc === branche)?.slug;

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    const from: [number, number] = [dispRef.current[0], dispRef.current[1]];
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 650);
      const e = 1 - Math.pow(1 - p, 3);
      const lo = from[0] + (targetLo - from[0]) * e;
      const hi = from[1] + (targetHi - from[1]) * e;
      dispRef.current = [lo, hi];
      setDisp([lo, hi]);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetLo, targetHi]);

  const fmt = (n: number) => "€" + Math.round(n).toLocaleString("de-DE");

  return (
    <div className="uw">
      {!hideHero && (
      <header className="uw-hero">
        <div className="uw-wrap">
          <div className="uw-eyebrow">UNTERNEHMENSBEWERTUNG · KOSTENLOS</div>
          <h1 className="uw-h1">Was ist Ihr {short} wert?</h1>
          <p className="uw-lead">
            Branche und Region wählen, Gewinn eingeben — und sofort sehen, was Ihr Unternehmen wert ist.
            Anonym, kostenlos, ohne Makler.
          </p>
          <div className="uw-pills">
            <span className="uw-pill">0 % Provision</span>
            <span className="uw-pill">Anonym</span>
            <span className="uw-pill">In 60 Sekunden</span>
          </div>
        </div>
      </header>
      )}

      <section className="uw-wrap uw-grid">
        {/* Inputs */}
        <div className="uw-card">
          <div className="uw-step">Ihre Angaben</div>
          <label className="uw-l">Branche</label>
          <select className="uw-in" value={branche} onChange={(e) => setBranche(e.target.value)}>
            {Object.keys(BRANCHEN).map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <label className="uw-l">Region (Bundesland)</label>
          <select className="uw-in" value={region} onChange={(e) => setRegion(e.target.value)}>
            {Object.keys(REGIONEN).map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <label className="uw-l">Gewinn / EBITDA pro Jahr (€)</label>
          <input className="uw-in" type="number" min={0} step={10000} value={ebitda} onChange={(e) => setEbitda(+e.target.value)} />
          <label className="uw-l uw-slabel"><span>Jährliches Wachstum</span><span className="uw-sval">{growth}%</span></label>
          <input className="uw-range" type="range" min={0} max={30} value={growth} onChange={(e) => setGrowth(+e.target.value)} />
          <p className="uw-disc">Indikative Schätzung auf Basis branchenüblicher EBITDA-Multiplikatoren (DACH). Keine verbindliche Wertermittlung oder Finanzberatung.</p>
        </div>

        {/* Result + conversion */}
        <div className="uw-side">
          <div className="uw-result">
            <div className="uw-rlabel">Geschätzter Unternehmenswert</div>
            <div className="uw-rval">{fmt(disp[0])} – {fmt(disp[1])}</div>
            <div className="uw-rsub">{branche} · ~{m1.toLocaleString("de-DE")}–{m2.toLocaleString("de-DE")}× EBITDA · {region}</div>

            <div className="uw-divider" />

            {!sent ? (
              <>
                <div className="uw-ecaption">Detaillierte Bewertung per E-Mail erhalten:</div>
                <form className="uw-emailrow" onSubmit={(e) => {
                  e.preventDefault();
                  if (!email.includes("@")) return;
                  setSent(true);
                  fetch("/api/valuation-lead", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, branche, region, ebitda, growth, valueLow: targetLo, valueHigh: targetHi }),
                  }).catch(() => {});
                }}>
                  <input className="uw-email" type="email" required placeholder="Ihre E-Mail-Adresse" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <button className="uw-emailbtn" type="submit">Senden</button>
                </form>
              </>
            ) : (
              <p className="uw-thanks">✓ Wir senden Ihre Bewertung an {email}.</p>
            )}
          </div>

          <Link href="/sell" className="uw-cta">Käufer finden — Unternehmen vertraulich einreichen →</Link>
          <p className="uw-trustline">Geprüfte Käufer: Private Equity · Family Offices · Search Funds · 0 % Provision</p>
        </div>
      </section>

      <section className="uw-wrap uw-how">
        <h2 className="uw-h2">So funktioniert die Bewertung</h2>
        <div className="uw-steps">
          {[
            ["1", "Branche & Region", "Wir hinterlegen branchenübliche Multiplikatoren für 15 Branchen in allen 16 Bundesländern — eine Steuerkanzlei wird anders bewertet als eine Bäckerei."],
            ["2", "Gewinn eingeben", "Ihr Jahresgewinn (EBITDA) genügt für eine erste Einschätzung — Sie sehen sofort eine indikative Wertspanne."],
            ["3", "Käufer finden", "Passt der Wert? Reichen Sie Ihr Unternehmen anonym ein und werden Sie mit geprüften Käufern gematcht — 0 % Provision, einmalig €87."],
          ].map(([n, t, d]) => (
            <div className="uw-stepcard" key={n}>
              <div className="uw-num">{n}</div>
              <div>
                <p className="uw-st">{t}</p>
                <p className="uw-sd">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="uw-wrap uw-seo">
        <h3 className="uw-seoh">{short} verkaufen — nach Bundesland</h3>
        <div className="uw-chips">
          {PSEO_REGIONEN.map((r) =>
            brancheSlug ? (
              <Link className="uw-chip" key={r.slug} href={`/unternehmenswert/${brancheSlug}/${r.slug}`}>{short} verkaufen {r.name}</Link>
            ) : (
              <span className="uw-chip" key={r.slug}>{short} verkaufen {r.name}</span>
            )
          )}
        </div>
        <h3 className="uw-seoh" style={{ marginTop: 22 }}>Unternehmenswert nach Branche</h3>
        <div className="uw-chips">
          {PSEO_BRANCHEN.map((b) => (
            <Link className="uw-chip" key={b.slug} href={`/unternehmenswert/${b.slug}/bayern`}>{b.label} bewerten</Link>
          ))}
        </div>
      </section>

      <style jsx>{`
        .uw{background:#f3efe7;color:#15281e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}
        .uw-wrap{max-width:1040px;margin:0 auto;padding:0 20px}
        .uw-hero{background:#1a3329;color:#fff;padding:48px 0 64px}
        .uw-eyebrow{font-size:13px;font-weight:700;letter-spacing:2.5px;color:#8fcfb0;margin-bottom:14px}
        .uw-h1{font-size:clamp(30px,5vw,52px);font-weight:700;letter-spacing:-1px;line-height:1.05;max-width:780px;margin:0}
        .uw-lead{font-size:18px;color:#cfe3d7;margin-top:16px;max-width:560px;line-height:1.6}
        .uw-pills{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
        .uw-pill{border:1px solid #3f6e54;color:#cfe3d7;border-radius:18px;padding:6px 14px;font-size:13px;font-weight:500}
        .uw-grid{display:grid;grid-template-columns:1.05fr 1fr;gap:24px;margin-top:-34px;margin-bottom:20px;align-items:start}
        .uw-card,.uw-result{border-radius:18px}
        .uw-card{background:#fff;border:1px solid #e3e0d6;padding:26px}
        .uw-step{font-size:12px;font-weight:700;letter-spacing:1.5px;color:#2d5a3d;text-transform:uppercase}
        .uw-l{display:block;font-size:14px;font-weight:600;margin:18px 0 7px}
        .uw-in{width:100%;height:50px;border:1.5px solid #e3e0d6;border-radius:11px;padding:0 14px;font-family:inherit;font-size:16px;color:#15281e;background:#fff;outline:none}
        .uw-in:focus{border-color:#2d5a3d}
        .uw-slabel{display:flex;justify-content:space-between;align-items:baseline}
        .uw-sval{font-size:15px;font-weight:700;color:#2d5a3d}
        .uw-range{width:100%;accent-color:#2d5a3d;height:30px;cursor:pointer}
        .uw-disc{font-size:12px;color:#6b7d72;margin-top:16px;line-height:1.5}
        .uw-side{display:flex;flex-direction:column;gap:14px}
        .uw-result{background:#1a3329;color:#fff;padding:28px}
        .uw-rlabel{font-size:13px;letter-spacing:1.5px;color:#8fcfb0;font-weight:700;text-transform:uppercase}
        .uw-rval{font-size:clamp(30px,5vw,44px);font-weight:700;letter-spacing:-1px;margin:10px 0 4px;line-height:1.05}
        .uw-rsub{font-size:14px;color:#cfe3d7}
        .uw-divider{height:1px;background:#2f5a44;margin:22px 0 18px}
        .uw-ecaption{font-size:14px;color:#cfe3d7;margin-bottom:10px;font-weight:500}
        .uw-emailrow{display:flex;gap:8px}
        .uw-email{flex:1;height:50px;border:1px solid #3f6e54;background:#11241a;border-radius:11px;padding:0 14px;color:#fff;font-family:inherit;font-size:15px;outline:none}
        .uw-email:focus{border-color:#7fc6a3}
        .uw-emailbtn{height:50px;padding:0 22px;background:#f3ece0;color:#15281e;border:none;border-radius:11px;font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;white-space:nowrap}
        .uw-thanks{font-size:15px;color:#bfe0cd;font-weight:600;margin:0}
        .uw-cta{display:block;text-align:center;background:#f3ece0;color:#15281e;border-radius:12px;padding:16px;font-size:16px;font-weight:700;text-decoration:none;border:1px solid #e3d9c6}
        .uw-trustline{font-size:12.5px;color:#6b7d72;text-align:center;margin:0}
        .uw-how{margin-top:40px}
        .uw-h2{font-size:24px;font-weight:700;letter-spacing:-.5px;margin-bottom:18px}
        .uw-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .uw-stepcard{display:flex;gap:14px;background:#fff;border:1px solid #e3e0d6;border-radius:14px;padding:20px}
        .uw-num{flex-shrink:0;width:34px;height:34px;border-radius:50%;background:#1a3329;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}
        .uw-st{font-size:16px;font-weight:700;margin:0 0 6px}
        .uw-sd{font-size:14px;color:#52635a;line-height:1.6;margin:0}
        .uw-seo{margin-top:40px;padding-bottom:64px}
        .uw-seoh{font-size:15px;margin-bottom:12px}
        .uw-chips{display:flex;flex-wrap:wrap;gap:8px}
        .uw-chip{background:#fff;border:1px solid #e3e0d6;border-radius:18px;padding:7px 13px;font-size:13px;color:#2d5a3d;font-weight:600;text-decoration:none;display:inline-block}
        .uw-chip:hover{border-color:#2d5a3d;background:#f5faf7}
        @media(max-width:820px){.uw-grid{grid-template-columns:1fr;margin-top:-24px}.uw-steps{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}
