# Firmadeal SEO Automation — Setup

Cloud automation (GitHub Actions). Runs **outside your machine**, generates **2 articles/day at 09:00 Berlin**, publishes them with full SEO into your repo, and pings Google Search Console. Nothing publishes unless it passes the quality gate.

## What's in this bundle
```
.github/workflows/seo-content.yml   # the cron job (07:00 & 08:00 UTC + 09:00-Berlin guard)
scripts/generate-articles.mjs       # picks niches → drafts with Claude → gate → writes MDX
scripts/quality-gate.mjs            # anti-slop gate (heuristics + Claude critic)
scripts/content-config.mjs          # brand voice, verified facts, template, banned phrases
scripts/gsc-submit.mjs              # resubmits sitemap + logs index status to GSC
content/queue.json                  # starter scored niche backlog
```
Drop these into the root of the `Firmadeal` repo (keep the paths).

## 1. Secrets (GitHub → Settings → Secrets and variables → Actions)
- `ANTHROPIC_API_KEY` — your Anthropic API key.
- `GOOGLE_SERVICE_ACCOUNT_JSON` — full JSON of a Google service account (one line). Steps:
  1. Google Cloud Console → create a service account → create a JSON key.
  2. Enable the **Search Console API** for that project.
  3. In Google Search Console → Settings → Users and permissions → add the service-account email as **Owner** (or Full) on the `firmadeal.de` domain property.

## 2. Repo prerequisite — the render route
The generator writes articles to `src/content/ratgeber/<slug>.mdx` with frontmatter that includes a `jsonld` array. You need a Next.js route to render them and inject the schema:
- `app/ratgeber/[slug]/page.tsx` — reads the MDX, renders body + FAQ, and outputs the `jsonld` via a `<script type="application/ld+json">`.
- Make sure `sitemap.ts` includes `/ratgeber/*` slugs (so the GSC sitemap resubmit surfaces them).
- Embed your existing `ValuationCalculator` + `KaufgesucheSection` in the article layout for the conversion tie-in.
(Your Claude Code agent can scaffold this route from the frontmatter shape in `generate-articles.mjs`.)

## 3. The 09:00 Berlin timing (DST-safe)
GitHub cron is UTC-only and can't follow daylight saving. The workflow fires at **07:00 and 08:00 UTC**, and `generate-articles.mjs` exits unless the current **Europe/Berlin** hour is `09`. Result: exactly one run proceeds, at 09:00 Berlin, summer and winter. No drift.

## 4. Volume & ramp
- Default `ARTICLE_COUNT=2` per run. Keep it at 2/day for the first 2–3 weeks.
- Do **not** crank this to 50/day — a sudden flood of pages is a spam signal. Ramp slowly only if quality holds and pages get impressions.
- The queue currently holds 8 niches; refill `content/queue.json` (or have the `niche-engine` skill generate more) before it empties.

## 5. Quality gate (so this never publishes slop)
`quality-gate.mjs` blocks publishing if: under ~800 words, contains a banned phrase, missing internal links, <4 FAQ, no sources, the critic flags invented numbers, or any critical dimension (information gain / E-E-A-T / German quality) scores below 7/10. Held drafts land in `content/needs-review/` as JSON — **review these weekly**; they're your quality early-warning.

## 6. Keeping figures real (important)
Claude may only use numbers present in `scripts/content-config.mjs → eeatFacts`. Before scaling, replace the placeholder facts with figures from sources you trust (IDW S1, DUB KMU Multiples, KfW Nachfolgemonitoring, IHK/HWK, KBV/BStBK). If a branche has no specific multiples listed, the prompt forbids inventing them. This is both SEO (Information Gain / E-E-A-T) and legal hygiene.

## 7. Run it / test it
- Manual test: Actions tab → "SEO Content" → **Run workflow** → set `force = true` to bypass the time guard. Watch it generate, gate, commit, and ping GSC.
- First real auto-run: next 09:00 Berlin.

## 8. Cost (rough)
2 articles/day = ~4 Claude calls/day (2 drafts + 2 critic). With Sonnet that's a few cents per article — on the order of a couple euros/month at this volume. Set `MODEL` in the workflow env to change (e.g. opus for higher quality, haiku for the critic to save cost).

## 9. Honest notes
- This is "automatically **gated**," not blind mass-publishing. Keep the weekly review of `needs-review/` and spot-check a few live pages.
- There is no legitimate way to make content "undetectable as AI," and you don't need one — Google ranks on value, not on author type. The gate + real facts + a real author byline (Albert Laurin, set in `generate-articles.mjs`) are what make these pages durable.
- The Indexing API is intentionally NOT used (it's only sanctioned for job/livestream pages). Sitemap resubmission is the correct signal for articles.
- Watch results in Search Console; rewrite or prune any page that gets impressions but no clicks after ~6–8 weeks.
```
