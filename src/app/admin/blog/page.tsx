"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function AdminBlog() {
  const supabase = createClient();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPosts(); }, []);

  async function loadPosts() {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("id,title,slug,published,category,reading_time_min,created_at")
      .order("created_at", { ascending: false });
    setPosts(data ?? []);
    setLoading(false);
  }

  async function togglePublish(id: string, current: boolean) {
    await supabase.from("blog_posts").update({
      published: !current,
      published_at: !current ? new Date().toISOString() : null,
    }).eq("id", id);
    loadPosts();
  }

  async function deletePost(id: string) {
    if (!confirm("Artikel wirklich löschen?")) return;
    await supabase.from("blog_posts").delete().eq("id", id);
    loadPosts();
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Blog ({posts.length} Artikel)</h1>
      </div>
      <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e5e5", overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 20, textAlign: "center", color: "#999" }}>Lädt…</p>
        ) : posts.length === 0 ? (
          <p style={{ padding: 40, textAlign: "center", color: "#999" }}>Noch keine Blogartikel.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #e5e5e5" }}>
                {["Titel", "Kategorie", "Lesezeit", "Status", "Aktionen"].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, color: "#666", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{post.title}</p>
                    <p style={{ fontSize: 11, color: "#999", margin: "2px 0 0" }}>/blog/{post.slug}</p>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{post.category || "–"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{post.reading_time_min ?? "–"} Min.</td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => togglePublish(post.id, post.published)} style={{
                      fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 100,
                      border: "none", cursor: "pointer", fontFamily: "inherit",
                      background: post.published ? "#e8f5ed" : "#f5f5f5",
                      color: post.published ? "#2d5a3d" : "#888",
                    }}>
                      {post.published ? "✓ Veröffentlicht" : "○ Entwurf"}
                    </button>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <a href={`/blog/${post.slug}`} target="_blank" style={{ fontSize: 12, color: "#2d5a3d", textDecoration: "none" }}>Ansehen</a>
                      <button onClick={() => deletePost(post.id)} style={{ fontSize: 12, color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Löschen</button>
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
