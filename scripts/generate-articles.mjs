// Firmadeal — automated niche-SEO article generator.
// Runs in GitHub Actions. Picks N niches from the queue, drafts each with Claude,
// passes them through a quality gate (Claude critic + heuristics), writes MDX +
// JSON-LD for those that pass, queues the rest for human review, and emits the
// list of published URLs for the GSC step. No publishing happens without passing the gate.

import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { runQualityGate } from "./quality-gate.mjs";
import { brandMemory, eeatFacts, articleTemplate, BANNED_PHRASES } from "./content-config.mjs";

const ROOT = process.cwd();
const QUEUE = path.join(ROOT, "content/queue.json");
const PUBLISHED = path.join(ROOT, "content/published.json");
const REVIEW_DIR = path.join(ROOT, "content/needs-review");
const ARTICLE_DIR = path.join(ROOT, "src/content/ratgeber");
const SITE_ORIGIN = "https://www.firmadeal.de";
// Real team members only — every article is signed by one of these (rotated).
// Invented authors hurt E-E-A-T (Google flags fake bylines), so add real people here.
const AUTHORS = [
  { name: "Albert Laurin", role: "Gründer, Firmadeal", url: "https://www.linkedin.com/company/firmadeal" },
  // { name: "...", role: "...", url: "..." },  // add real teammates
];
const pickAuthor = () => AUTHORS[Math.floor(Math.random() * AUTHORS.length)];

const COUNT = parseInt(process.env.ARTICLE_COUNT || "2", 10);
const MODEL = process.env.MODEL || "claude-sonnet-4-6";
const GATE_THRESHOLD = 7; // min score (0–10) on every critical dimension

// ── 09:00 Europe/Berlin time-guard (handles DST automatically) ──────────────
function berlinHour() {
  const s = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", hour12: false }).format(new Date());
  return parseInt(s, 10);
}
if (process.env.FORCE_RUN !== "true" && berlinHour() !== 9) {
  console.log(`Not 09:00 in Berlin (currently ${berlinHour()}:00). Exiting without action.`);
  setOutput("published", "false");
  process.exit(0);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function readJSON(p, fallback) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; } }
function setOutput(k, v) { if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`); }
function slugify(s) {
  return s.toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss")
    .replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}

// ── Build the generation prompt from the "skills" config ────────────────────
function buildPrompt(niche) {
  return `Du bist ein deutschsprachiger M&A-Fachredakteur für Firmadeal. Schreibe EINEN Ratgeber-Artikel.

NISCHE (genaue Suchintention): "${niche.title}"
Branche: ${niche.branche} | Region: ${niche.region || "DACH"} | Intent: ${niche.intent}

MARKENKONTEXT (Ton & Fakten — strikt einhalten):
${brandMemory}

VERIFIZIERTE FAKTEN (NUR diese Zahlen verwenden, jeweils mit Quelle; nichts erfinden):
${eeatFacts(niche.branche)}

STRUKTUR-VORLAGE:
${articleTemplate}

HARTE REGELN:
- Mindestens 900 Wörter, davon ≥60% spezifisch für genau diese Nische (keine Allgemeinplätze).
- Echte, hilfreiche Information, die Top-Ergebnisse NICHT bieten (Information Gain): eine konkrete Zahl, eine deutsche Besonderheit, ein gerechnetes Beispiel.
- Keine erfundenen Statistiken. Keine dieser verbotenen Phrasen: ${BANNED_PHRASES.join(", ")}.
- Natürliches, professionelles Deutsch. Korrekte Umlaute und Fachbegriffe.
- Schreibe wie ein erfahrener Mensch aus der Praxis: variiere die Satzlänge, nutze gelegentlich kurze Sätze, vermeide generische KI-Floskeln, gleichförmige Absätze und Aufzählungs-Overkill. Echte redaktionelle Stimme, keine glatte Maschinensprache. (Keine künstlichen Tippfehler oder doppelten Leerzeichen — saubere, aber lebendige Sprache.)
- 4–6 FAQ-Einträge (für FAQPage-Schema).
- Interne Links als Markdown: /sell , /listings , und die Branche-Landingpage /${slugify(niche.branche)}-verkaufen.

Antworte AUSSCHLIESSLICH mit gültigem JSON in genau diesem Format:
{
 "title": "...", "metaDescription": "... (<=155 Zeichen)",
 "slug": "kebab-case-ohne-umlaute",
 "excerpt": "1 Satz",
 "bodyMdx": "Markdown/MDX Fließtext mit ## Überschriften und den internen Links",
 "faq": [{"q":"...","a":"..."}],
 "sources": ["Quelle 1", "Quelle 2"]
}`;
}

async function generateOne(niche) {
  const msg = await client.messages.create({
    model: MODEL, max_tokens: 4000, temperature: 0.7,
    messages: [{ role: "user", content: buildPrompt(niche) }],
  });
  const text = msg.content.map(b => b.text || "").join("");
  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  json.slug = json.slug || slugify(niche.title);
  return json;
}

function frontmatter(a, niche, author) {
  const url = `${SITE_ORIGIN}/ratgeber/${a.slug}`;
  const jsonld = {
    "@context": "https://schema.org", "@type": "Article",
    headline: a.title, description: a.metaDescription,
    author: { "@type": "Person", name: author.name, jobTitle: author.role, url: author.url },
    publisher: { "@type": "Organization", name: "Firmadeal", url: SITE_ORIGIN },
    datePublished: new Date().toISOString(), inLanguage: "de-DE", mainEntityOfPage: url,
  };
  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: a.faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return `---
title: ${JSON.stringify(a.title)}
description: ${JSON.stringify(a.metaDescription)}
slug: ${a.slug}
branche: ${JSON.stringify(niche.branche)}
region: ${JSON.stringify(niche.region || "")}
author: ${JSON.stringify(author.name)}
date: ${new Date().toISOString()}
sources: ${JSON.stringify(a.sources || [])}
jsonld: ${JSON.stringify([jsonld, faqLd])}
---

${a.bodyMdx}

## Häufige Fragen
${a.faq.map(f => `### ${f.q}\n${f.a}`).join("\n\n")}

---
*${author.name} — ${author.role}. Fragen zum Verkauf Ihres Unternehmens? [Vertraulich einreichen](/sell).*
`;
}

// ── Main ────────────────────────────────────────────────────────────────────
const queue = readJSON(QUEUE, []);
const published = readJSON(PUBLISHED, []);
const doneSlugs = new Set(published.map(p => p.slug));
const candidates = queue
  .filter(n => !n.published && !doneSlugs.has(slugify(n.title)))
  .sort((a, b) => (b.score || 0) - (a.score || 0))
  .slice(0, COUNT);

if (candidates.length === 0) { console.log("Queue empty — nothing to publish. Refill content/queue.json."); setOutput("published", "false"); process.exit(0); }

fs.mkdirSync(ARTICLE_DIR, { recursive: true });
fs.mkdirSync(REVIEW_DIR, { recursive: true });

const publishedNow = [], urls = [], slugs = [];
for (const niche of candidates) {
  try {
    const article = await generateOne(niche);
    const gate = await runQualityGate({ client, model: MODEL, article, niche, threshold: GATE_THRESHOLD, banned: BANNED_PHRASES });
    if (!gate.pass) {
      fs.writeFileSync(path.join(REVIEW_DIR, `${article.slug}.json`), JSON.stringify({ article, niche, gate }, null, 2));
      console.log(`HOLD (review): "${niche.title}" — ${gate.reason}`);
      continue;
    }
    const author = pickAuthor();
    fs.writeFileSync(path.join(ARTICLE_DIR, `${article.slug}.mdx`), frontmatter(article, niche, author));
    niche.published = true;
    published.push({ slug: article.slug, title: article.title, branche: niche.branche, author: author.name, date: new Date().toISOString(), score: gate.min });
    publishedNow.push(article.slug);
    urls.push(`${SITE_ORIGIN}/ratgeber/${article.slug}`);
    slugs.push(article.slug);
    console.log(`PUBLISHED: "${article.title}" (min score ${gate.min})`);
  } catch (e) {
    console.error(`Failed on "${niche.title}":`, e.message);
  }
}

fs.writeFileSync(QUEUE, JSON.stringify(queue, null, 2));
fs.writeFileSync(PUBLISHED, JSON.stringify(published, null, 2));

setOutput("published", publishedNow.length ? "true" : "false");
setOutput("slugs", slugs.join(", "));
setOutput("urls", urls.join(" "));
console.log(`Done. Published ${publishedNow.length}/${candidates.length}.`);
