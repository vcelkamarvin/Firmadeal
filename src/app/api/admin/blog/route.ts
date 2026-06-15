export const dynamic = "force-dynamic";

import { requireAdmin } from "@/lib/adminAuth";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const body = await req.json().catch(() => ({}));
  const id = body.id;
  if (!id) return NextResponse.json({ error: "Missing post id" }, { status: 400 });

  const { error } = await adminDb()
    .from("blog_posts")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const supabase = adminDb();

  if (id) {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ post: data });
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id,title,slug,published,category,author,reading_time_minutes,created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Missing post id" }, { status: 400 });

  const allowed = [
    "title", "slug", "excerpt", "content", "category", "author",
    "reading_time_minutes", "cover_image", "published", "published_at",
  ];
  const fields: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) fields[key] = body[key];
  }

  const { error } = await adminDb()
    .from("blog_posts")
    .update(fields)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const body = await req.json();
  const allowed = [
    "title", "slug", "excerpt", "content", "category", "author",
    "reading_time_minutes", "cover_image", "published", "published_at",
  ];
  const fields: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) fields[key] = body[key];
  }

  const { error } = await adminDb()
    .from("blog_posts")
    .insert(fields);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
