import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import BlogArticleClient from "./BlogArticleClient";

const CATEGORY_DE: Record<string, string> = {
  verkauf: "Unternehmen verkaufen",
  kauf: "Unternehmen kaufen",
  bewertung: "Unternehmensbewertung",
  nachfolge: "Unternehmensnachfolge",
  ratgeber: "Ratgeber",
};

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await db()
    .from("blog_posts")
    .select("title, excerpt, cover_image, author, category, published_at, updated_at")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) return { title: "Artikel nicht gefunden | Firmadeal" };

  const url = `https://www.firmadeal.de/blog/${slug}`;
  const ogImage = post.cover_image ?? "https://www.firmadeal.de/og-default.png";
  const section = CATEGORY_DE[post.category] ?? "Ratgeber";

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    authors: post.author ? [{ name: post.author }] : undefined,
    keywords: ["Unternehmen verkaufen", "Unternehmensnachfolge", section, "Firmadeal", "Unternehmensbewertung"],
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      url,
      type: "article",
      siteName: "Firmadeal",
      locale: "de_DE",
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? post.published_at ?? undefined,
      authors: post.author ? [post.author] : undefined,
      section,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt ?? undefined,
      images: [ogImage],
    },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: post } = await db()
    .from("blog_posts")
    .select("title, excerpt, cover_image, author, published_at, updated_at, category")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  const url = `https://www.firmadeal.de/blog/${slug}`;
  const section = post ? (CATEGORY_DE[post.category] ?? "Ratgeber") : undefined;

  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt ?? undefined,
        image: post.cover_image ?? "https://www.firmadeal.de/og-default.png",
        inLanguage: "de-DE",
        articleSection: section,
        datePublished: post.published_at ?? undefined,
        dateModified: post.updated_at ?? post.published_at ?? undefined,
        author: post.author ? { "@type": "Person", name: post.author } : undefined,
        publisher: {
          "@type": "Organization",
          name: "Firmadeal.de",
          url: "https://www.firmadeal.de",
          logo: { "@type": "ImageObject", url: "https://www.firmadeal.de/og-default.png" },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <BlogArticleClient />
    </>
  );
}
