export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function DELETE() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  // delete_own_account() is a SECURITY DEFINER function that deletes
  // the authenticated user's listings, inquiries, profile, and auth record.
  const { error } = await supabase.rpc("delete_own_account");

  if (error) {
    console.error("[delete-account] error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
