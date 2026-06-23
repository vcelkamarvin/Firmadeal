export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const serverSupabase = await createServerSupabaseClient();
  const { data: { user } } = await serverSupabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const body = await request.json();

  // Whitelist allowed fields — never spread raw body to prevent field injection
  const allowed = [
    "title", "category", "description", "city", "region", "country",
    "asking_price", "price_confidential", "annual_revenue", "ebitda",
    "employees", "founded_year", "status_business", "reason_for_sale",
    "business_model", "business_model_chips", "competition", "competition_chips",
    "assets_included", "assets_checklist", "transferability_data",
    "type_of_operation", "vat_number", "company_name", "phone", "show_phone",
    "images",
  ];
  const safeFields: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) safeFields[key] = body[key];
  }

  // Use the authenticated user's session — RLS policy "Users can manage own listings"
  // allows INSERT where auth.uid() = user_id, so no service role key needed
  const { data: listing, error } = await serverSupabase
    .from("listings")
    .insert({
      ...safeFields,
      user_id: user.id,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    console.error("[POST /api/listings] Supabase insert error:", error.message, error.code);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: listing.id });
}
