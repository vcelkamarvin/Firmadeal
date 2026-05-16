"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useLanguage } from "@/context/LanguageContext";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  reading_time_minutes: number;
  published_at: string;
}

const CATEGORY_LABELS: Record<string, { de: string; en: string; color: string }> = {
  verkauf:    { de: "Unternehmen verkaufen", en: "Sell a business", color: "#2d5a3d" },
  kauf:       { de: "Unternehmen kaufen", en: "Buy a business", color: "#1d4ed8" },
  bewertung:  { de: "Bewertung", en: "Valuation", color: "#7c3aed" },
  nachfolge:  { de: "Nachfolge", en: "Succession", color: "#d97706" },
  ratgeber:   { de: "Ratgeber", en: "Guides", color: "#0891b2" },
};

export default function BlogPage() {
  const { lang } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, category, author, reading_time_minutes, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setPosts(data ?? []);
        setLoading(false);
      });
  }, []);

  const filtered = selectedCategory ? posts.filter((p) => p.category === selectedCategory) : posts;
  const categories = Array.from(new Set(posts.map((p) => p.category)));

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      {/* Hero */}
      <div className="bg-[var(--accent)] py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="font-mono text-[11px] text-white/50 uppercase tracking-widest mb-2">
            {lang === "de" ? "Wissen & Ratgeber" : "Knowledge & Guides"}
          </div>
          <h1 className="font-sans text-[clamp(26px,4vw,42px)] font-bold text-white tracking-tight">
            {lang === "de" ? "Firmadeal Ratgeber" : "Firmadeal Guides"}
          </h1>
          <p className="font-sans text-[15px] text-white/70 mt-2 max-w-xl">
            {lang === "de"
              ? "Expertenwissen zu Unternehmenskauf, -verkauf, Bewertung und Nachfolge im DACH-Raum."
              : "Expert knowledge on buying, selling, valuation and succession in the DACH region."}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-1.5 rounded-full font-sans text-[13px] font-semibold border transition-colors ${
              !selectedCategory
                ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                : "bg-white text-[var(--ink)] border-[var(--border)] hover:border-[var(--accent)]"
            }`}
          >
            {lang === "de" ? "Alle" : "All"}
          </button>
          {categories.map((cat) => {
            const info = CATEGORY_LABELS[cat];
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === selectedCategory ? "" : cat)}
                className={`px-4 py-1.5 rounded-full font-sans text-[13px] font-semibold border transition-colors ${
                  selectedCategory === cat
                    ? "text-white border-transparent"
                    : "bg-white text-[var(--ink)] border-[var(--border)] hover:border-[var(--accent)]"
                }`}
                style={selectedCategory === cat ? { background: info?.color ?? "#2d5a3d" } : {}}
              >
                {lang === "de" ? info?.de : info?.en} {info ? "" : cat}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-[var(--border)] rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => {
              const catInfo = CATEGORY_LABELS[post.category];
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-lg hover:border-[var(--accent)] transition-all flex flex-col"
                >
                  {/* Color accent bar */}
                  <div className="h-1.5" style={{ background: catInfo?.color ?? "#2d5a3d" }} />

                  <div className="p-5 flex flex-col flex-1">
                    {/* Category badge */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <Tag size={11} style={{ color: catInfo?.color ?? "#2d5a3d" }} />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: catInfo?.color ?? "#2d5a3d" }}>
                        {lang === "de" ? catInfo?.de : catInfo?.en}
                      </span>
                    </div>

                    <h2 className="font-sans text-[16px] font-bold text-[var(--ink)] leading-snug mb-2 group-hover:text-[var(--accent)] transition-colors flex-1">
                      {post.title}
                    </h2>

                    <p className="font-sans text-[13px] text-[var(--muted)] leading-relaxed line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1 font-sans text-[11px] text-[var(--muted)]">
                        <Clock size={11} />
                        {post.reading_time_minutes} {lang === "de" ? "Min." : "min read"}
                      </div>
                      <span className="font-sans text-[12px] text-[var(--accent)] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        {lang === "de" ? "Lesen" : "Read"} <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-sans text-[var(--muted)]">
              {lang === "de" ? "Keine Artikel in dieser Kategorie." : "No articles in this category."}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-[var(--accent-light)] border border-[var(--accent)]/30 rounded-2xl p-8 text-center">
          <h3 className="font-sans text-[20px] font-bold text-[var(--accent)] mb-2">
            {lang === "de" ? "Bereit, Ihr Unternehmen zu inserieren?" : "Ready to list your business?"}
          </h3>
          <p className="font-sans text-[14px] text-[var(--muted)] mb-4">
            {lang === "de"
              ? "Kostenloses Inserat erstellen und Käufer aus dem ganzen DACH-Raum erreichen."
              : "Create a free listing and reach buyers across the DACH region."}
          </p>
          <Link
            href="/sell"
            className="inline-block px-6 py-2.5 bg-[var(--accent)] text-white font-sans font-bold text-[14px] rounded-full hover:bg-[var(--accent-hover)] transition-colors"
          >
            {lang === "de" ? "Jetzt inserieren" : "List now"}
          </Link>
        </div>
      </div>
    </div>
  );
}
