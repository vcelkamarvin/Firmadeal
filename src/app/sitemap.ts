import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { BRANCHEN, REGIONEN, INDEXABLE_REGION_SLUGS } from "./unternehmenswert/pseoData";

const BASE = "https://www.firmadeal.de";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let listings: Array<{ id: string; updated_at: string }> | null = null;
  let posts: Array<{ slug: string; updated_at: string }> | null = null;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = db();
    const [listingsRes, postsRes] = await Promise.all([
      supabase.from("listings").select("id, updated_at").eq("status", "active"),
      supabase.from("blog_posts").select("slug, updated_at").eq("published", true),
    ]);
    listings = listingsRes.data;
    posts = postsRes.data;
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,            lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/listings`, lastModified: new Date(), changeFrequency: "hourly",  priority: 0.9 },
    { url: `${BASE}/unternehmenswert`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/kaeufer`,  lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/kaufgesuche`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/sell`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/pricing`,  lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/blog`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/impressum`,   lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/datenschutz`, lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/agb`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  const listingRoutes: MetadataRoute.Sitemap = (listings ?? []).map((l) => ({
    url:             `${BASE}/listings/${l.id}`,
    lastModified:    new Date(l.updated_at ?? Date.now()),
    changeFrequency: "daily",
    priority:        0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url:             `${BASE}/blog/${p.slug}`,
    lastModified:    new Date(p.updated_at ?? Date.now()),
    changeFrequency: "weekly",
    priority:        0.6,
  }));

  // Only list the indexable regional variants (Task A) — noindexed pages must not
  // appear in the sitemap, or we invite Google to crawl what we told it to skip.
  const pseoRoutes: MetadataRoute.Sitemap = [];
  for (const b of BRANCHEN) {
    for (const r of REGIONEN) {
      if (!INDEXABLE_REGION_SLUGS.has(r.slug)) continue;
      pseoRoutes.push({
        url:             `${BASE}/unternehmenswert/${b.slug}/${r.slug}`,
        lastModified:    new Date(),
        changeFrequency: "monthly",
        priority:        0.7,
      });
    }
  }

  return [...staticRoutes, ...pseoRoutes, ...listingRoutes, ...blogRoutes];
}
