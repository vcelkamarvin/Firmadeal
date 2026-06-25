"use client";

import { useState } from "react";
import Link from "next/link";

/* Firmadeal — Pricing (redesign). Navbar/Footer/SEO from layout.tsx.
   Newsletter API call and /sell CTA preserved exactly. */

const BUYERS: { label: string; sub: string }[] = [
  { label: "Private Equity & Family Offices", sub: "Kapitalstarke Investoren" },
  { label: "Unternehmer & MBI-Kandidaten", sub: "Operative Nachfolger" },
  { label: "Search Funds & ETA", sub: "Suchende Übernehmer" },
  { label: "Strategische Käufer", sub: "Add-on & Buy-and-build" },
];

const FEATURES: string[] = [
  "Aufnahme in unser privates Investoren-Netzwerk",
  "Gezielte Ansprache passender Käufer (PE, Family Offices, Search Funds, Strategen)",
  "Optional: kuratierte öffentliche Listung für mehr Reichweite",
  "Anonymes Profil — Ihre Daten bleiben geschützt",
  "Automatische Unternehmensbewertung",
  "0 % Provision auf den Verkaufspreis",
];

const FAQ: { q: string; a: string }[] = [
  { q: "Wie funktioniert das Käufer-Matching genau?", a: "Unser Team analysiert Branche, Standort und Unternehmensgröße und spricht passende Käufer aus unserem privaten Netzwerk direkt an." },
  { q: "Bleibt mein Inserat vollständig anonym?", a: "Ja. Ihr Name, Ihre Kontaktdaten und alle Unternehmensinformationen bleiben bis zu Ihrer ausdrücklichen Freigabe vollständig geschützt." },
  { q: "Gibt es ein Abo oder versteckte Kosten?", a: "Nein. Sie zahlen einmalig 87 € — kein Abo, keine Verlängerung, keine Provision auf den Verkaufspreis." },
  { q: "Warum sehe ich nur wenige öffentliche Inserate?", a: "Die meisten Mandate sind vertraulich und werden nicht öffentlich gezeigt — das schützt Verkäufer und Mitarbeiter. Öffentlich erscheint nur eine kuratierte Auswahl." },
];

function CheckIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>);
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState("");
  const [newsletterState, setNewsletter] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletter("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 409) { setNewsletter("duplicate"); return; }
      if (!res.ok) { setNewsletter("error"); return; }
      setNewsletter("success");
      setEmail("");
    } catch { setNewsletter("error"); }
  };

  return (
    <>
      <style>{cssString}</style>
      <div className="fp">

        {/* HEADER */}
        <section className="fp-hero">
          <div className="fp-wrap" style={{ textAlign: "center" }}>
            <span className="fp-eyebrow">Preise · Transparent</span>
            <h1 className="fp-h1">Vertrauliche Einreichung — <em>einmalig 87 €</em></h1>
            <p className="fp-sub">Eine Einmalzahlung. 0 % Provision auf den Verkaufspreis, kein Abo, anonym bis zum Abschluss.</p>
            <div className="fp-pills">
              <span className="fp-pill"><CheckIcon /> 0 % Provision</span>
              <span className="fp-pill"><CheckIcon /> Kein Abo</span>
              <span className="fp-pill"><CheckIcon /> Anonym bis zum Abschluss</span>
            </div>
          </div>
        </section>

        {/* PRICING + SIDEBAR */}
        <section className="fp-wrap fp-grid">
          <div className="fp-card">
            <span className="fp-card-label">Vertrauliche Einreichung</span>
            <div className="fp-price"><span className="fp-amount">87 €</span><span className="fp-once">einmalig</span></div>
            <p className="fp-price-note">Einmalzahlung · Kein Abo · Keine versteckten Kosten</p>
            <div className="fp-tags">
              {["Gezielte Käufer-Ansprache", "Privates Netzwerk", "0 % Provision"].map((p) => (
                <span key={p} className="fp-tag">{p}</span>
              ))}
            </div>
            <ul className="fp-features">
              {FEATURES.map((f) => (
                <li key={f}><span className="fp-check"><CheckIcon /></span>{f}</li>
              ))}
            </ul>
            <Link href="/sell" className="fp-cta">Unternehmen vertraulich einreichen →</Link>
          </div>

          <aside className="fp-side">
            <div className="fp-side-box">
              <h3 className="fp-side-h">Wer kauft auf Firmadeal?</h3>
              <p className="fp-side-p">Wir gleichen Ihr Profil gezielt ab.</p>
              <div className="fp-buyers">
                {BUYERS.map((b) => (
                  <div key={b.label} className="fp-buyer">
                    <span className="fp-buyer-dot" />
                    <div>
                      <div className="fp-buyer-l">{b.label}</div>
                      <div className="fp-buyer-s">{b.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="fp-side-box fp-side-trust">
              <p>Diskret, ohne Makler und ohne Provision — wir bringen Ihr Unternehmen gezielt vor passende Käufer.</p>
            </div>
          </aside>
        </section>

        {/* FAQ */}
        <section className="fp-surface">
          <div className="fp-wrap fp-faq-wrap">
            <h2 className="fp-h2">Häufige Fragen</h2>
            <div className="fp-faq">
              {FAQ.map((f, i) => (
                <div className={`fp-faq-item${openFaq === i ? " open" : ""}`} key={i}>
                  <button className="fp-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {f.q}<span className="fp-ic">+</span>
                  </button>
                  <div className="fp-faq-a">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NEWSLETTER */}
        <section className="fp-news">
          <div className="fp-wrap" style={{ maxWidth: 600, textAlign: "center" }}>
            <h2 className="fp-news-h">Neue Kaufgesuche direkt in Ihr Postfach</h2>
            <p className="fp-news-p">Wöchentlich passende Käufer für Unternehmen wie Ihres — kostenlos und jederzeit abmeldbar.</p>
            {newsletterState === "success" ? (
              <p className="fp-news-ok">✓ Sie sind angemeldet!</p>
            ) : (
              <form onSubmit={handleNewsletter} className="fp-news-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ihre E-Mail-Adresse"
                  required
                />
                <button type="submit" disabled={newsletterState === "loading"} className="fp-cta">
                  {newsletterState === "loading" ? "Wird gespeichert…" : "Anmelden"}
                </button>
              </form>
            )}
            {newsletterState === "duplicate" && <p className="fp-news-warn">Sie sind bereits angemeldet.</p>}
            {newsletterState === "error" && <p className="fp-news-err">Fehler. Bitte erneut versuchen.</p>}
            <p className="fp-news-foot">firmadeal.de · Sofort live · 0 % Provision · Kein Makler</p>
          </div>
        </section>
      </div>
    </>
  );
}

const cssString = `
.fp{--a:#1a3329;--cta:#16a34a;--cta-h:#128a3e;--g50:#f2faf5;--g100:#e8f5ed;--g400:#6dbf87;--g700:#2d5a3d;--bg:#fafaf8;--ink:#141414;--muted:#777;--n600:#555;--border:#e7e7e3;background:var(--bg);color:var(--ink);}
.fp *{box-sizing:border-box;}
.fp h1,.fp h2,.fp h3{font-weight:700;letter-spacing:-0.035em;line-height:1.05;color:var(--a);margin:0;}
.fp-wrap{max-width:1080px;margin:0 auto;padding:0 28px;}
.fp-eyebrow{font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--cta);}
.fp-hero{padding:54px 0 30px;position:relative;overflow:hidden;}
.fp-hero::before{content:"";position:absolute;top:-160px;left:50%;transform:translateX(-50%);width:620px;height:420px;border-radius:50%;background:radial-gradient(circle,var(--g50),transparent 70%);animation:fp-drift 16s ease-in-out infinite;}
@keyframes fp-drift{0%,100%{transform:translateX(-50%) scale(1);}50%{transform:translateX(-50%) scale(1.08);}}
.fp-h1{font-size:clamp(28px,4vw,46px);margin:14px 0 14px;position:relative;}
.fp-h1 em{font-style:normal;color:var(--cta);}
.fp-sub{font-size:clamp(15px,1.6vw,18px);color:var(--n600);max-width:540px;margin:0 auto 22px;line-height:1.55;}
.fp-pills{display:flex;gap:9px;flex-wrap:wrap;justify-content:center;}
.fp-pill{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1px solid var(--border);border-radius:100px;padding:8px 15px;font-size:13px;font-weight:600;color:var(--a);}
.fp-pill svg{width:14px;height:14px;color:var(--cta);}
.fp-grid{display:grid;grid-template-columns:1fr 340px;gap:22px;align-items:start;padding-top:30px;padding-bottom:60px;}
@media(max-width:880px){.fp-grid{grid-template-columns:1fr;}}
.fp-card{background:#fff;border:2px solid var(--a);border-radius:22px;padding:34px;box-shadow:0 24px 60px -28px rgba(13,31,23,.4);}
.fp-card-label{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);}
.fp-price{display:flex;align-items:baseline;gap:8px;margin:14px 0 4px;}
.fp-amount{font-size:60px;font-weight:700;color:var(--ink);letter-spacing:-0.04em;line-height:1;font-variant-numeric:tabular-nums;}
.fp-once{font-size:15px;color:var(--muted);}
.fp-price-note{font-size:12px;color:var(--muted);margin-bottom:20px;}
.fp-tags{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:22px;}
.fp-tag{font-size:11px;font-weight:700;color:#fff;background:var(--a);padding:6px 12px;border-radius:100px;}
.fp-features{list-style:none;padding:0;margin:0 0 26px;display:flex;flex-direction:column;gap:11px;}
.fp-features li{display:flex;align-items:flex-start;gap:10px;font-size:14px;color:var(--ink);line-height:1.45;}
.fp-check{flex-shrink:0;width:20px;height:20px;border-radius:50%;background:var(--g100);color:var(--g700);display:flex;align-items:center;justify-content:center;margin-top:1px;}
.fp-check svg{width:12px;height:12px;}
.fp-cta{display:block;text-align:center;width:100%;background:var(--cta);color:#fff;font-weight:700;font-size:15px;padding:16px;border-radius:14px;border:none;cursor:pointer;text-decoration:none;position:relative;overflow:hidden;transition:background .18s,transform .15s;}
.fp-cta:hover{background:var(--cta-h);transform:translateY(-1px);}
.fp-cta::after{content:"";position:absolute;top:0;left:0;width:36%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.4),transparent);animation:fp-sheen 5s ease-in-out infinite;pointer-events:none;}
@keyframes fp-sheen{0%{transform:translateX(-160%) skewX(-18deg);}55%,100%{transform:translateX(280%) skewX(-18deg);}}
.fp-side{display:flex;flex-direction:column;gap:16px;}
.fp-side-box{background:#fff;border:1px solid var(--border);border-radius:18px;padding:22px;}
.fp-side-h{font-size:15px;margin-bottom:4px;}
.fp-side-p{font-size:12px;color:var(--muted);margin-bottom:16px;}
.fp-buyers{display:flex;flex-direction:column;gap:14px;}
.fp-buyer{display:flex;align-items:flex-start;gap:11px;}
.fp-buyer-dot{flex-shrink:0;width:9px;height:9px;border-radius:50%;background:var(--cta);margin-top:5px;}
.fp-buyer-l{font-size:13px;font-weight:600;color:var(--ink);line-height:1.3;}
.fp-buyer-s{font-size:11px;color:var(--muted);}
.fp-side-trust p{font-size:13px;color:var(--n600);line-height:1.6;margin:0;}
.fp-surface{background:#fff;border-top:1px solid var(--border);border-bottom:1px solid var(--border);}
.fp-faq-wrap{max-width:760px;padding-top:56px;padding-bottom:56px;}
.fp-h2{font-size:clamp(22px,3vw,32px);text-align:center;margin-bottom:28px;}
.fp-faq-item{border-bottom:1px solid var(--border);}
.fp-faq-q{width:100%;background:none;border:none;text-align:left;padding:20px 0;font-size:16px;font-weight:600;color:var(--a);cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;font-family:inherit;}
.fp-faq-q .fp-ic{font-size:22px;color:var(--cta);transition:.2s;flex-shrink:0;}
.fp-faq-a{font-size:14px;color:var(--n600);line-height:1.6;padding:0 0 20px;display:none;}
.fp-faq-item.open .fp-faq-a{display:block;}
.fp-faq-item.open .fp-ic{transform:rotate(45deg);}
.fp-news{background:linear-gradient(165deg,#1a3329,#0d1f17);padding:54px 0;}
.fp-news-h{color:#fff;font-size:22px;margin-bottom:8px;}
.fp-news-p{color:rgba(255,255,255,.6);font-size:14px;margin-bottom:22px;line-height:1.5;}
.fp-news-form{display:flex;gap:11px;}
@media(max-width:520px){.fp-news-form{flex-direction:column;}}
.fp-news-form input{flex:1;padding:13px 16px;border-radius:12px;border:none;font-size:14px;color:var(--ink);background:#fff;outline:none;min-width:0;}
.fp-news-form .fp-cta{width:auto;padding:13px 24px;white-space:nowrap;border-radius:12px;}
.fp-news-ok{color:#4ade80;font-weight:700;font-size:15px;}
.fp-news-warn{color:#fbbf24;font-size:12px;margin-top:10px;}
.fp-news-err{color:#f87171;font-size:12px;margin-top:10px;}
.fp-news-foot{color:rgba(255,255,255,.35);font-size:11px;margin-top:20px;}
@media(prefers-reduced-motion:reduce){.fp-hero::before,.fp-cta::after{animation:none!important;}}
`;
