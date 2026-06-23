// Tells Google about new content after each batch.
// PRIMARY method (fully supported): resubmit the sitemap to Search Console.
// SECONDARY (optional, read-only): URL Inspection to confirm indexing status.
//
// NOTE on the Indexing API: Google's Indexing API is officially only for
// JobPosting / BroadcastEvent pages. Using it to force-index ordinary articles
// is against its intended use. The correct, durable signal for normal pages is
// the sitemap below — Google crawls new URLs from it. We do not call the
// Indexing API here on purpose.

import { google } from "googleapis";

const SITE = process.env.GSC_SITE_URL || "sc-domain:firmadeal.de";
const ORIGIN = process.env.SITE_ORIGIN || "https://www.firmadeal.de";
const SITEMAP = `${ORIGIN}/sitemap.xml`;
const NEW_URLS = (process.env.NEW_URLS || "").split(/\s+/).filter(Boolean);

async function main() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/webmasters"],
  });
  const sc = google.searchconsole({ version: "v1", auth });

  // 1) Resubmit sitemap so Google re-reads it and discovers the new URLs.
  await sc.sitemaps.submit({ siteUrl: SITE, feedpath: SITEMAP });
  console.log(`Sitemap resubmitted: ${SITEMAP}`);

  // 2) Optional: log current index status of the new URLs (read-only, best effort).
  for (const url of NEW_URLS) {
    try {
      const r = await sc.urlInspection.index.inspect({
        requestBody: { inspectionUrl: url, siteUrl: SITE, languageCode: "de" },
      });
      const v = r.data.inspectionResult?.indexStatusResult?.verdict || "UNKNOWN";
      console.log(`Index status ${url}: ${v}`);
    } catch (e) {
      console.log(`Inspection skipped for ${url}: ${e.message}`);
    }
  }
}

main().catch(e => { console.error("GSC step failed:", e.message); process.exit(1); });
