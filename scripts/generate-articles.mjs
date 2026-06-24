// Firmadeal — automated deep-dive niche-SEO article generator.
// Runs in GitHub Actions. Picks N niches from content/queue.json, drafts a deep-dive
// article with Claude, runs the anti-slop quality gate, and INSERTS passing articles
// into the Supabase `blog_posts` table (which is what /blog and /blog/[slug] render).
// Articles that fail the gate are saved to content/needs-review/ instead of published.

import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { runQualityGate } from "./quality-gate.mjs";
import { brandMemory, eeatFacts, articleTemplate, externalSources, BANNED_PHRASES } from "./content-config.mjs";

const ROOT = process.cwd();
const QUEUE = path.join(ROOT, "content/queue.json");
const PUBLISHED = path.join(ROOT, "content/published.json");
const REVIEW_DIR = path.join(ROOT, "content/needs-review");
const SITE_ORIGIN = "https://www.firmadeal.de";

const COUNT = parseInt(process.env.ARTICLE_COUNT || "2", 10);
const MODEL = process.env.MODEL || "claude-sonnet-4-6";
const GATE_THRESHOLD = 7;
const PUBLISH_STATE = (process.env.PUBLISH_STATE || "live") === "live"; // true = published immediately

// Real team members only — invented bylines hurt E-E-A-T.
const AUTHORS = ["Albert Laurin"];
const pickAuthor = () => AUTHORS[Math.floor(Math.random() * AUTHORS.length)];

// Map niche intent → blog_posts.category (allowed: verkauf, kauf, bewertung, nachfolge, ratgeber)
const CATEGORY = { verkaufen: "verkauf", kaufen: "kauf", bewerten: "bewertung", nachfolge: "nachfolge", ablauf: "ratgeber" };

// ── 09:00 Europe/Berlin time-guard (DST-safe) ──────────────────────────────
const berlinHour = () => parseInt(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", hour12: false }).format(new Date()), 10);
if (process.env.FORCE_RUN !== "true" && berlinHour() !== 9) {
console.log(`Not 09:00 in Berlin (currently ${berlinHour()}:00). Exiting.`);
setOutput("published", "false"); process.exit(0);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function readJSON(p, fb) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fb; } }
function setOutput(k, v) { if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`); }
function slugify(s) { return s.toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }
const readingTime = (txt) => Math.max(3, Math.round(txt.split(/\s+/).length / 200));

// ── Structured-output tool. The Anthropic API guarantees tool inputs are valid
//    JSON (constrained decoding), so a long Markdown `content` field with raw
//    newlines/quotes can never break parsing the way free-form text + JSON.parse did.
const ARTICLE_TOOL = {
name: "publish_article",
description: "Gib den fertigen Deep-Dive-Artikel als strukturierte Daten zurück.",
input_schema: {
type: "object",
properties: {
title: { type: "string", description: "Titel mit Keyword, <=70 Zeichen" },
excerpt: { type: "string", description: "1–2 Sätze, <=160 Zeichen" },
slug: { type: "string", description: "kebab-case ohne Umlaute" },
content: { type: "string", description: "VOLLSTÄNDIGER Markdown-Artikel mit ## Überschriften, internen + externen Links, gerechnetem Beispiel und ## Häufige Fragen am Ende" },
faq: { type: "array", items: { type: "object", properties: { q: { type: "string" }, a: { type: "string" } }, required: ["q", "a"] } },
sources: { type: "array", items: { type: "string" }, description: "Quelle (URL)" }
},
required: ["title", "excerpt", "slug", "content", "faq", "sources"]
}
};

function buildPrompt(niche) {
return `Du bist ein deutschsprachiger M&A-Fachredakteur für Firmadeal. Schreibe EINEN tiefgehenden Ratgeber-Artikel (Deep Dive).

NISCHE (genaue Suchintention): "${niche.title}"
Branche: ${niche.branche} | Region: ${niche.region || "DACH"} | Intent: ${niche.intent}

MARKENKONTEXT (Ton & Fakten — strikt):
${brandMemory}

VERIFIZIERTE FAKTEN (nur diese Zahlen, jeweils mit Quelle; nichts erfinden):
${eeatFacts(niche.branche)}

AUTORITATIVE EXTERNE QUELLEN (als echte Markdown-Backlinks einbauen, wo passend):
${externalSources}

STRUKTUR:
${articleTemplate}

HARTE REGELN:
- MINDESTENS 1500 Wörter. Echter Deep Dive, kein oberflächlicher Überblick.
- ≥60% spezifisch für genau diese Nische. Ein konkret gerechnetes Bewertungsbeispiel.
- Information Gain: etwas, das Top-Ergebnisse NICHT bieten (deutsche Besonderheit, Zahl, Beispiel).
- 2–4 **externe** Backlinks auf autoritative Quellen (IHK, KfW, Destatis, IDW, gesetze-im-internet.de) als Markdown-Links.
- Interne Links als Markdown: /sell , /listings , /#bewertung , und die Branche-Seite.
- 4–6 FAQ (## Häufige Fragen) am Ende, im content enthalten.
- Keine erfundenen Statistiken. Verbotene Phrasen: ${BANNED_PHRASES.join(", ")}.
- Natürliches, professionelles Deutsch, variierende Satzlänge, keine KI-Floskeln, keine künstlichen Tippfehler.

Gib das Ergebnis ausschließlich über das Tool "publish_article" zurück. Das Feld "content" enthält den vollständigen Markdown-Artikel inkl. ## Häufige Fragen.`;
}

async function generateOne(niche) {
const msg = await client.messages.create({
model: MODEL,
max_tokens: 8000,
temperature: 0.7,
tools: [ARTICLE_TOOL],
tool_choice: { type: "tool", name: "publish_article" },
messages: [{ role: "user", content: buildPrompt(niche) }],
});
const block = msg.content.find(b => b.type === "tool_use");
if (!block || !block.input) throw new Error("Model returned no publish_article tool_use block");
const a = { ...block.input };
a.slug = a.slug || slugify(niche.title);
a.bodyMdx = a.content; // alias for the quality gate
return a;
}

// ── Main ────────────────────────────────────────────────────────────────────
const queue = readJSON(QUEUE, []);
const published = readJSON(PUBLISHED, []);
const done = new Set(published.map(p => p.slug));
const candidates = queue.filter(n => !n.published && !done.has(slugify(n.title))).sort((a,b)=>(b.score||0)-(a.score||0)).slice(0, COUNT);

if (!candidates.length) { console.log("Queue empty — refill content/queue.json."); setOutput("published","false"); process.exit(0); }
fs.mkdirSync(REVIEW_DIR, { recursive: true });

const urls = [], slugs = [];
for (const niche of candidates) {
try {
const a = await generateOne(niche);
const gate = await runQualityGate({ client, model: MODEL, article: a, niche, threshold: GATE_THRESHOLD, banned: BANNED_PHRASES });
if (!gate.pass) {
fs.writeFileSync(path.join(REVIEW_DIR, `${a.slug}.json`), JSON.stringify({ article: a, niche, gate }, null, 2));
console.log(`HOLD (review): "${niche.title}" — ${gate.reason}`); continue;
}
const author = pickAuthor();
const row = {
slug: a.slug,
title: a.title,
excerpt: a.excerpt,
content: a.content,
category: CATEGORY[niche.intent] || "ratgeber",
author,
reading_time_minutes: readingTime(a.content),
published: PUBLISH_STATE,
published_at: new Date().toISOString(),
};
const { error } = await supabase.from("blog_posts").upsert(row, { onConflict: "slug" });
if (error) { console.error(`Supabase insert failed for "${a.slug}":`, error.message); continue; }

niche.published = true;
published.push({ slug: a.slug, title: a.title, branche: niche.branche, author, date: row.published_at, score: gate.min });
urls.push(`${SITE_ORIGIN}/blog/${a.slug}`); slugs.push(a.slug);
console.log(`PUBLISHED → blog_posts: "${a.title}" (score ${gate.min}, published=${PUBLISH_STATE})`);
} catch (e) { console.error(`Failed on "${niche.title}":`, e.message); }
}

fs.writeFileSync(QUEUE, JSON.stringify(queue, null, 2));
fs.writeFileSync(PUBLISHED, JSON.stringify(published, null, 2));
setOutput("published", slugs.length ? "true" : "false");
setOutput("slugs", slugs.join(", "));
setOutput("urls", urls.join(" "));
console.log(`Done. Published ${slugs.length}/${candidates.length} to Supabase.`);
