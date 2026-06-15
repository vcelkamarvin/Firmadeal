export const dynamic = "force-dynamic";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: any) {
          cookiesToSet.forEach(({ name, value, options }: any) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  // Use service role key to perform privileged operations
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch user's listing IDs first, then delete related data
  const { data: userListings } = await admin
    .from("listings").select("id").eq("user_id", user.id);
  if (userListings && userListings.length > 0) {
    const ids = userListings.map((l: { id: string }) => l.id);
    await admin.from("inquiries").delete().in("listing_id", ids);
  }
  await admin.from("listings").delete().eq("user_id", user.id);
  await admin.auth.admin.deleteUser(user.id);

  return NextResponse.json({ success: true });
}
