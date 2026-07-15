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
import { brandMemory, eeatFacts, externalSources, BANNED_PHRASES, CONTENT_TYPES, typeOf, categoryOf } from "./content-config.mjs";

const ROOT = process.cwd();
const QUEUE = path.join(ROOT, "content/queue.json");
const PUBLISHED = path.join(ROOT, "content/published.json");
const REVIEW_DIR = path.join(ROOT, "content/needs-review");
const SITE_ORIGIN = "https://www.firmadeal.de";

const COUNT = parseInt(process.env.ARTICLE_COUNT || "1", 10);
const MODEL = process.env.MODEL || "claude-sonnet-4-6";
const GATE_THRESHOLD = 7;
const PUBLISH_STATE = (process.env.PUBLISH_STATE || "live") === "live"; // true = published immediately

// Real team members only — invented bylines hurt E-E-A-T.
const AUTHORS = ["Albert Laurin"];
const pickAuthor = () => AUTHORS[Math.floor(Math.random() * AUTHORS.length)];

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// ── Idempotent daily guard (replaces the old fixed 09:00 hour-guard) ────────
// Publish at most ONE post per Europe/Berlin day, and ONLY if today has none yet.
// This removes the dependency on the run firing at an exact clock time: it no
// longer matters whether the scheduled run lands at 09:00, arrives hours late,
// or is a backstop retry — the first run of the day publishes, every later run
// that day is a cheap no-op. Resilient to GitHub Actions dropping/delaying cron
// triggers, and never needs an interactive Claude session. FORCE_RUN=true
// bypasses the guard for manual recovery.
const berlinDay = (d) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date(d));
if (process.env.FORCE_RUN !== "true") {
  const { data: lastPost, error: guardErr } = await supabase
    .from("blog_posts").select("created_at").eq("published", true)
    .order("created_at", { ascending: false }).limit(1);
  // Fail safe: if we cannot confirm today's state, do NOT publish (avoids dupes),
  // but exit NON-ZERO so the workflow's failure alert fires — a blind engine that
  // can't reach Supabase must be loud, not a silent no-op.
  if (guardErr) { console.error("[seo-content] ALERT: guard check failed — cannot confirm today's state, aborting:", guardErr.message); setOutput("published", "false"); process.exit(1); }
  const last = lastPost?.[0]?.created_at;
  if (last && berlinDay(last) === berlinDay(new Date())) {
    console.log(`Already published today (${berlinDay(last)} Berlin). Skipping — idempotent.`);
    setOutput("published", "false"); process.exit(0);
  }
  console.log(`No post yet for ${berlinDay(new Date())} Berlin — proceeding to generate.`);
}

function readJSON(p, fb) { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fb; } }
function setOutput(k, v) { if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`); }
function slugify(s) { return s.toLowerCase().replace(/ä/g,"ae").replace(/ö/g,"oe").replace(/ü/g,"ue").replace(/ß/g,"ss").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }
const readingTime = (txt) => Math.max(3, Math.round(txt.split(/\s+/).length / 200));

// ── Structured-output tool. The Anthropic API guarantees tool inputs are valid
// JSON (constrained decoding), so a long Markdown `content` field with raw
// newlines/quotes can never break parsing the way free-form text + JSON.parse did.
const ARTICLE_TOOL = {
  name: "publish_article",
  description: "Gib den fertigen Deep-Dive-Artikel als strukturierte Daten zurück.",
  input_schema: {
    type: "object",
    properties: {
      title: { type: "string", description: "Titel mit Keyword, <=70 Zeichen" },
      excerpt: { type: "string", description: "1–2 Sätze, <=160 Zeichen" },
      slug: { type: "string", description: "kebab-case ohne Umlaute" },
      content: { type: "string", description: "VOLLSTÄNDIGER Markdown-Artikel: kurze Einleitung, '## Das Wichtigste in Kürze' (3–5 Stichpunkte), scannbare ## H2 / ### H3 Abschnitte, ein gerechnetes Beispiel und '## Häufige Fragen' am Ende" },
      faq: { type: "array", items: { type: "object", properties: { q: { type: "string" }, a: { type: "string" } }, required: ["q", "a"] } },
      sources: { type: "array", items: { type: "string" }, description: "Quelle (URL)" }
    },
    required: ["title", "excerpt", "slug", "content", "faq", "sources"]
  }
};

function buildPrompt(niche) {
  const type = typeOf(niche);
  const spec = CONTENT_TYPES[type];
  const isKonzept = type === "konzept";
  const scopeLine = isKonzept
    ? `Typ: Konzept-Erklärartikel (branchenübergreifend) | Region: DACH`
    : `Branche: ${niche.branche} | Region: ${niche.region || "DACH"} | Typ: ${type}`;

  return `Du bist ein deutschsprachiger M&A-Fachredakteur für Firmadeal. Schreibe EINEN tiefgehenden, informativen Deep-Dive-Artikel.

ZIEL-SUCHBEGRIFF (Suchintention): ${spec.keyword}
TITEL / NISCHE: "${niche.title}"
${scopeLine}

MARKENKONTEXT (Ton & Fakten — strikt):
${brandMemory}

VERIFIZIERTE FAKTEN (nur diese Zahlen, jeweils mit Quelle; nichts erfinden):
${eeatFacts(niche.branche)}

AUTORITATIVE EXTERNE QUELLEN (als echte Markdown-Backlinks einbauen, wo passend):
${externalSources}

FOKUS & AUFBAU FÜR DIESEN ARTIKELTYP:
${spec.focus}

PFLICHT-AUFBAU (durchgehend scannbar):
1. Direkte, konkrete Antwort in den ersten 2–4 Sätzen (für AI Overviews / Featured Snippet).
2. "## Das Wichtigste in Kürze" — 3–5 Stichpunkte mit den zentralen Erkenntnissen.
3. Mehrere ## H2-Hauptabschnitte (siehe Fokus oben), bei Bedarf in ### H3 gegliedert. Kurze Absätze, Aufzählungen — überfliegbar.
4. "## Häufige Fragen" mit 4–6 Q&A am Ende.

HARTE REGELN:
- MINDESTENS 1500 Wörter. Echter Deep Dive, kein oberflächlicher Überblick.
- Information Gain: etwas, das die Top-Ergebnisse NICHT bieten (deutsche Besonderheit, Zahl, gerechnetes Beispiel).
- 2–4 **externe** Backlinks auf autoritative Quellen (IHK, KfW, Destatis, IDW, gesetze-im-internet.de) als Markdown-Links.
- PFLICHT-interne-Links als natürliche Markdown-Links im Fließtext: /sell (Unternehmen vertraulich einreichen) UND /listings (Unternehmen zum Verkauf) müssen BEIDE vorkommen; zusätzlich /unternehmenswert (Bewertungsrechner) wo im Fokus genannt. KEIN /#bewertung verwenden.
- Keine erfundenen Statistiken. Verbotene Phrasen: ${BANNED_PHRASES.join(", ")}.
- Natürliches, professionelles Deutsch, variierende Satzlänge, keine KI-Floskeln, keine künstlichen Tippfehler.

Gib das Ergebnis ausschließlich über das Tool "publish_article" zurück. Das Feld "content" enthält den vollständigen Markdown-Artikel inkl. "## Das Wichtigste in Kürze" und "## Häufige Fragen".`;
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

// ── Dedupe helpers — never publish two similar articles or repeat a category in one run ──
const STOP = new Set(["und","oder","mit","ohne","fuer","für","der","die","das","ist","sie","was","wie","ihre","ihren","beim","ein","eine","im","in","zu","von","den","dem"]);
function titleTokens(s){ return new Set((s||"").toLowerCase().replace(/[^a-zäöüß0-9\s]/g," ").split(/\s+/).filter(w => w.length > 3 && !STOP.has(w))); }
function jaccard(a,b){ const A=titleTokens(a), B=titleTokens(b); if(!A.size||!B.size) return 0; let inter=0; for(const x of A) if(B.has(x)) inter++; return inter/(A.size+B.size-inter); }

// ── Main ────────────────────────────────────────────────────────────────────
const queue = readJSON(QUEUE, []);
const published = readJSON(PUBLISHED, []);
const done = new Set(published.map(p => p.slug));

// What's already live, used to block near-duplicates. Seed from published.json
// AND from the live Supabase table, so a post created outside this script (e.g.
// by a manual/recovery run) still blocks regenerating the same industry.
// Dedup key is (branche|type), not branche alone — Task D publishes multiple content
// TYPES per branche (a "wert" guide and a "steuer" guide are not duplicates). Seeded
// from published.json (legacy entries resolve to type "verkaufen") and the queue's own
// published flags. Konzept pieces are branche-agnostic and skip this check entirely.
const publishedKeys = new Set([
  ...published.map(p => `${(p.branche || "").toLowerCase()}|${typeOf(p)}`),
  ...queue.filter(n => n.published).map(n => `${(n.branche || "").toLowerCase()}|${typeOf(n)}`),
].filter(k => !k.startsWith("|")));
const publishedTitles = published.map(p => p.title || "");
try {
  const { data: liveRows } = await supabase.from("blog_posts").select("title, slug").eq("published", true);
  for (const r of liveRows || []) {
    if (r.title) publishedTitles.push(r.title);
    if (r.slug) done.add(r.slug);
  }
} catch (e) { console.error("Could not load live posts for dedupe (non-fatal):", e instanceof Error ? e.message : e); }
const SIMILARITY_MAX = 0.5; // title-token Jaccard above this = too similar, skip

// Too similar if the same industry (Branche) already has an article, or the title
// overlaps heavily. Konzept pieces are branche-agnostic explainers, so they are
// only deduped by title — never blocked because "that Branche already exists".
function tooSimilar(niche) {
  if (typeOf(niche) !== "konzept" && niche.branche && publishedKeys.has(`${niche.branche.toLowerCase()}|${typeOf(niche)}`)) return true;
  return publishedTitles.some(t => jaccard(niche.title, t) >= SIMILARITY_MAX);
}

// Prioritise Branchen with no entrenched vertical specialist (Task D): a niche
// flagged specialist:true (e.g. apotheke/friseur/kfz/steuerkanzlei have dedicated
// portals) is nudged down but not excluded — concept pieces are specialist-agnostic.
const effScore = (n) => (n.score || 0) - (n.specialist ? 8 : 0);

const pool = queue
  .filter(n => !n.published && !done.has(slugify(n.title)))
  .filter(n => !tooSimilar(n))
  .sort((a,b) => effScore(b) - effScore(a));

// Category-diverse pick: at most one article per category in a single run.
const candidates = [];
const usedCats = new Set();
for (const n of pool) {
  const cat = categoryOf(n);
  if (usedCats.has(cat)) continue;
  candidates.push(n); usedCats.add(cat);
  if (candidates.length >= COUNT) break;
}
// Fallback: if there aren't enough distinct categories available, top up by score.
if (candidates.length < COUNT) {
  for (const n of pool) {
    if (candidates.includes(n)) continue;
    candidates.push(n);
    if (candidates.length >= COUNT) break;
  }
}

// This is the failure that went unnoticed for weeks: we're past the "already
// published today" guard (so today has NO post yet) AND the queue has nothing
// eligible left. Exit NON-ZERO so the workflow alerts instead of silently no-op'ing.
if (!candidates.length) {
  console.error("[seo-content] ALERT: no post published today and the queue has no eligible niche left — refill content/queue.json.");
  setOutput("published","false");
  process.exit(1);
}
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
      category: categoryOf(niche),
      author,
      reading_time_minutes: readingTime(a.content),
      published: PUBLISH_STATE,
      published_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("blog_posts").upsert(row, { onConflict: "slug" });
    if (error) { console.error(`Supabase insert failed for "${a.slug}":`, error.message); continue; }

    niche.published = true;
    published.push({ slug: a.slug, title: a.title, branche: niche.branche, type: typeOf(niche), author, date: row.published_at, score: gate.min });
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

// Past the daily guard we had candidates but published none (all failed the quality
// gate or the insert errored). That's a real miss for the day → alert, don't hide it.
if (!slugs.length) {
  console.error(`[seo-content] ALERT: ${candidates.length} candidate(s) selected but none published (quality gate rejects or Supabase insert failures). See logs above.`);
  process.exit(1);
}
