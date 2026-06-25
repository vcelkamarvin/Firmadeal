"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

/* ──────────────────────────────────────────────────────────────────────────
   Firmadeal — Homepage (redesign)
   Self-contained client component. Navbar/Footer/SEO metadata come from
   layout.tsx and are intentionally NOT rendered here.
   ────────────────────────────────────────────────────────────────────────── */

const SECTORS: { label: string; m: number }[] = [
  { label: "Branche wählen…", m: 0 },
  { label: "Gastronomie", m: 2.6 },
  { label: "IT & Software", m: 4.6 },
  { label: "Handwerk", m: 3.0 },
  { label: "Gesundheit", m: 4.1 },
  { label: "E-Commerce", m: 3.6 },
  { label: "Produktion", m: 3.8 },
  { label: "Dienstleistungen", m: 3.3 },
];

const LISTINGS: { cat: string; loc: string; title: string; umsatz: string; marge: string; price: string }[] = [
  { cat: "IT & Tech", loc: "Hannover · Niedersachsen", title: "SEO-Agentur mit 18 Retainer-Kunden", umsatz: "620k €", marge: "35 %", price: "825k €" },
  { cat: "Gastronomie", loc: "Hamburg", title: "Etablierter Biergarten mit direkter Wasserlage", umsatz: "920k €", marge: "23 %", price: "480k €" },
  { cat: "Dienstleistungen", loc: "Hannover · Niedersachsen", title: "Unternehmensberatung für KMU mit Industriefokus", umsatz: "850k €", marge: "25 %", price: "680k €" },
  { cat: "Finanzen", loc: "Bielefeld · NRW", title: "Buchhaltungs- & Lohnbüro mit digitaler Struktur", umsatz: "320k €", marge: "30 %", price: "285k €" },
  { cat: "Gesundheit", loc: "Leipzig · Sachsen", title: "Naturkosmetik Leipzig – Bio-zertifiziert", umsatz: "115k €", marge: "18 %", price: "42k €" },
  { cat: "Medien", loc: "Rostock · MV", title: "Werbeagentur und Druckerei in Rostock", umsatz: "650k €", marge: "4 %", price: "95k €" },
];

const STEPS: { n: string; h: string; p: string }[] = [
  { n: "1", h: "Vertraulich einreichen", p: "Eckdaten in wenigen Minuten anonym einreichen. Einmalig 87 € — keine Erfolgsprovision." },
  { n: "2", h: "Wir matchen", p: "Wir sprechen passende Käufer aus unserem Netzwerk gezielt an — Private Equity, Family Offices, Nachfolger." },
  { n: "3", h: "Anonym in Kontakt", p: "Interessenten erreichen Sie direkt — Sie geben Details für jeden einzeln frei." },
  { n: "4", h: "Abschluss", p: "Due Diligence, Vertrag, Übergabe. Vom Kontakt bis zur Unterschrift behalten Sie das Steuer." },
];

const TESTIMONIALS: { quote: string; initials: string; name: string; role: string }[] = [
  { quote: "Innerhalb von zwei Wochen drei ernsthafte Anfragen — ganz ohne Makler und ohne dass mein Firmenname öffentlich wurde.", initials: "MK", name: "Michael K.", role: "Maschinenbau · Bayern" },
  { quote: "Die Anonymität war für mich entscheidend. Meine Mitarbeiter sollten nichts mitbekommen — das hat einwandfrei funktioniert.", initials: "SB", name: "Sabine B.", role: "Dienstleistung · NRW" },
];

const FAQ: { q: string; a: string }[] = [
  { q: "Gibt es eine Provision?", a: "Nein. Firmadeal arbeitet ohne Erfolgsprovision. Sie zahlen einmalig 87 € für das Inserat — kein Makler, keine versteckten Kosten." },
  { q: "Bleibt mein Inserat anonym?", a: "Ja. Wir veröffentlichen weder Firmenname noch Standort, bis Sie es ausdrücklich freigeben. Sie entscheiden für jeden Interessenten einzeln." },
  { q: "Wie lange dauert ein Verkauf?", a: "Das hängt von Branche, Größe und Preisvorstellung ab. Erste qualifizierte Anfragen erreichen viele Inserenten in den ersten Wochen." },
  { q: "Welche Unterlagen brauche ich?", a: "Fürs Inserat genügen Eckdaten wie Branche, Region, Umsatz und EBITDA. Detaillierte Unterlagen teilen Sie erst nach einer NDA." },
  { q: "Warum sehe ich nur wenige öffentliche Inserate?", a: "Die meisten Mandate laufen vertraulich off-market und werden gezielt passenden Käufern vorgestellt — nicht öffentlich ausgeschrieben." },
];

const fmt = (n: number) => new Intl.NumberFormat("de-DE").format(Math.round(n));

export default function Home() {
  const [sector, setSector] = useState<number>(0);
  const [ebitda, setEbitda] = useState<number>(120000);
  const [openFaq, setOpenFaq] = useState<number>(0);

  const m = SECTORS[sector].m;
  const result = m
    ? `${fmt((ebitda * (m - 0.5)) / 1000)}k – ${fmt((ebitda * (m + 0.5)) / 1000)}k €`
    : "Branche wählen";

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".fd-reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("fd-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("fd-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <style>{cssString}</style>

      <div className="fd-home">
        {/* HERO */}
        <header className="fd-hero">
          <div className="fd-wrap fd-hero-grid">
            <div className="fd-reveal">
              <span className="fd-eyebrow">Diskret · Direkt · 0 % Provision</span>
              <h1 className="fd-h1">
                Unternehmen verkaufen ohne Makler — <em>diskret und direkt.</em>
              </h1>
              <p className="fd-sub">
                Wir stellen Ihr Unternehmen vertraulich geprüften Käufern aus unserem
                DACH-Netzwerk vor. Sie bleiben anonym, bis Sie selbst entscheiden. Keine
                Erfolgsprovision.
              </p>
              <div className="fd-cta-row">
                <Link href="/sell" className="fd-btn fd-btn-cta">Unternehmen einreichen →</Link>
                <Link href="/listings" className="fd-btn fd-btn-ghost">Angebote ansehen</Link>
              </div>
              <div className="fd-hero-trust">
                <div className="fd-gbadge" title="Platzhalter — nur mit echten Google-Zahlen verwenden">
                  <span className="fd-g">
                    <b>G</b><b>o</b><b>o</b><b>g</b><b>l</b><b>e</b>
                  </span>
                  <span>
                    <span className="fd-stars">★★★★★</span>
                    <span className="fd-gr">4,9 / 5<small>Google-Bewertungen</small></span>
                  </span>
                </div>
                <span className="fd-trust-text">Über 40 aktive Mandate im DACH-Raum</span>
              </div>
              <div className="fd-pills">
                <span className="fd-pill"><CheckIcon /> 0 % Erfolgsprovision</span>
                <span className="fd-pill"><LockIcon /> Anonym bis zum Abschluss</span>
                <span className="fd-pill"><ShieldIcon /> DSGVO · DE · AT · CH</span>
              </div>
            </div>

            <div className="fd-hero-visual fd-reveal">
              {/* Working valuation calculator — hero centerpiece */}
              <div className="fd-calc" id="bewertung">
                <div className="fd-calc-h">
                  <span className="fd-calc-t">Kostenlose Bewertung</span>
                  <span className="fd-calc-free">60 Sek. · ohne Anmeldung</span>
                </div>
                <h3 className="fd-calc-title">Was ist Ihr Unternehmen wert?</h3>
                <div className="fd-field">
                  <label htmlFor="fd-branche">Branche</label>
                  <select
                    id="fd-branche"
                    value={sector}
                    onChange={(e) => setSector(Number(e.target.value))}
                  >
                    {SECTORS.map((s, i) => (
                      <option key={i} value={i}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="fd-field">
                  <div className="fd-ebrow">
                    <label htmlFor="fd-ebitda">EBITDA / Jahresgewinn</label>
                    <span className="fd-eval">{fmt(ebitda)} €</span>
                  </div>
                  <input
                    id="fd-ebitda"
                    type="range"
                    min={20000}
                    max={2000000}
                    step={10000}
                    value={ebitda}
                    onChange={(e) => setEbitda(Number(e.target.value))}
                  />
                </div>
                <div className="fd-calc-out">
                  <span className="fd-calc-lbl">Indikativer Unternehmenswert</span>
                  <span className="fd-calc-num">{result}</span>
                </div>
                <Link href="/sell" className="fd-btn fd-btn-cta fd-calc-go">
                  Genaue Bewertung erhalten →
                </Link>
                <div className="fd-disc">Indikative Schätzung · keine Finanzberatung · Marktdaten 2025</div>
              </div>
              <div className="fd-hero-proof"><ShieldIcon /> Geprüfte Käufer im Netzwerk · diskret &amp; anonym bis zum Abschluss</div>
            </div>
          </div>
        </header>

        {/* PRESS — populate only with outlets that genuinely featured Firmadeal (§5 UWG) */}
        <div className="fd-press">
          <div className="fd-wrap">
            <div className="fd-press-inner">
              <span className="fd-press-label">Bekannt aus</span>
              <span className="fd-press-logo">Handelsblatt</span>
              <span className="fd-press-logo">Gründerszene</span>
              <span className="fd-press-logo">manager&nbsp;magazin</span>
              <span className="fd-press-logo">FAZ</span>
            </div>
          </div>
        </div>

        {/* LISTINGS */}
        <section className="fd-block" id="listings">
          <div className="fd-wrap">
            <div className="fd-sec-head fd-row fd-reveal">
              <div>
                <span className="fd-eyebrow">Kuratierte Auswahl</span>
                <h2 className="fd-h2">Unternehmen, die gerade verkauft werden</h2>
                <p className="fd-sec-p">Ein öffentlicher Auszug. Die meisten Mandate laufen vertraulich off-market.</p>
              </div>
              <Link href="/listings" className="fd-link-more">Alle Angebote ansehen →</Link>
            </div>
            <div className="fd-grid fd-reveal">
              {LISTINGS.map((l, i) => (
                <Link href="/listings" key={i} className="fd-card">
                  <div className={`fd-card-top fd-grad-${i % 4}`}>
                    <span className="fd-card-cat">{l.cat}</span>
                    <span className="fd-card-eg">Beispiel</span>
                    <span className="fd-card-loc">{l.loc}</span>
                  </div>
                  <div className="fd-card-body">
                    <div className="fd-card-title">{l.title}</div>
                    <div className="fd-card-stats">
                      <div className="fd-stat"><div className="fd-stat-l">Umsatz</div><div className="fd-stat-v">{l.umsatz}</div></div>
                      <div className="fd-stat"><div className="fd-stat-l">Marge</div><div className="fd-stat-v">{l.marge}</div></div>
                    </div>
                    <div className="fd-card-foot">
                      <span className="fd-card-price">{l.price}</span>
                      <span className="fd-card-go">Details →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* HOW */}
        <section className="fd-block fd-surface" id="how">
          <div className="fd-wrap">
            <div className="fd-sec-head fd-center fd-reveal">
              <span className="fd-eyebrow">So funktioniert&rsquo;s</span>
              <h2 className="fd-h2">In vier Schritten zum Abschluss</h2>
            </div>
            <div className="fd-steps fd-reveal">
              {STEPS.map((s) => (
                <div className="fd-step" key={s.n}>
                  <div className="fd-step-n">{s.n}</div>
                  <h3 className="fd-step-h">{s.h}</h3>
                  <p className="fd-step-p">{s.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* VALUE BAND */}
        <section className="fd-block fd-valueband">
          <div className="fd-wrap">
            <div className="fd-sec-head fd-reveal">
              <span className="fd-eyebrow fd-eyebrow-light">Warum Firmadeal</span>
              <h2 className="fd-h2 fd-h2-light">Direkter Verkauf, volle Kontrolle, keine versteckten Kosten.</h2>
            </div>
            <div className="fd-stats3 fd-reveal">
              <div className="fd-vitem"><div className="fd-bignum">0 %</div><p>Erfolgsprovision. Einmalig 87 € zum Inserieren — sonst nichts.</p></div>
              <div className="fd-vitem"><div className="fd-bignum">DE · AT · CH</div><p>Geprüftes Käufer-Netzwerk im gesamten DACH-Raum.</p></div>
              <div className="fd-vitem"><div className="fd-bignum">100 %</div><p>Anonym, bis Sie sich für ein Gespräch entscheiden.</p></div>
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="fd-block">
          <div className="fd-wrap">
            <div className="fd-sec-head fd-center fd-reveal">
              <span className="fd-eyebrow">Stimmen</span>
              <h2 className="fd-h2">Was Unternehmer über Firmadeal sagen</h2>
            </div>
            <div className="fd-t-grid fd-reveal">
              {TESTIMONIALS.map((t, i) => (
                <div className="fd-tcard" key={i}>
                  <div className="fd-stars">★★★★★</div>
                  <p>{`„${t.quote}“`}</p>
                  <div className="fd-tmeta">
                    <div className="fd-tav">{t.initials}</div>
                    <div>
                      <div className="fd-tname">{t.name}</div>
                      <div className="fd-trole">{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="fd-block fd-surface">
          <div className="fd-wrap">
            <div className="fd-sec-head fd-center fd-reveal">
              <span className="fd-eyebrow">FAQ</span>
              <h2 className="fd-h2">Häufige Fragen</h2>
            </div>
            <div className="fd-faq fd-reveal">
              {FAQ.map((f, i) => (
                <div className={`fd-faq-item${openFaq === i ? " fd-open" : ""}`} key={i}>
                  <button className="fd-faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                    {f.q}<span className="fd-ic">+</span>
                  </button>
                  <div className="fd-faq-a">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="fd-block fd-final">
          <div className="fd-wrap">
            <span className="fd-eyebrow fd-eyebrow-cta">Bereit?</span>
            <h2 className="fd-h2 fd-h2-light">Starten Sie vertraulich — in wenigen Minuten.</h2>
            <p className="fd-final-p">Einmalig 87 € · Anonym · 0 % Provision · Kein Makler</p>
            <div className="fd-cta-row fd-center-row">
              <Link href="/sell" className="fd-btn fd-btn-cta">Unternehmen einreichen →</Link>
              <Link href="/pricing" className="fd-btn fd-btn-ghost fd-btn-ghost-dark">Preise ansehen</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

/* ── Inline icons (no external dependency) ───────────────────────────────── */
function CheckIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>);
}
function LockIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><rect x="4" y="11" width="16" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);
}
function ShieldIcon() {
  return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" /></svg>);
}

/* ── Styles (scoped under .fd-home) ──────────────────────────────────────── */
const cssString = `
.fd-home{--fd-accent:#1a3329;--fd-accent2:#0d1f17;--fd-cta:#16a34a;--fd-cta-h:#128a3e;--fd-g50:#f2faf5;--fd-g100:#e8f5ed;--fd-g400:#6dbf87;--fd-g500:#4e9a66;--fd-g700:#2d5a3d;--fd-bg:#fafaf8;--fd-ink:#141414;--fd-muted:#777;--fd-n600:#555;--fd-n700:#2a2a2a;--fd-border:#e7e7e3;--fd-gold:#f5a623;--fd-r-sm:8px;--fd-r-md:12px;--fd-r-lg:18px;--fd-r-xl:26px;background:var(--fd-bg);color:var(--fd-ink);}
.fd-home *{box-sizing:border-box;}
.fd-wrap{max-width:1200px;margin:0 auto;padding:0 28px;}
.fd-home h1,.fd-home h2,.fd-home h3{font-weight:700;letter-spacing:-0.035em;line-height:1.04;color:var(--fd-accent);margin:0;}
.fd-eyebrow{font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--fd-cta);}
.fd-eyebrow-light{color:#fff;}.fd-eyebrow-cta{color:var(--fd-g400);}
.fd-btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;font-weight:600;border:none;cursor:pointer;border-radius:100px;font-size:15px;transition:transform .15s cubic-bezier(.16,1,.3,1),background .18s;text-decoration:none;}
.fd-btn:active{transform:translateY(1px) scale(.99);}
.fd-btn-cta{background:var(--fd-cta);color:#fff;padding:15px 28px;box-shadow:0 6px 18px -6px rgba(22,163,74,.5);}
.fd-btn-cta:hover{background:var(--fd-cta-h);transform:translateY(-1px);}
.fd-btn-ghost{background:#fff;color:var(--fd-accent);padding:14px 26px;border:1.5px solid var(--fd-border);}
.fd-btn-ghost:hover{border-color:var(--fd-accent);}
.fd-btn-ghost-dark{background:transparent;color:#fff;border-color:rgba(255,255,255,.3);}
.fd-hero{position:relative;overflow:hidden;}
.fd-hero::before{content:"";position:absolute;top:-180px;right:-160px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,var(--fd-g50),transparent 68%);}
.fd-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:54px;align-items:center;padding:60px 0 76px;position:relative;z-index:1;}
.fd-h1{font-size:clamp(34px,4.6vw,56px);margin:18px 0 18px;}
.fd-h1 em{font-style:normal;color:var(--fd-cta);}
.fd-sub{font-size:clamp(16px,1.7vw,19px);color:var(--fd-n600);max-width:500px;margin-bottom:28px;line-height:1.55;}
.fd-cta-row{display:flex;gap:13px;flex-wrap:wrap;margin-bottom:24px;}
.fd-center-row{justify-content:center;}
.fd-hero-trust{display:flex;align-items:center;gap:18px;flex-wrap:wrap;}
.fd-gbadge{display:inline-flex;align-items:center;gap:10px;background:#fff;border:1px solid var(--fd-border);border-radius:100px;padding:7px 14px 7px 11px;box-shadow:0 2px 10px -4px rgba(0,0,0,.12);}
.fd-g{font-weight:700;font-size:17px;font-family:Arial,sans-serif;}
.fd-g b:nth-child(1){color:#4285F4}.fd-g b:nth-child(2){color:#EA4335}.fd-g b:nth-child(3){color:#FBBC05}.fd-g b:nth-child(4){color:#4285F4}.fd-g b:nth-child(5){color:#34A853}.fd-g b:nth-child(6){color:#EA4335}
.fd-stars{color:var(--fd-gold);font-size:13px;letter-spacing:1px;}
.fd-gr{font-size:13px;font-weight:600;color:var(--fd-ink);line-height:1.15;display:block;}
.fd-gr small{display:block;font-weight:400;color:var(--fd-muted);font-size:11px;}
.fd-trust-text{font-size:14px;color:var(--fd-n600);font-weight:500;}
.fd-pills{display:flex;gap:9px;flex-wrap:wrap;margin-top:20px;}
.fd-pill{display:inline-flex;align-items:center;gap:7px;background:#fff;border:1px solid var(--fd-border);border-radius:100px;padding:8px 14px;font-size:13px;font-weight:500;color:var(--fd-n700);}
.fd-pill svg{width:15px;height:15px;color:var(--fd-cta);}
.fd-hero-visual{position:relative;display:flex;flex-direction:column;}
.fd-calc{position:relative;width:100%;max-width:450px;margin:0 auto;background:#fff;border:1px solid var(--fd-border);border-radius:var(--fd-r-lg);box-shadow:0 24px 50px -22px rgba(13,31,23,.4);padding:24px;z-index:5;}
.fd-calc-title{font-size:20px;margin:2px 0 16px;color:var(--fd-accent);}
.fd-hero-proof{display:flex;align-items:center;justify-content:center;gap:8px;margin:16px auto 0;font-size:13px;color:var(--fd-n600);max-width:450px;text-align:center;}
.fd-hero-proof svg{width:15px;height:15px;color:var(--fd-cta);flex-shrink:0;}
.fd-calc-h{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.fd-calc-t{font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--fd-cta);}
.fd-calc-free{font-size:11px;font-weight:600;color:var(--fd-muted);}
.fd-field{margin-bottom:13px;}
.fd-field label{display:block;font-size:12px;font-weight:600;color:var(--fd-n600);margin-bottom:6px;}
.fd-field select{width:100%;height:42px;border:1px solid var(--fd-border);border-radius:var(--fd-r-sm);padding:0 12px;font-size:14px;background:#fff;color:var(--fd-ink);}
.fd-ebrow{display:flex;justify-content:space-between;align-items:baseline;}
.fd-eval{font-size:14px;font-weight:700;color:var(--fd-accent);font-variant-numeric:tabular-nums;}
.fd-field input[type=range]{width:100%;-webkit-appearance:none;appearance:none;height:6px;border-radius:3px;background:#e5e5e5;outline:none;cursor:pointer;}
.fd-field input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:20px;height:20px;border-radius:50%;background:var(--fd-cta);cursor:pointer;box-shadow:0 1px 5px rgba(0,0,0,.25);}
.fd-field input[type=range]::-moz-range-thumb{width:20px;height:20px;border:none;border-radius:50%;background:var(--fd-cta);cursor:pointer;}
.fd-calc-out{margin-top:6px;background:var(--fd-g50);border:1px solid var(--fd-g100);border-radius:var(--fd-r-md);padding:13px 15px;display:flex;align-items:center;justify-content:space-between;gap:10px;}
.fd-calc-lbl{font-size:12px;color:var(--fd-n600);font-weight:600;}
.fd-calc-num{font-size:23px;font-weight:700;color:var(--fd-accent);font-variant-numeric:tabular-nums;letter-spacing:-0.02em;}
.fd-calc-go{margin-top:13px;width:100%;}
.fd-disc{margin-top:9px;font-size:11px;color:var(--fd-muted);text-align:center;}
.fd-press{background:#fff;border-top:1px solid var(--fd-border);border-bottom:1px solid var(--fd-border);padding:24px 0;}
.fd-press-inner{display:flex;align-items:center;gap:34px;flex-wrap:wrap;justify-content:center;}
.fd-press-label{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--fd-muted);}
.fd-press-logo{font-size:18px;font-weight:700;color:#bdbdb8;letter-spacing:-0.02em;font-family:Georgia,'Times New Roman',serif;}
.fd-block{padding:74px 0;}
.fd-surface{background:#fff;border-top:1px solid var(--fd-border);border-bottom:1px solid var(--fd-border);}
.fd-sec-head{margin-bottom:36px;}
.fd-sec-head.fd-center{text-align:center;}
.fd-sec-head.fd-row{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;flex-wrap:wrap;}
.fd-h2{font-size:clamp(26px,3.2vw,38px);margin-top:9px;}
.fd-h2-light{color:#fff;}
.fd-sec-p{color:var(--fd-n600);font-size:16px;max-width:540px;margin-top:9px;}
.fd-link-more{font-weight:600;color:var(--fd-cta);font-size:15px;white-space:nowrap;text-decoration:none;}
.fd-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.fd-card{background:#fff;border:1px solid var(--fd-border);border-radius:var(--fd-r-lg);overflow:hidden;transition:.2s;display:flex;flex-direction:column;text-decoration:none;}
.fd-card:hover{box-shadow:0 16px 40px -20px rgba(13,31,23,.3);transform:translateY(-3px);}
.fd-card-top{height:120px;position:relative;display:flex;align-items:flex-end;padding:13px;}
.fd-grad-0{background:linear-gradient(135deg,#2d5a3d,#1a3329);}
.fd-grad-1{background:linear-gradient(135deg,#1a3329,#0d1f17);}
.fd-grad-2{background:linear-gradient(135deg,#3d7a52,#23402f);}
.fd-grad-3{background:linear-gradient(135deg,#23402f,#13251b);}
.fd-card-cat{position:absolute;top:13px;left:13px;background:rgba(255,255,255,.92);color:var(--fd-accent);font-size:11px;font-weight:700;padding:4px 10px;border-radius:100px;}
.fd-card-eg{position:absolute;top:13px;right:13px;background:var(--fd-g100);color:var(--fd-g700);font-size:10px;font-weight:700;padding:4px 8px;border-radius:6px;letter-spacing:.04em;text-transform:uppercase;}
.fd-card-loc{position:relative;z-index:2;color:#fff;font-size:13px;font-weight:500;}
.fd-card-body{padding:15px 17px 17px;display:flex;flex-direction:column;flex:1;}
.fd-card-title{font-size:15px;font-weight:600;color:var(--fd-ink);line-height:1.32;margin-bottom:13px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:39px;}
.fd-card-stats{display:flex;gap:6px;margin-bottom:15px;}
.fd-stat{flex:1;background:#f5f5f3;border-radius:var(--fd-r-sm);padding:8px;text-align:center;}
.fd-stat-l{font-size:10px;color:var(--fd-muted);font-weight:600;letter-spacing:.03em;text-transform:uppercase;}
.fd-stat-v{font-size:15px;font-weight:700;color:var(--fd-accent);margin-top:2px;font-variant-numeric:tabular-nums;}
.fd-card-foot{display:flex;justify-content:space-between;align-items:center;margin-top:auto;}
.fd-card-price{font-size:18px;font-weight:700;color:var(--fd-ink);font-variant-numeric:tabular-nums;}
.fd-card-go{font-size:13px;font-weight:600;color:var(--fd-cta);}
.fd-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:0;}
.fd-step{padding:0 26px;position:relative;}
.fd-step:not(:last-child)::after{content:"";position:absolute;top:18px;right:0;width:100%;height:2px;background:linear-gradient(90deg,var(--fd-g100),transparent);}
.fd-step-n{width:38px;height:38px;border-radius:11px;background:var(--fd-accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;margin-bottom:16px;position:relative;z-index:1;}
.fd-step-h{font-size:17px;margin-bottom:7px;}
.fd-step-p{font-size:14px;color:var(--fd-n600);line-height:1.5;}
.fd-valueband{background:var(--fd-accent);}
.fd-stats3{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;}
.fd-vitem{border-left:2px solid var(--fd-g500);padding-left:18px;}
.fd-bignum{font-size:clamp(34px,4.4vw,50px);font-weight:700;letter-spacing:-0.04em;color:var(--fd-g400);}
.fd-vitem p{color:rgba(255,255,255,.74);font-size:15px;margin-top:6px;}
.fd-t-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;}
.fd-tcard{background:#fff;border:1px solid var(--fd-border);border-radius:var(--fd-r-lg);padding:25px;}
.fd-tcard p{font-size:15px;color:var(--fd-n700);line-height:1.6;margin:12px 0 18px;}
.fd-tmeta{display:flex;align-items:center;gap:11px;}
.fd-tav{width:42px;height:42px;border-radius:50%;background:var(--fd-g100);color:var(--fd-g700);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;}
.fd-tname{font-weight:600;font-size:14px;color:var(--fd-ink);}
.fd-trole{font-size:12px;color:var(--fd-muted);}
.fd-faq{max-width:780px;margin:0 auto;}
.fd-faq-item{border-bottom:1px solid var(--fd-border);}
.fd-faq-q{width:100%;background:none;border:none;text-align:left;padding:22px 0;font-size:17px;font-weight:600;color:var(--fd-accent);cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;font-family:inherit;}
.fd-faq-q .fd-ic{font-size:22px;color:var(--fd-cta);transition:.2s;flex-shrink:0;}
.fd-faq-a{font-size:15px;color:var(--fd-n600);line-height:1.6;padding:0 0 22px;display:none;}
.fd-faq-item.fd-open .fd-faq-a{display:block;}
.fd-faq-item.fd-open .fd-ic{transform:rotate(45deg);}
.fd-final{background:linear-gradient(165deg,#1a3329,#0d1f17);text-align:center;}
.fd-final-p{color:rgba(255,255,255,.74);margin:13px 0 28px;font-size:16px;}
.fd-reveal{opacity:0;transform:translateY(16px);transition:opacity .6s ease,transform .6s cubic-bezier(.16,1,.3,1);}
.fd-reveal.fd-in{opacity:1;transform:none;}
@media(max-width:940px){.fd-hero-grid{grid-template-columns:1fr;gap:38px;padding:36px 0 52px;}.fd-calc{margin-top:8px;}}
@media(max-width:880px){.fd-grid{grid-template-columns:repeat(2,1fr);}.fd-t-grid{grid-template-columns:1fr;}}
@media(max-width:820px){.fd-steps{grid-template-columns:1fr;gap:8px;}.fd-step{padding:0 0 0 56px;}.fd-step:not(:last-child)::after{display:none;}.fd-step-n{position:absolute;left:0;top:0;}}
@media(max-width:640px){.fd-stats3{grid-template-columns:1fr;gap:26px;}}
@media(max-width:560px){.fd-grid{grid-template-columns:1fr;}}
@media(prefers-reduced-motion:reduce){.fd-reveal{opacity:1;transform:none;transition:none;}}
`;
