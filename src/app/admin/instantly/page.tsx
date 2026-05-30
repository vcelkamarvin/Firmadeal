"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface CampaignStat {
  campaign_id: string;
  campaign_name: string;
  emails_sent_count: number;
  open_count: number;
  reply_count: number;
  opportunities_count: number;
}

function openRateColor(rate: number): string {
  if (rate < 20) return "#dc2626";
  if (rate <= 35) return "#d97706";
  return "#16a34a";
}

function pct(count: number, sent: number): number {
  if (!sent) return 0;
  return Math.round((count / sent) * 1000) / 10;
}

function Skeleton() {
  return (
    <div style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{
          height: 52, background: "#e5e7eb", borderRadius: 6,
          marginBottom: 8,
        }} />
      ))}
    </div>
  );
}

export default function InstantlyPage() {
  const [campaigns, setCampaigns] = useState<CampaignStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const res = await fetch("/api/admin/instantly-stats");
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      const json = await res.json();
      // Instantly returns data under `data` array or directly as array
      const raw: CampaignStat[] = Array.isArray(json) ? json : (json.data ?? []);
      setCampaigns(raw);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => fetchStats(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  function minutesAgo(): string {
    if (!lastUpdated) return "—";
    const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
    if (diff === 0) return "gerade eben";
    return `vor ${diff} Min.`;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111", margin: 0 }}>📧 Instantly Kampagnen</h1>
          <p style={{ fontSize: 12, color: "#999", margin: "4px 0 0" }}>
            Zuletzt aktualisiert: {minutesAgo()} · Auto-refresh alle 5 Min.
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 16px", borderRadius: 8,
            background: "#1a3329", color: "white",
            border: "none", cursor: refreshing ? "not-allowed" : "pointer",
            fontSize: 13, fontWeight: 600, opacity: refreshing ? 0.6 : 1,
          }}
        >
          <RefreshCw size={14} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
          Aktualisieren
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
          padding: "12px 16px", marginBottom: 20, color: "#dc2626", fontSize: 13,
        }}>
          ⚠ Instantly API Fehler: {error}
        </div>
      )}

      {/* Table */}
      <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e5e5", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e5e5" }}>
                {["Kampagne", "Versendet", "Öffnungsrate", "Antwortrate", "Opportunities"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 16px", textAlign: "left",
                    fontFamily: "monospace", fontSize: 10,
                    color: "#888", textTransform: "uppercase", letterSpacing: "0.06em",
                    whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 20 }}>
                    <Skeleton />
                  </td>
                </tr>
              ) : campaigns.length === 0 && !error ? (
                <tr>
                  <td colSpan={5} style={{ padding: "40px 20px", textAlign: "center", color: "#999", fontSize: 13 }}>
                    Keine Kampagnendaten gefunden.
                  </td>
                </tr>
              ) : (
                campaigns.map((c, i) => {
                  const openRate = pct(c.open_count, c.emails_sent_count);
                  const replyRate = pct(c.reply_count, c.emails_sent_count);
                  return (
                    <tr key={c.campaign_id ?? i} style={{
                      borderBottom: "1px solid #f5f5f5",
                      transition: "background 0.1s",
                    }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "12px 16px", fontWeight: 500, color: "#111", maxWidth: 260 }}>
                        <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {c.campaign_name ?? "—"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#555", fontFamily: "monospace" }}>
                        {(c.emails_sent_count ?? 0).toLocaleString("de-DE")}
                      </td>
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 600, color: openRateColor(openRate) }}>
                        {openRate.toFixed(1)}%
                      </td>
                      <td style={{
                        padding: "12px 16px", fontFamily: "monospace",
                        fontWeight: replyRate > 5 ? 700 : 400,
                        color: replyRate > 5 ? "#16a34a" : "#555",
                      }}>
                        {replyRate.toFixed(1)}%
                      </td>
                      <td style={{ padding: "12px 16px", color: "#555", fontFamily: "monospace" }}>
                        {c.opportunities_count ?? 0}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        {!loading && campaigns.length > 0 && (
          <div style={{
            padding: "10px 16px", borderTop: "1px solid #f0f0f0",
            display: "flex", gap: 20, flexWrap: "wrap",
          }}>
            {[
              { color: "#dc2626", label: "Öffnungsrate < 20%" },
              { color: "#d97706", label: "20–35%" },
              { color: "#16a34a", label: "> 35%" },
            ].map(({ color, label }) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#888" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                {label}
              </span>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
