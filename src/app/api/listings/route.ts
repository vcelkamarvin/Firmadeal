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

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const body = await request.json();

  // Whitelist allowed fields — never spread raw body to prevent field injection
  const allowed = [
    "title", "category", "description", "location", "price", "price_negotiable",
    "annual_revenue", "ebitda", "employees", "founded_year", "industry",
    "contact_name", "contact_email", "contact_phone", "website", "images",
  ];
  const safeFields: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) safeFields[key] = body[key];
  }

  // Insert using service role key — bypasses RLS
  const supabase = adminClient();
  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      ...safeFields,
      user_id: user.id,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: listing.id });
}
