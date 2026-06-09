export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function AdminPayments() {
  const supabase = adminClient();

  const { data: payments } = await supabase
    .from("payments")
    .select("id,user_id,listing_id,plan,amount,created_at,stripe_session_id,listings(title)")
    .order("created_at", { ascending: false })
    .limit(100);

  const total = (payments ?? []).reduce((s, p) => s + (p.amount ?? 0), 0);

  return (
    <div>
      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Zahlungen ({payments?.length ?? 0})</h1>
        <div style={{ background: "white", borderRadius: 8, padding: "10px 20px", border: "1px solid #e5e5e5" }}>
          <p style={{ fontSize: 12, color: "#999", margin: 0 }}>Gesamtumsatz</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: "#1a3329", margin: 0 }}>
            €{(total / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="admin-table-scroll" style={{ background: "white", borderRadius: 10, border: "1px solid #e5e5e5", overflow: "hidden" }}>
        {(!payments || payments.length === 0) ? (
          <p style={{ padding: 40, textAlign: "center", color: "#999" }}>Noch keine Zahlungen.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #e5e5e5" }}>
                {["Inserat", "Plan", "Betrag", "Datum", "Stripe Session"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>
                    {(p.listings as any)?.title?.slice(0, 40) || p.listing_id?.slice(0, 8)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 100,
                      background: p.plan === "premium" ? "#fef3cd" : p.plan === "advanced" ? "#e8f5ed" : "#f5f5f5",
                      color: p.plan === "premium" ? "#92600a" : p.plan === "advanced" ? "#2d5a3d" : "#666",
                    }}>{p.plan}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                    €{((p.amount ?? 0) / 100).toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#999" }}>
                    {new Date(p.created_at).toLocaleDateString("de-DE")}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 11, color: "#999", fontFamily: "monospace" }}>
                    {p.stripe_session_id?.slice(0, 20)}…
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
