"use client";

import { useState, useEffect, useCallback } from "react";

interface CampaignStat {
  campaign_id: string;
  campaign_name: string;
  emails_sent_count: number;
  open_count: number;
  reply_count: number;
  opportunities_count: number;
}

function pct(count: number, sent: number) {
  if (!sent) return 0;
  return Math.round((count / sent) * 1000) / 10;
}

function openColor(rate: number) {
  if (rate < 20) return "#dc2626";
  if (rate <= 35) return "#d97706";
  return "#16a34a";
}

export default function InstantlyStats() {
  const [campaigns, setCampaigns] = useState<CampaignStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetch_ = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/instantly-stats");
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      const raw: CampaignStat[] = Array.isArray(json) ? json : (json.data ?? []);
      setCampaigns(raw);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
    const t = setInterval(() => fetch_(), 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [fetch_]);

  const ago = lastUpdated
    ? Math.floor((Date.now() - lastUpdated.getTime()) / 60000) === 0
      ? "gerade eben"
      : `vor ${Math.floor((Date.now() - lastUpdated.getTime()) / 60000)} Min.`
    : "—";

  return (
    <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e5e5", overflow: "hidden", marginTop: 24 }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>📧 Instantly Kampagnen</h2>
          <p style={{ fontSize: 11, color: "#999", margin: "3px 0 0" }}>Zuletzt: {ago} · Auto-refresh 5 Min.</p>
        </div>
        <button
          onClick={() => fetch_(true)}
          disabled={refreshing}
          style={{
            padding: "6px 14px", borderRadius: 6, border: "1px solid #e5e5e5",
            background: refreshing ? "#f5f5f5" : "white", cursor: refreshing ? "not-allowed" : "pointer",
            fontSize: 12, fontWeight: 600, color: "#1a3329",
          }}
        >
          {refreshing ? "..." : "↻ Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "12px 20px", background: "#fef2f2", color: "#dc2626", fontSize: 13 }}>
          ⚠ {error}
        </div>
      )}

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Kampagne", "Versendet", "Öffnungsrate", "Antwortrate", "Opportunities"].map((h) => (
                <th key={h} style={{
                  padding: "9px 16px", textAlign: "left", fontFamily: "monospace",
                  fontSize: 10, color: "#888", textTransform: "uppercase",
                  letterSpacing: "0.05em", whiteSpace: "nowrap",
                  borderBottom: "1px solid #e5e5e5",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map((i) => (
                <tr key={i}>
                  {[1, 2, 3, 4, 5].map((j) => (
                    <td key={j} style={{ padding: "12px 16px" }}>
                      <div style={{ height: 12, background: "#f0f0f0", borderRadius: 4, width: j === 1 ? 160 : 50 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "32px 20px", textAlign: "center", color: "#999", fontSize: 13 }}>
                  Keine Kampagnendaten.
                </td>
              </tr>
            ) : (
              campaigns.map((c, i) => {
                const openRate = pct(c.open_count, c.emails_sent_count);
                const replyRate = pct(c.reply_count, c.emails_sent_count);
                return (
                  <tr key={c.campaign_id ?? i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                    <td style={{ padding: "11px 16px", fontWeight: 500, color: "#111", maxWidth: 240 }}>
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.campaign_name ?? "—"}
                      </span>
                    </td>
                    <td style={{ padding: "11px 16px", fontFamily: "monospace", color: "#555" }}>
                      {(c.emails_sent_count ?? 0).toLocaleString("de-DE")}
                    </td>
                    <td style={{ padding: "11px 16px", fontFamily: "monospace", fontWeight: 600, color: openColor(openRate) }}>
                      {openRate.toFixed(1)}%
                    </td>
                    <td style={{
                      padding: "11px 16px", fontFamily: "monospace",
                      fontWeight: replyRate > 5 ? 700 : 400,
                      color: replyRate > 5 ? "#16a34a" : "#555",
                    }}>
                      {replyRate.toFixed(1)}%
                    </td>
                    <td style={{ padding: "11px 16px", fontFamily: "monospace", color: "#555" }}>
                      {c.opportunities_count ?? 0}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
