import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import BlogArticleClient from "./BlogArticleClient";

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const { data: post } = await db()
    .from("blog_posts")
    .select("title, excerpt, cover_image")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  if (!post) return { title: "Artikel nicht gefunden | Firmadeal" };

  const ogImage = post.cover_image ?? "https://www.firmadeal.de/og-default.png";

  return {
    title:       post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title:       post.title,
      description: post.excerpt ?? undefined,
      images:      [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
      type:        "article",
      url:         `https://www.firmadeal.de/blog/${params.slug}`,
    },
    alternates: { canonical: `https://www.firmadeal.de/blog/${params.slug}` },
  };
}

export default async function BlogArticlePage({ params }: { params: { slug: string } }) {
  const { data: post } = await db()
    .from("blog_posts")
    .select("title, excerpt, published_at, category")
    .eq("slug", params.slug)
    .eq("published", true)
    .single();

  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt ?? undefined,
        datePublished: post.published_at ?? undefined,
        publisher: {
          "@type": "Organization",
          name: "Firmadeal.de",
          url: "https://www.firmadeal.de",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://www.firmadeal.de/blog/${params.slug}`,
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
