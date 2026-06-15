export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/adminAuth";
import { NextRequest, NextResponse } from "next/server";

function adminDb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Whitelist updatable fields — never spread raw body
  const allowed = [
    "title", "category", "description", "city", "region", "country",
    "asking_price", "price_confidential", "annual_revenue", "ebitda",
    "employees", "founded_year", "status", "status_business", "plan",
    "featured", "reason_for_sale", "business_model", "competition",
    "assets_included", "business_model_chips", "competition_chips",
    "assets_checklist", "transferability_data", "images",
    "type_of_operation", "vat_number", "company_name", "phone", "show_phone",
  ];
  const fields: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) fields[key] = body[key];
  }

  const { error } = await adminDb()
    .from("listings")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
