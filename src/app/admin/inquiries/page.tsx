export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export default async function AdminInquiries() {
  const supabase = adminClient();

  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("id,sender_name,sender_email,message,created_at,listing_id,inquiry_type,listings(title,city)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Anfragen ({inquiries?.length ?? 0})</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {(inquiries ?? []).map((inq) => (
          <div key={inq.id} style={{ background: "white", borderRadius: 10, border: "1px solid #e5e5e5", padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{inq.sender_name}</p>
                <p style={{ fontSize: 12, color: "#999", margin: "2px 0 0" }}>{inq.sender_email}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 12, color: "#2d5a3d", fontWeight: 600, margin: 0 }}>
                  {(inq.listings as any)?.title?.slice(0, 40)}
                </p>
                <p style={{ fontSize: 11, color: "#999", margin: "2px 0 0" }}>
                  {new Date(inq.created_at).toLocaleDateString("de-DE")} · {inq.inquiry_type ?? "inquiry"}
                </p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#555", margin: 0, lineHeight: 1.5 }}>{inq.message}</p>
          </div>
        ))}
        {(!inquiries || inquiries.length === 0) && (
          <p style={{ color: "#999", textAlign: "center", padding: 40 }}>Noch keine Anfragen.</p>
        )}
      </div>
    </div>
  );
}
