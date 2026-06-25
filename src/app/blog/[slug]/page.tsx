import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import BlogArticleClient from "./BlogArticleClient";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

const SECTION: Record<string, string> = {
  verkauf: "Unternehmen verkaufen",
  kauf: "Unternehmen kaufen",
  bewertung: "Unternehmensbewertung",
  nachfolge: "Unternehmensnachfolge",
  ratgeber: "Ratgeber",
};

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const { data: post } = await db()
    .from("blog_posts")
    .select("title, excerpt, cover_image, author, category, published_at")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) return { title: "Artikel nicht gefunden | Firmadeal" };

  const ogImage = post.cover_image ?? "https://www.firmadeal.de/og-default.png";
  const url = `https://www.firmadeal.de/blog/${slug}`;
  const section = SECTION[post.category] ?? "Ratgeber";

  return {
    title:       post.title,
    description: post.excerpt ?? undefined,
    keywords:    [section, "Unternehmensnachfolge", "Unternehmen verkaufen", "Firmadeal", "M&A DACH"],
    authors:     post.author ? [{ name: post.author }] : undefined,
    alternates:  { canonical: url },
    openGraph: {
      title:         post.title,
      description:   post.excerpt ?? undefined,
      images:        [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      type:          "article",
      url,
      siteName:      "Firmadeal",
      locale:        "de_DE",
      publishedTime: post.published_at ?? undefined,
      authors:       post.author ? [post.author] : undefined,
      section,
    },
    twitter: {
      card:        "summary_large_image",
      title:       post.title,
      description: post.excerpt ?? undefined,
      images:      [ogImage],
    },
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: post } = await db()
    .from("blog_posts")
    .select("title, excerpt, cover_image, published_at, updated_at, category, author")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  const url = `https://www.firmadeal.de/blog/${slug}`;
  const image = post?.cover_image ?? "https://www.firmadeal.de/og-default.png";

  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt ?? undefined,
        image,
        datePublished: post.published_at ?? undefined,
        dateModified: post.updated_at ?? post.published_at ?? undefined,
        inLanguage: "de-DE",
        articleSection: SECTION[post.category] ?? "Ratgeber",
        author: post.author
          ? { "@type": "Person", name: post.author }
          : { "@type": "Organization", name: "Firmadeal.de" },
        publisher: {
          "@type": "Organization",
          name: "Firmadeal.de",
          url: "https://www.firmadeal.de",
          logo: {
            "@type": "ImageObject",
            url: "https://www.firmadeal.de/og-default.png",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": url,
        },
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
