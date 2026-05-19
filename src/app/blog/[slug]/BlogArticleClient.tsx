"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Tag, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";

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
        // parse markdown client-side
        try {
          const { marked } = await import("marked");
          setHtml(marked(data.content) as string);
        } catch {
          setHtml(`<p>${data.content.replace(/\n/g, "<br/>")}</p>`);
        }
        // fetch related
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

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center gap-2">
          <Link href="/blog" className="flex items-center gap-1.5 font-sans text-[12px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors">
            <ArrowLeft size={12} /> {lang === "de" ? "Ratgeber" : "Guides"}
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

            <h1 className="font-sans text-[clamp(22px,3.5vw,36px)] font-bold text-[var(--ink)] leading-tight tracking-tight mb-4">
              {post.title}
            </h1>

            <p className="font-sans text-[16px] text-[var(--muted)] leading-relaxed mb-8 border-l-4 pl-4" style={{ borderColor: catInfo?.color ?? "#2d5a3d" }}>
              {post.excerpt}
            </p>

            {/* Article body */}
            <div
              className="prose prose-lg max-w-none font-sans text-[var(--ink)]
                prose-headings:font-sans prose-headings:font-bold prose-headings:text-[var(--ink)] prose-headings:tracking-tight
                prose-h1:text-[28px] prose-h2:text-[20px] prose-h3:text-[17px]
                prose-p:text-[15px] prose-p:leading-relaxed prose-p:text-[var(--ink)]
                prose-li:text-[15px] prose-li:text-[var(--ink)]
                prose-strong:font-bold prose-strong:text-[var(--ink)]
                prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-4 prose-blockquote:border-[var(--accent)] prose-blockquote:pl-4 prose-blockquote:text-[var(--muted)]
                prose-table:font-sans prose-th:font-semibold prose-th:text-[var(--ink)]
                prose-code:font-mono prose-code:text-sm prose-code:bg-[var(--surface2)] prose-code:px-1 prose-code:py-0.5 prose-code:rounded"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <div className="mt-8 pt-8 border-t border-[var(--border)]">
              <p className="font-sans text-[12px] text-[var(--muted)]">
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
                  href="/#bewertung"
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
    </div>
  );
}
