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

export default function BlogArticlePage() {
  return <BlogArticleClient />;
}
