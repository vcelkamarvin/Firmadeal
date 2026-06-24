"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

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
const CITIES: { name: string; x: number; y: number }[] = [
  { name: "Hamburg", x: 96, y: 90 }, { name: "Berlin", x: 172, y: 110 }, { name: "Köln", x: 74, y: 162 },
  { name: "Frankfurt", x: 104, y: 182 }, { name: "Leipzig", x: 158, y: 150 }, { name: "Stuttgart", x: 110, y: 214 },
  { name: "München", x: 150, y: 252 },
];
const GERMANY = "M126,26 C112,38 116,52 102,56 C86,61 74,56 72,72 C70,90 90,96 82,114 C75,130 56,128 60,150 C63,170 86,170 88,190 C90,210 70,216 82,236 C93,254 118,246 128,266 C137,282 154,288 160,272 C166,256 150,246 164,232 C180,216 200,224 198,202 C196,182 178,182 186,162 C193,144 214,144 208,122 C203,104 182,108 186,90 C190,74 208,72 200,56 C193,42 172,50 162,40 C150,30 140,20 126,26 Z";

export default function Rechner() {
  const [branche, setBranche] = useState("Pflegedienst");
  const [region, setRegion] = useState("Bayern");
  const [umsatz, setUmsatz] = useState(800000);
  const [ebitda, setEbitda] = useState(160000);
  const [growth, setGrowth] = useState(8);
  const [disp, setDisp] = useState<[number, number]>([640000, 960000]);
  const [scan, setScan] = useState("Analysiere Nachfrage …");
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

  useEffect(() => {
    const msgs = [
      `Analysiere Käufer-Nachfrage in ${region} …`,
      `Prüfe Wettbewerber in Ihrer Region …`,
      `Vergleiche Branchen-Multiplikatoren …`,
      `Gleiche mit dem Käufer-Netzwerk ab …`,
    ];
    let i = 0;
    setScan(msgs[0]);
    const id = setInterval(() => { i = (i + 1) % msgs.length; setScan(msgs[i]); }, 1700);
    return () => clearInterval(id);
  }, [region]);

  const fmt = (n: number) => "€" + Math.round(n).toLocaleString("de-DE");
  const fmtk = (n: number) => "€" + Math.round(n / 1000).toLocaleString("de-DE") + "k";

  return (
    <div className="uw">
      <header className="uw-hero">
        <div className="uw-wrap">
          <div className="uw-eyebrow">UNTERNEHMENSBEWERTUNG · KOSTENLOS · DE · AT · CH</div>
          <h1 className="uw-h1">Was ist Ihr {short} wert?</h1>
          <p className="uw-lead">
            Wählen Sie Branche und Region, geben Sie zwei Zahlen ein — und sehen Sie in Sekunden eine
            indikative Bewertung. Live abgeglichen mit der Käufer-Nachfrage und dem Wettbewerb in Ihrer Region.
            Anonym, kostenlos, ohne Makler.
          </p>
          <div className="uw-pills">
            <span className="uw-pill">0% Provision</span>
            <span className="uw-pill">Anonym</span>
            <span className="uw-pill">Einmalig €87 zum Inserieren</span>
          </div>
        </div>
      </header>

      <section className="uw-wrap uw-grid">
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
          <div className="uw-row">
            <div>
              <label className="uw-l">Jahresumsatz (€)</label>
              <input className="uw-in" type="number" min={0} step={10000} value={umsatz} onChange={(e) => setUmsatz(+e.target.value)} />
            </div>
            <div>
              <label className="uw-l">Gewinn / EBITDA (€)</label>
              <input className="uw-in" type="number" min={0} step={10000} value={ebitda} onChange={(e) => setEbitda(+e.target.value)} />
            </div>
          </div>
          <label className="uw-l uw-slabel"><span>Jährliches Wachstum</span><span className="uw-sval">{growth}%</span></label>
          <input className="uw-range" type="range" min={0} max={30} value={growth} onChange={(e) => setGrowth(+e.target.value)} />
          <p className="uw-disc">Indikative Schätzung auf Basis branchenüblicher EBITDA-Multiplikatoren (DACH). Keine verbindliche Wertermittlung oder Finanzberatung.</p>
        </div>

        <div className="uw-side">
          <div className="uw-result">
            <div className="uw-rlabel">Geschätzter Unternehmenswert</div>
            <div className="uw-rval">{fmt(disp[0])} – {fmt(disp[1])}</div>
            <div className="uw-rsub">{branche} · ~{m1.toLocaleString("de-DE")}–{m2.toLocaleString("de-DE")}× EBITDA</div>
            <div className="uw-meta">
              <span className="uw-mtag">Multiple {m1.toLocaleString("de-DE")}–{m2.toLocaleString("de-DE")}×</span>
              <span className="uw-mtag">{region}</span>
              <span className="uw-mtag">Wachstum +{growth}%</span>
            </div>
          </div>

          <div className="uw-map">
            <div className="uw-maptop"><span className="uw-dot" /> {scan}</div>
            <div className="uw-mapwrap">
              <svg viewBox="0 0 260 300" className="uw-svg" aria-label="Karte von Deutschland — Nachfrage-Analyse">
                <path d={GERMANY} className="uw-de" />
                {CITIES.map((c, i) => (
                  <g key={c.name}>
                    <circle cx={c.x} cy={c.y} r="9" className="uw-ping" style={{ animationDelay: `${i * 0.5}s` }} />
                    <circle cx={c.x} cy={c.y} r="3.5" className="uw-city" />
                  </g>
                ))}
              </svg>
              <div className="uw-scanline" />
            </div>
            <div className="uw-mapbot">
              <span><b style={{ color: "#bfe0cd" }}>Nachfrage:</b> hoch in {region}</span>
              <span><b style={{ color: "#bfe0cd" }}>Käufer-Netzwerk:</b> PE · Family Offices · Search Funds</span>
            </div>
          </div>

          <Link href="/sell" className="uw-cta">Käufer finden — vertraulich einreichen →</Link>

          {!sent ? (
            <form className="uw-emailrow" onSubmit={(e) => { e.preventDefault(); if (email.includes("@")) setSent(true); }}>
              <input className="uw-email" type="email" required placeholder="E-Mail für Ihre Bewertung" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="uw-emailbtn" type="submit">Senden</button>
            </form>
          ) : (
            <p className="uw-thanks">✓ Wir senden Ihre Bewertung an {email}.</p>
          )}
        </div>
      </section>

      <section className="uw-wrap uw-how">
        <h2 className="uw-h2">So funktioniert die Bewertung</h2>
        <div className="uw-steps">
          {[
            ["1", "Branche & Region", "Wir hinterlegen die branchenüblichen Multiplikatoren für über 15 Branchen in allen 16 Bundesländern — denn eine Steuerkanzlei wird anders bewertet als eine Bäckerei, und Bayern anders als Brandenburg."],
            ["2", "Zwei Zahlen", "Umsatz und Gewinn (EBITDA) genügen für eine erste Einschätzung. Profis bewerten Unternehmen über das Ertragswert- bzw. Multiplikator-Verfahren — genau das rechnen wir hier in Sekunden."],
            ["3", "Nachfrage & Wettbewerb", "Wir gleichen Ihre Branche live mit der aktuellen Käufer-Nachfrage und dem Wettbewerb in Ihrer Region ab — so sehen Sie nicht nur den Wert, sondern auch, wie gefragt Ihr Betrieb gerade ist."],
            ["4", "Käufer finden", "Passt der Wert? Reichen Sie Ihr Unternehmen anonym ein. Wir matchen Sie direkt mit geprüften Käufern aus unserem Netzwerk — 0% Provision, kein Makler, einmalig €87."],
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
        <h3 className="uw-seoh">{short} verkaufen — nach Region</h3>
        <div className="uw-chips">
          {Object.keys(REGIONEN).map((reg) => (
            <span className="uw-chip" key={reg}>{short} verkaufen {reg}</span>
          ))}
        </div>
      </section>

      <style jsx>{`
        .uw{background:#f3efe7;color:#15281e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}
        .uw-wrap{max-width:1040px;margin:0 auto;padding:0 20px}
        .uw-hero{background:#1a3329;color:#fff;padding:48px 0 64px}
        .uw-eyebrow{font-size:13px;font-weight:700;letter-spacing:2.5px;color:#8fcfb0;margin-bottom:14px}
        .uw-h1{font-size:clamp(30px,5vw,52px);font-weight:700;letter-spacing:-1px;line-height:1.05;max-width:780px;margin:0}
        .uw-lead{font-size:18px;color:#cfe3d7;margin-top:16px;max-width:660px;line-height:1.6}
        .uw-pills{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
        .uw-pill{border:1px solid #3f6e54;color:#cfe3d7;border-radius:18px;padding:6px 14px;font-size:13px;font-weight:500}
        .uw-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:24px;margin-top:-34px;margin-bottom:20px;align-items:start}
        .uw-card,.uw-result,.uw-map{border-radius:18px}
        .uw-card{background:#fff;border:1px solid #e3e0d6;padding:26px}
        .uw-step{font-size:12px;font-weight:700;letter-spacing:1.5px;color:#2d5a3d;text-transform:uppercase}
        .uw-l{display:block;font-size:14px;font-weight:600;margin:18px 0 7px}
        .uw-in{width:100%;height:50px;border:1.5px solid #e3e0d6;border-radius:11px;padding:0 14px;font-family:inherit;font-size:16px;color:#15281e;background:#fff;outline:none}
        .uw-in:focus{border-color:#2d5a3d}
        .uw-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .uw-slabel{display:flex;justify-content:space-between;align-items:baseline}
        .uw-sval{font-size:15px;font-weight:700;color:#2d5a3d}
        .uw-range{width:100%;accent-color:#2d5a3d;height:30px;cursor:pointer}
        .uw-disc{font-size:12px;color:#6b7d72;margin-top:16px;line-height:1.5}
        .uw-side{display:flex;flex-direction:column;gap:14px}
        .uw-result{background:#1a3329;color:#fff;padding:26px}
        .uw-rlabel{font-size:13px;letter-spacing:1.5px;color:#8fcfb0;font-weight:700;text-transform:uppercase}
        .uw-rval{font-size:clamp(28px,5vw,42px);font-weight:700;letter-spacing:-1px;margin:10px 0 2px;line-height:1.05}
        .uw-rsub{font-size:14px;color:#cfe3d7}
        .uw-meta{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
        .uw-mtag{background:#11241a;border-radius:8px;padding:5px 10px;font-size:13px;color:#cfe3d7}
        .uw-map{background:#11241a;border:1px solid #244a37;padding:18px}
        .uw-maptop{font-size:13px;color:#8fcfb0;font-weight:600;display:flex;align-items:center;gap:8px}
        .uw-dot{width:8px;height:8px;border-radius:50%;background:#7fc6a3;animation:uwblink 1.2s ease-in-out infinite}
        .uw-mapwrap{position:relative;margin:12px 0;overflow:hidden;border-radius:10px}
        .uw-svg{width:100%;height:auto;display:block}
        .uw-de{fill:#163024;stroke:#3f6e54;stroke-width:1.2;opacity:.9}
        .uw-city{fill:#bfe0cd}
        .uw-ping{fill:none;stroke:#7fc6a3;stroke-width:1.4;transform-origin:center;transform-box:fill-box;animation:uwping 2.6s ease-out infinite}
        .uw-scanline{position:absolute;left:0;right:0;height:60px;top:-60px;background:linear-gradient(to bottom,rgba(127,198,163,0) 0%,rgba(127,198,163,.18) 70%,rgba(127,198,163,.55) 100%);animation:uwscan 3.2s linear infinite}
        .uw-mapbot{display:flex;flex-direction:column;gap:4px;font-size:12.5px;color:#9ec7b1}
        .uw-cta{display:block;text-align:center;background:#f3ece0;color:#15281e;border-radius:12px;padding:16px;font-size:16px;font-weight:700;text-decoration:none}
        .uw-emailrow{display:flex;gap:8px}
        .uw-email{flex:1;height:48px;border:1px solid #3f6e54;background:#11241a;border-radius:10px;padding:0 14px;color:#fff;font-family:inherit;font-size:14px;outline:none}
        .uw-emailbtn{height:48px;padding:0 18px;background:transparent;color:#cfe3d7;border:1px solid #3f6e54;border-radius:10px;font-family:inherit;font-size:14px;font-weight:600;cursor:pointer}
        .uw-thanks{font-size:14px;color:#2d5a3d;font-weight:600}
        .uw-how{margin-top:36px}
        .uw-h2{font-size:24px;font-weight:700;letter-spacing:-.5px;margin-bottom:18px}
        .uw-steps{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .uw-stepcard{display:flex;gap:14px;background:#fff;border:1px solid #e3e0d6;border-radius:14px;padding:20px}
        .uw-num{flex-shrink:0;width:34px;height:34px;border-radius:50%;background:#1a3329;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}
        .uw-st{font-size:16px;font-weight:700;margin:0 0 6px}
        .uw-sd{font-size:14px;color:#52635a;line-height:1.6;margin:0}
        .uw-seo{margin-top:36px;padding-bottom:64px}
        .uw-seoh{font-size:15px;margin-bottom:12px}
        .uw-chips{display:flex;flex-wrap:wrap;gap:8px}
        .uw-chip{background:#fff;border:1px solid #e3e0d6;border-radius:18px;padding:7px 13px;font-size:13px;color:#2d5a3d;font-weight:600}
        @keyframes uwblink{0%,100%{opacity:.3}50%{opacity:1}}
        @keyframes uwping{0%{transform:scale(.4);opacity:.9}70%{opacity:0}100%{transform:scale(2.4);opacity:0}}
        @keyframes uwscan{0%{top:-60px}100%{top:100%}}
        @media(max-width:780px){.uw-grid{grid-template-columns:1fr;margin-top:-24px}.uw-steps{grid-template-columns:1fr}}
      `}</style>
    </div>
  );
}
