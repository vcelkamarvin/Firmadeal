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

function normalizeIds(value: unknown) {
  if (typeof value === "string" && value) return [value];
  if (Array.isArray(value)) {
    return value.filter((id): id is string => typeof id === "string" && id.length > 0);
  }
  return [];
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const body = await req.json().catch(() => ({}));
  const ids = normalizeIds(body.ids ?? body.id);
  if (ids.length === 0) return NextResponse.json({ error: "Missing listing id" }, { status: 400 });

  const { error } = await adminDb()
    .from("listings")
    .delete()
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const filter = searchParams.get("filter") ?? "all";
  const supabase = adminDb();

  if (id) {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json({ listing: data });
  }

  let query = supabase
    .from("listings")
    .select("id,title,status,plan,city,category,views_count,inquiries_count,asking_price,created_at")
    .order("created_at", { ascending: false });

  if (filter !== "all") query = query.eq("status", filter);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ listings: data ?? [] });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const body = await req.json();
  const ids = normalizeIds(body.ids ?? body.id);
  const { status } = body;

  if (ids.length === 0) return NextResponse.json({ error: "Missing listing id" }, { status: 400 });
  if (!status) return NextResponse.json({ error: "Missing status" }, { status: 400 });

  const { error } = await adminDb()
    .from("listings")
    .update({ status, updated_at: new Date().toISOString() })
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
