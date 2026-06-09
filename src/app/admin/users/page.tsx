export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function AdminUsers() {
  const supabase = adminClient();

  const [{ data: users }, { data: listingCounts }] = await Promise.all([
    supabase.from("profiles").select("id,email,full_name,created_at,role,is_admin").order("created_at", { ascending: false }),
    supabase.from("listings").select("user_id").eq("status", "active"),
  ]);

  const countMap: Record<string, number> = {};
  (listingCounts ?? []).forEach((l) => {
    countMap[l.user_id] = (countMap[l.user_id] ?? 0) + 1;
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Nutzer ({users?.length ?? 0})</h1>
      <div className="admin-table-scroll" style={{ background: "white", borderRadius: 10, border: "1px solid #e5e5e5", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #e5e5e5" }}>
              {["Name", "E-Mail", "Aktive Inserate", "Registriert", "Rolle"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((user) => (
              <tr key={user.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600 }}>{user.full_name || "–"}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{user.email}</td>
                <td style={{ padding: "12px 16px", fontSize: 13 }}>{countMap[user.id] ?? 0}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: "#999" }}>
                  {new Date(user.created_at).toLocaleDateString("de-DE")}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 100,
                    background: user.is_admin ? "#fef3cd" : "#f5f5f5",
                    color: user.is_admin ? "#92600a" : "#666",
                  }}>
                    {user.is_admin ? "admin" : (user.role ?? "seller")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
