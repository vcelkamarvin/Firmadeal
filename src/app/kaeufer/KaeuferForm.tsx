"use client";

import { useState } from "react";

const BRANCHEN = [
  "Pflegedienst", "Arztpraxis", "Steuerkanzlei", "KFZ-Werkstatt", "Bäckerei / Café",
  "Friseursalon", "Physiotherapie", "Online-Shop / E-Commerce", "Restaurant / Gastronomie",
  "Elektro- / SHK-Handwerk", "IT-Dienstleister / Agentur", "Hotel / Pension",
  "Reinigungsfirma", "Logistik / Spedition", "Produktion / Maschinenbau",
];
const REGIONEN = [
  "Ganz Deutschland", "Bayern", "Baden-Württemberg", "Nordrhein-Westfalen", "Hessen",
  "Berlin", "Hamburg", "Niedersachsen", "Sachsen", "Österreich", "Schweiz",
];
const BUYER_TYPES = ["Private Equity", "Family Office", "Search Fund / ETA", "Strategischer Käufer", "MBI / MBO", "Privatinvestor"];
const BUDGETS: Record<string, [number, number]> = {
  "bis €250.000": [0, 250000], "€250.000 – €1 Mio.": [250000, 1000000],
  "€1 – 5 Mio.": [1000000, 5000000], "über €5 Mio.": [5000000, 0],
};

export default function KaeuferForm() {
  const [buyerType, setBuyerType] = useState("Private Equity");
  const [branchen, setBranchen] = useState<string[]>(["Pflegedienst"]);
  const [regionen, setRegionen] = useState<string[]>(["Ganz Deutschland"]);
  const [budget, setBudget] = useState("€250.000 – €1 Mio.");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) return;
    setSent(true);
    const [budget_min, budget_max] = BUDGETS[budget] ?? [null, null];
    fetch("/api/buyer-lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, buyerType, branchen, regionen, budgetMin: budget_min, budgetMax: budget_max, note }),
    }).catch(() => {});
  };

  return (
    <div className="kf">
      <header className="kf-hero">
        <div className="kf-wrap">
          <div className="kf-eyebrow">PRIVATES KÄUFER-NETZWERK · KOSTENLOS</div>
          <h1 className="kf-h1">Erhalten Sie passende Unternehmen — zuerst.</h1>
          <p className="kf-lead">
            Sagen Sie uns, wonach Sie suchen, und wir matchen Sie mit geprüften, oft off-market
            angebotenen Unternehmen im DACH-Raum — bevor sie öffentlich werden. Kostenlos, diskret,
            ohne Makler-Provision.
          </p>
          <div className="kf-pills">
            <span className="kf-pill">Off-market Zugang</span>
            <span className="kf-pill">Diskret</span>
            <span className="kf-pill">Kostenlos für Käufer</span>
          </div>
        </div>
      </header>

      <section className="kf-wrap kf-panel">
        {!sent ? (
          <form className="kf-card" onSubmit={submit}>
            <label className="kf-l">Ich bin …</label>
            <select className="kf-in" value={buyerType} onChange={(e) => setBuyerType(e.target.value)}>
              {BUYER_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>

            <label className="kf-l">Welche Branchen suchen Sie? <span className="kf-hint">(Mehrfachauswahl)</span></label>
            <div className="kf-chips">
              {BRANCHEN.map((b) => (
                <button type="button" key={b} className={"kf-chip" + (branchen.includes(b) ? " on" : "")} onClick={() => toggle(branchen, setBranchen, b)}>{b}</button>
              ))}
            </div>

            <label className="kf-l">Regionen</label>
            <div className="kf-chips">
              {REGIONEN.map((r) => (
                <button type="button" key={r} className={"kf-chip" + (regionen.includes(r) ? " on" : "")} onClick={() => toggle(regionen, setRegionen, r)}>{r}</button>
              ))}
            </div>

            <label className="kf-l">Budget / Ticketgröße</label>
            <select className="kf-in" value={budget} onChange={(e) => setBudget(e.target.value)}>
              {Object.keys(BUDGETS).map((b) => <option key={b} value={b}>{b}</option>)}
            </select>

            <div className="kf-row">
              <div><label className="kf-l">Name</label><input className="kf-in" value={name} onChange={(e) => setName(e.target.value)} placeholder="Vor- und Nachname" /></div>
              <div><label className="kf-l">E-Mail *</label><input className="kf-in" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@firma.de" /></div>
            </div>

            <label className="kf-l">Worauf achten Sie? <span className="kf-hint">(optional)</span></label>
            <textarea className="kf-in kf-ta" value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. wiederkehrende Umsätze, Standort, Nachfolgeregelung …" />

            <button className="kf-cta" type="submit">Kostenlos ins Käufer-Netzwerk →</button>
            <p className="kf-disc">Kostenlos & unverbindlich. Wir melden uns nur mit passenden Unternehmen.</p>
          </form>
        ) : (
          <div className="kf-card kf-done">
            <div className="kf-check">✓</div>
            <h2 className="kf-h2">Willkommen im Käufer-Netzwerk.</h2>
            <p className="kf-done-p">
              Wir haben Ihre Suchkriterien gespeichert und senden eine Bestätigung an <b>{email}</b>.
              Sobald ein passendes Unternehmen verfügbar ist, melden wir uns — diskret und zuerst bei Ihnen.
            </p>
          </div>
        )}

        <div className="kf-side">
          {[
            ["Zuerst & off-market", "Die meisten Mandate laufen off-market. Als Teil des Netzwerks sehen Sie passende Unternehmen, bevor sie öffentlich werden — oder ganz ohne öffentliche Listung."],
            ["Geprüft & vorqualifiziert", "Wir matchen nach Branche, Region und Ticketgröße. Sie erhalten relevante Unternehmen statt endloser Inserate."],
            ["Diskret & ohne Provision", "Anonyme Profile, direkter Kontakt nach beidseitiger Freigabe. Für Käufer kostenlos, 0% Provision."],
          ].map(([t, d]) => (
            <div className="kf-feat" key={t}>
              <p className="kf-ft">{t}</p>
              <p className="kf-fd">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{`
        .kf{background:#f3efe7;color:#15281e;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}
        .kf-wrap{max-width:1040px;margin:0 auto;padding:0 20px}
        .kf-hero{background:#1a3329;color:#fff;padding:48px 0 60px}
        .kf-eyebrow{font-size:13px;font-weight:700;letter-spacing:2.5px;color:#8fcfb0;margin-bottom:14px}
        .kf-h1{font-size:clamp(28px,5vw,48px);font-weight:700;letter-spacing:-1px;line-height:1.06;max-width:780px;margin:0}
        .kf-lead{font-size:18px;color:#cfe3d7;margin-top:16px;max-width:680px;line-height:1.6}
        .kf-pills{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
        .kf-pill{border:1px solid #3f6e54;color:#cfe3d7;border-radius:18px;padding:6px 14px;font-size:13px;font-weight:500}
        .kf-panel{display:grid;grid-template-columns:1.3fr 1fr;gap:24px;margin-top:-32px;margin-bottom:56px;align-items:start}
        .kf-card{background:#fff;border:1px solid #e3e0d6;border-radius:18px;padding:26px}
        .kf-l{display:block;font-size:14px;font-weight:600;margin:18px 0 8px}
        .kf-l:first-child{margin-top:0}
        .kf-hint{font-weight:400;color:#8a9991}
        .kf-in{width:100%;height:50px;border:1.5px solid #e3e0d6;border-radius:11px;padding:0 14px;font-family:inherit;font-size:16px;color:#15281e;background:#fff;outline:none}
        .kf-in:focus{border-color:#2d5a3d}
        .kf-ta{height:84px;padding:12px 14px;resize:vertical}
        .kf-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .kf-chips{display:flex;flex-wrap:wrap;gap:8px}
        .kf-chip{background:#fff;border:1.5px solid #e3e0d6;border-radius:18px;padding:8px 13px;font-size:13px;color:#46564d;font-weight:600;cursor:pointer;font-family:inherit;transition:all .12s}
        .kf-chip.on{background:#1a3329;border-color:#1a3329;color:#fff}
        .kf-cta{display:block;width:100%;text-align:center;background:#16a34a;color:#fff;border:none;border-radius:12px;padding:17px;font-family:inherit;font-size:16px;font-weight:700;margin-top:24px;cursor:pointer;box-shadow:0 8px 22px -8px rgba(22,163,74,.55);transition:transform .15s ease,background .18s ease}
        .kf-cta:hover{background:#128a3e;transform:translateY(-1px)}
        .kf-cta:active{transform:translateY(1px)}
        .kf-disc{font-size:12px;color:#6b7d72;margin-top:12px;text-align:center}
        .kf-done{text-align:center;padding:48px 26px}
        .kf-check{width:54px;height:54px;border-radius:50%;background:#e7f1ea;color:#2d5a3d;font-size:26px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
        .kf-h2{font-size:22px;font-weight:700;margin:0 0 10px}
        .kf-done-p{font-size:15px;color:#52635a;line-height:1.6;max-width:440px;margin:0 auto}
        .kf-side{display:flex;flex-direction:column;gap:14px}
        .kf-feat{background:#fff;border:1px solid #e3e0d6;border-radius:14px;padding:20px}
        .kf-ft{font-size:15px;font-weight:700;margin:0 0 6px}
        .kf-fd{font-size:14px;color:#52635a;line-height:1.6;margin:0}
        @media(max-width:820px){.kf-panel{grid-template-columns:1fr;margin-top:-22px}}
      `}</style>
    </div>
  );
}
