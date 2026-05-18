import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@/lib/supabase-server";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  // Get authenticated user from session cookies
  const serverSupabase = createServerSupabaseClient();
  const { data: { user } } = await serverSupabase.auth.getUser();

  const body = await request.json();

  // Insert using service role key — bypasses RLS
  const supabase = adminClient();
  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      ...body,
      user_id: user?.id ?? null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: listing.id });
}
