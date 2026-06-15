export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("listings")
    .select("phone, show_phone")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!data || !data.show_phone) return NextResponse.json({ phone: null });
  return NextResponse.json({ phone: data.phone });
}
