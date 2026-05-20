"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminListings() {
  const supabase = createClient();
  const [listings, setListings] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadListings(); }, [filter]); // eslint-disable-line

  async function loadListings() {
    setLoading(true);
    let query = supabase
      .from("listings")
      .select("id,title,status,plan,city,category,views_count,inquiries_count,asking_price,created_at")
      .order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setListings(data ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("listings").update({ status }).eq("id", id);
    loadListings();
  }

  async function deleteListing(id: string) {
    if (!confirm("Inserat wirklich löschen?")) return;
    await supabase.from("listings").delete().eq("id", id);
    loadListings();
  }

  const fmtPrice = (v: number) => v ? `€${v.toLocaleString("de-DE")}` : "–";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Inserate ({listings.length})</h1>
        <Link href="/sell" target="_blank" style={{
          background: "#1a3329", color: "white", padding: "10px 20px",
          borderRadius: 8, textDecoration: "none", fontSize: 14, fontWeight: 600,
        }}>+ Neues Inserat</Link>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "active", "draft", "paused", "expired"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 14px", borderRadius: 100, border: "1px solid #e5e5e5", cursor: "pointer",
            background: filter === f ? "#1a3329" : "white",
            color: filter === f ? "white" : "#666",
            fontSize: 13, fontFamily: "inherit",
          }}>
            {f === "all" ? "Alle" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e5e5", overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 20, textAlign: "center", color: "#999" }}>Lädt…</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #e5e5e5" }}>
                {["Titel", "Stadt", "Plan", "Preis", "Aufrufe", "Anfragen", "Status", "Aktionen"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 16px", maxWidth: 240 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.title}</p>
                    <p style={{ fontSize: 11, color: "#999", margin: "2px 0 0" }}>{l.category}</p>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{l.city}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 100,
                      background: l.plan === "premium" ? "#fef3cd" : l.plan === "advanced" ? "#e8f5ed" : "#f5f5f5",
                      color: l.plan === "premium" ? "#92600a" : l.plan === "advanced" ? "#2d5a3d" : "#666",
                    }}>{l.plan}</span>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{fmtPrice(l.asking_price)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>{l.views_count ?? 0}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>{l.inquiries_count ?? 0}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <select value={l.status} onChange={(e) => updateStatus(l.id, e.target.value)}
                      style={{ fontSize: 12, padding: "4px 8px", borderRadius: 6, border: "1px solid #e5e5e5", fontFamily: "inherit" }}>
                      {["active", "draft", "paused", "expired"].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <Link href={`/admin/listings/${l.id}/edit`} style={{ fontSize: 12, color: "#1a3329", textDecoration: "none", fontWeight: 600 }}>Bearbeiten</Link>
                      <Link href={`/listings/${l.id}`} target="_blank" style={{ fontSize: 12, color: "#2d5a3d", textDecoration: "none" }}>Ansehen</Link>
                      <button onClick={() => deleteListing(l.id)} style={{ fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Löschen</button>
                    </div>
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
