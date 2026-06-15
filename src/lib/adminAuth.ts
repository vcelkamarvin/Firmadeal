import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, status: 401, error: "Unauthorized" };

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email === adminEmail) {
    return { ok: true as const, user };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { ok: false as const, status: 403, error: "Forbidden" };
  return { ok: true as const, user };
}
