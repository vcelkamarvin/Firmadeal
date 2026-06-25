"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Tag, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";
import { BRANCHEN as PSEO_BRANCHEN, REGIONEN as PSEO_REGIONEN } from "../../unternehmenswert/pseoData";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  reading_time_minutes: number;
  published_at: string;
}

const CATEGORY_LABELS: Record<string, { de: string; en: string; color: string }> = {
  verkauf:   { de: "Unternehmen verkaufen", en: "Sell a business", color: "#2d5a3d" },
  kauf:      { de: "Unternehmen kaufen", en: "Buy a business", color: "#1d4ed8" },
  bewertung: { de: "Bewertung", en: "Valuation", color: "#7c3aed" },
  nachfolge: { de: "Nachfolge", en: "Succession", color: "#d97706" },
  ratgeber:  { de: "Ratgeber", en: "Guides", color: "#0891b2" },
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9äöüß]/g, "");

// Remove a leading markdown heading if it just repeats the article title
function stripLeadingTitle(md: string, title: string): string {
  const lines = md.split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i < lines.length && /^#{1,3}\s+/.test(lines[i])) {
    const headingText = lines[i].replace(/^#{1,3}\s+/, "").trim();
    const a = norm(headingText), b = norm(title);
    if (a && b && (a === b || a.includes(b) || b.includes(a))) {
      lines.splice(i, 1);
      return lines.join("\n");
    }
  }
  return md;
}

export default function BlogArticleClient() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<Omit<BlogPost, "content">[]>([]);
  const [loading, setLoading] = useState(true);
  const [html, setHtml] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .single()
      .then(async ({ data, error }) => {
        if (error || !data) { router.replace("/blog"); return; }
        setPost(data);
        try {
          const { marked } = await import("marked");
          const md = stripLeadingTitle(data.content ?? "", data.title ?? "");
          let h = marked(md) as string;
          // Only one H1 on the page (the title) — demote any content H1 to H2
          h = h.replace(/<h1(\s|>)/g, "<h2$1").replace(/<\/h1>/g, "</h2>");
          setHtml(h);
        } catch {
          setHtml(`<p>${(data.content ?? "").replace(/\n/g, "<br/>")}</p>`);
        }
        supabase
          .from("blog_posts")
          .select("id, slug, title, excerpt, category, author, reading_time_minutes, published_at")
          .eq("published", true)
          .eq("category", data.category)
          .neq("slug", slug)
          .limit(3)
          .then(({ data: rel }) => setRelated(rel ?? []));
        setLoading(false);
      });
  }, [slug, router]);

  if (loading) return <div className="min-h-screen bg-[var(--bg)]" />;
  if (!post) return null;

  const catInfo = CATEGORY_LABELS[post.category];

  // ── Auto contextual internal links (applies to every post, no per-post work) ──
  // Detect the Branche + Region this post is about and deep-link to the matching
  // programmatic valuation page; otherwise fall back to the hub.
  const hay = norm(`${post.title} ${post.slug} ${post.excerpt ?? ""}`);
  const mBranche = PSEO_BRANCHEN.find((b) => hay.includes(norm(b.label)) || hay.includes(b.slug.replace(/-/g, "")));
  const mRegion = PSEO_REGIONEN.find((r) => hay.includes(norm(r.name)) || hay.includes(r.slug.replace(/-/g, "")));
  const valHref = mBranche && mRegion ? `/unternehmenswert/${mBranche.slug}/${mRegion.slug}` : "/unternehmenswert";
  const valLabel = mBranche && mRegion
    ? (lang === "de"
        ? `Was ist ein ${mBranche.label} in ${mRegion.name} wert? – Sofort-Bewertung`
        : `What is a ${mBranche.label} in ${mRegion.name} worth? – Instant valuation`)
    : (lang === "de" ? "Unternehmenswert berechnen – kostenlose Sofort-Bewertung" : "Calculate your company value – free instant valuation");

  const relatedLinks: { href: string; label: string }[] = [
    { href: valHref, label: valLabel },
    ...(mBranche && mRegion ? [{ href: "/unternehmenswert", label: lang === "de" ? "Unternehmenswert-Rechner (alle Branchen & Regionen)" : "Valuation calculator (all sectors & regions)" }] : []),
    { href: "/kaufgesuche", label: lang === "de" ? "Aktuelle Kaufgesuche – wer sucht gerade ein Unternehmen?" : "Current buyer requests – who is looking right now?" },
    { href: "/listings", label: lang === "de" ? "Unternehmen zum Verkauf ansehen" : "Browse businesses for sale" },
  ];

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center gap-2">
          <Link href="/blog" className="flex items-center gap-1.5 font-sans text-[12px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
            <ArrowLeft size={12} /> Blog
          </Link>
          <span className="text-[var(--border)]">/</span>
          <span className="font-sans text-[12px] text-[var(--ink)] truncate">{post.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── MAIN ARTICLE ── */}
          <article className="flex-1 min-w-0">
            {/* Category + meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full text-white"
                style={{ background: catInfo?.color ?? "#2d5a3d" }}
              >
                <Tag size={10} />
                {lang === "de" ? catInfo?.de : catInfo?.en}
              </span>
              <span className="flex items-center gap-1 font-sans text-[12px] text-[var(--muted)]">
                <Clock size={11} /> {post.reading_time_minutes} {lang === "de" ? "Min. Lesezeit" : "min read"}
              </span>
              <span className="flex items-center gap-1 font-sans text-[12px] text-[var(--muted)]">
                <Calendar size={11} /> {new Date(post.published_at).toLocaleDateString("de-DE")}
              </span>
            </div>

            <h1 className="font-sans text-[clamp(26px,4vw,40px)] font-bold text-[var(--ink)] leading-tight tracking-tight mb-4">
              {post.title}
            </h1>

            <p className="font-sans text-[17px] text-[var(--muted)] leading-relaxed mb-9 border-l-4 pl-4" style={{ borderColor: catInfo?.color ?? "#2d5a3d" }}>
              {post.excerpt}
            </p>

            {/* Article body — explicit typography, plugin-independent */}
            <div className="fd-article" dangerouslySetInnerHTML={{ __html: html }} />

            {/* ── AUTO: contextual internal links ── */}
            <div className="mt-10 rounded-xl border border-[var(--border)] bg-white p-5">
              <div className="font-sans text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] mb-3">
                {lang === "de" ? "Mehr zum Thema" : "Related"}
              </div>
              <ul className="space-y-2.5">
                {relatedLinks.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="font-sans text-[14px] text-[var(--accent)] font-semibold hover:underline">
                      → {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── AUTO: end-of-article CTA ── */}
            <div className="mt-6 rounded-2xl p-6 sm:p-7 text-white" style={{ background: "#1a3329" }}>
              <div className="font-sans text-[19px] font-bold leading-snug mb-1.5">
                {lang === "de" ? "Bereit, den Wert in einen Verkauf zu verwandeln?" : "Ready to turn that value into a sale?"}
              </div>
              <p className="font-sans text-[14px] leading-relaxed mb-4" style={{ color: "#9ec7b1" }}>
                {lang === "de"
                  ? "Kostenlose Bewertung in 60 Sekunden — danach anonym einreichen. 0 % Provision, einmalig €87."
                  : "Free valuation in 60 seconds — then submit anonymously. 0% commission, one-time €87."}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={valHref} className="font-sans font-bold text-[14px] px-5 py-3 rounded-xl" style={{ background: "#f3ece0", color: "#15281e" }}>
                  {lang === "de" ? "Unternehmenswert berechnen" : "Calculate company value"}
                </Link>
                <Link href="/sell" className="font-sans font-bold text-[14px] px-5 py-3 rounded-xl border" style={{ borderColor: "#3f6e54", color: "#fff" }}>
                  {lang === "de" ? "Unternehmen vertraulich einreichen →" : "Submit your business confidentially →"}
                </Link>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-[var(--border)]">
              <p className="font-sans text-[13px] text-[var(--muted)]">
                {lang === "de" ? "Verfasst von" : "Written by"} <strong className="text-[var(--ink)]">{post.author}</strong>
              </p>
            </div>
          </article>

          {/* ── STICKY SIDEBAR ── */}
          <aside className="w-full lg:w-[280px] flex-shrink-0 space-y-6">
            <div style={{ position: "sticky", top: 70 }} className="space-y-5">

              {/* CTA box */}
              <div className="bg-[var(--accent)] rounded-xl p-5 text-white">
                <div className="font-sans text-[11px] font-bold uppercase tracking-widest text-white/60 mb-2">
                  {lang === "de" ? "Ihr nächster Schritt" : "Your next step"}
                </div>
                <h3 className="font-sans text-[17px] font-bold leading-snug mb-3">
                  {lang === "de"
                    ? "Kostenlos inserieren und Käufer finden"
                    : "List for free and find buyers"}
                </h3>
                <Link
                  href="/sell"
                  className="block w-full text-center py-2.5 bg-white text-[var(--accent)] font-sans font-bold text-[13px] rounded-xl hover:bg-white/90 transition-colors"
                >
                  {lang === "de" ? "Jetzt inserieren" : "List now"}
                </Link>
              </div>

              {/* Valuation CTA */}
              <div className="bg-white border border-[var(--border)] rounded-xl p-5">
                <div className="font-sans text-[13px] font-bold text-[var(--ink)] mb-2">
                  {lang === "de" ? "Was ist Ihr Unternehmen wert?" : "What is your business worth?"}
                </div>
                <p className="font-sans text-[12px] text-[var(--muted)] mb-3">
                  {lang === "de"
                    ? "Kostenlose Schnellbewertung in 60 Sekunden."
                    : "Free quick valuation in 60 seconds."}
                </p>
                <Link
                  href={valHref}
                  className="block w-full text-center py-2 bg-[var(--accent-light)] text-[var(--accent)] font-sans font-semibold text-[13px] rounded-lg hover:bg-[var(--accent)] hover:text-white transition-colors"
                >
                  {lang === "de" ? "Bewertung starten" : "Start valuation"}
                </Link>
              </div>

              {/* Related articles */}
              {related.length > 0 && (
                <div className="bg-white border border-[var(--border)] rounded-xl p-5">
                  <div className="font-sans text-[11px] font-bold uppercase tracking-widest text-[var(--muted)] mb-3">
                    {lang === "de" ? "Weitere Artikel" : "More articles"}
                  </div>
                  <div className="space-y-3">
                    {related.map((r) => (
                      <Link
                        key={r.id}
                        href={`/blog/${r.slug}`}
                        className="block group"
                      >
                        <div className="font-sans text-[13px] font-semibold text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                          {r.title}
                        </div>
                        <div className="font-sans text-[11px] text-[var(--muted)] mt-0.5 flex items-center gap-1">
                          <Clock size={10} /> {r.reading_time_minutes} min
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* All articles */}
              <Link
                href="/blog"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 border border-[var(--border)] rounded-xl font-sans text-[13px] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
              >
                <ArrowLeft size={12} />
                {lang === "de" ? "Alle Artikel" : "All articles"}
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <style jsx global>{`
        .fd-article{color:var(--ink);font-size:16.5px;line-height:1.8}
        .fd-article > *:first-child{margin-top:0}
        .fd-article h1,.fd-article h2,.fd-article h3,.fd-article h4{font-family:var(--font-sans,inherit);color:var(--ink);font-weight:700;letter-spacing:-.01em}
        .fd-article h2{font-size:25px;line-height:1.25;margin:2.6rem 0 .9rem;padding-top:.4rem}
        .fd-article h3{font-size:19px;line-height:1.3;margin:2rem 0 .6rem}
        .fd-article h4{font-size:16.5px;margin:1.6rem 0 .5rem}
        .fd-article p{margin:0 0 1.2rem}
        .fd-article ul,.fd-article ol{margin:0 0 1.35rem;padding-left:1.4rem}
        .fd-article li{margin:.45rem 0;line-height:1.75}
        .fd-article li::marker{color:var(--accent)}
        .fd-article a{color:var(--accent);text-decoration:underline;text-underline-offset:2px;font-weight:500}
        .fd-article a:hover{opacity:.8}
        .fd-article strong{font-weight:700;color:var(--ink)}
        .fd-article blockquote{border-left:4px solid var(--accent);margin:1.6rem 0;padding:.3rem 0 .3rem 1.1rem;color:var(--muted);font-style:italic}
        .fd-article hr{border:0;border-top:1px solid var(--border);margin:2.4rem 0}
        .fd-article table{width:100%;border-collapse:collapse;margin:1.6rem 0;font-size:15px}
        .fd-article th,.fd-article td{border:1px solid var(--border);padding:.6rem .85rem;text-align:left;vertical-align:top}
        .fd-article th{background:var(--surface2);font-weight:600}
        .fd-article code{font-family:var(--font-mono,monospace);background:var(--surface2);padding:.12rem .38rem;border-radius:4px;font-size:.9em}
        .fd-article h2+p,.fd-article h3+p,.fd-article h2+ul,.fd-article h3+ul{margin-top:0}
        .fd-article img{max-width:100%;height:auto;border-radius:10px;margin:1.6rem 0}
      `}</style>
    </div>
  );
}
