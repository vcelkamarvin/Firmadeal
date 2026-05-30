import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import InstantlyStats from "@/components/InstantlyStats";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function AdminDashboard() {
  const supabase = adminClient();

  const [
    { count: totalListings },
    { count: activeListings },
    { count: totalUsers },
    { count: totalInquiries },
    { data: recentListings },
    { data: recentUsers },
  ] = await Promise.all([
    supabase.from("listings").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
    supabase.from("listings").select("id,title,status,plan,city,views_count,inquiries_count,created_at").order("created_at", { ascending: false }).limit(5),
    supabase.from("profiles").select("id,email,full_name,created_at").order("created_at", { ascending: false }).limit(5),
  ]);

  const stats = [
    { label: "Inserate gesamt",  value: totalListings  ?? 0, sub: `${activeListings ?? 0} aktiv` },
    { label: "Nutzer",           value: totalUsers     ?? 0, sub: "Registrierte Accounts" },
    { label: "Käuferanfragen",   value: totalInquiries ?? 0, sub: "alle Inserate" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: "#111" }}>Übersicht</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            background: "white", borderRadius: 10, padding: 20, border: "1px solid #e5e5e5",
          }}>
            <p style={{ fontSize: 28, fontWeight: 700, color: "#1a3329", margin: 0 }}>
              {stat.value.toLocaleString("de-DE")}
            </p>
            <p style={{ fontSize: 14, fontWeight: 600, color: "#333", margin: "4px 0 2px" }}>{stat.label}</p>
            <p style={{ fontSize: 12, color: "#999", margin: 0 }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent listings */}
        <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e5e5", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Neueste Inserate</h2>
            <Link href="/admin/listings" style={{ fontSize: 13, color: "#2d5a3d", textDecoration: "none" }}>Alle →</Link>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {(recentListings ?? []).map((listing) => (
                <tr key={listing.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 20px" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "#111" }}>
                      {listing.title?.slice(0, 45)}{listing.title?.length > 45 ? "…" : ""}
                    </p>
                    <p style={{ fontSize: 12, color: "#999", margin: "2px 0 0" }}>
                      {listing.city} · {listing.plan} · {listing.views_count} Aufrufe
                    </p>
                  </td>
                  <td style={{ padding: "12px 20px", textAlign: "right" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 100,
                      background: listing.status === "active" ? "#e8f5ed" : "#f5f5f5",
                      color: listing.status === "active" ? "#2d5a3d" : "#888",
                    }}>
                      {listing.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent users */}
        <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e5e5", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Neueste Nutzer</h2>
            <Link href="/admin/users" style={{ fontSize: 13, color: "#2d5a3d", textDecoration: "none" }}>Alle →</Link>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {(recentUsers ?? []).map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 20px" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: "#111" }}>
                      {user.full_name || "Kein Name"}
                    </p>
                    <p style={{ fontSize: 12, color: "#999", margin: "2px 0 0" }}>{user.email}</p>
                  </td>
                  <td style={{ padding: "12px 20px", textAlign: "right" }}>
                    <p style={{ fontSize: 11, color: "#999", margin: 0 }}>
                      {new Date(user.created_at).toLocaleDateString("de-DE")}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <InstantlyStats />
    </div>
  );
}
