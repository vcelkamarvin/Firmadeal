"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";

const BLOG_CATEGORIES = ["verkauf", "kauf", "bewertung", "nachfolge", "ratgeber"];

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "ratgeber",
  author: "",
  reading_time_minutes: "",
  cover_image: "",
  published: false,
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminBlog() {
  const supabase = createClient();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => { loadPosts(); }, []);

  async function loadPosts() {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("id,title,slug,published,category,author,reading_time_minutes,created_at")
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

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setSaveError("");
    setShowForm(true);
  }

  async function openEdit(id: string) {
    setSaveError("");
    // Fetch full post including content
    const { data: post } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .single();
    if (!post) return;
    setEditingId(id);
    setForm({
      title: post.title ?? "",
      slug: post.slug ?? "",
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      category: post.category ?? "ratgeber",
      author: post.author ?? "",
      reading_time_minutes: post.reading_time_minutes != null ? String(post.reading_time_minutes) : "",
      cover_image: post.cover_image ?? "",
      published: post.published ?? false,
    });
    setShowForm(true);
  }

  async function handleSave() {
    setSaveError("");
    if (!form.title.trim())   { setSaveError("Titel ist erforderlich.");   return; }
    if (!form.slug.trim())    { setSaveError("Slug ist erforderlich.");    return; }
    if (!form.content.trim()) { setSaveError("Inhalt ist erforderlich.");  return; }
    setSaving(true);

    const payload: Record<string, any> = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim(),
      category: form.category,
      author: form.author.trim() || null,
      reading_time_minutes: form.reading_time_minutes ? parseInt(form.reading_time_minutes) : null,
      cover_image: form.cover_image.trim() || null,
      published: form.published,
    };
    if (form.published && !editingId) {
      payload.published_at = new Date().toISOString();
    }

    let error;
    if (editingId) {
      ({ error } = await supabase.from("blog_posts").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("blog_posts").insert(payload));
    }

    setSaving(false);
    if (error) {
      setSaveError(error.message);
    } else {
      setShowForm(false);
      loadPosts();
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", fontSize: 14, border: "1px solid #e5e5e5",
    borderRadius: 8, fontFamily: "inherit", boxSizing: "border-box", outline: "none",
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Blog ({posts.length} Artikel)</h1>
        <button
          onClick={openCreate}
          style={{ background: "#1a3329", color: "white", padding: "10px 20px", borderRadius: 8, border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
        >
          + Neuer Artikel
        </button>
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div style={{ background: "white", border: "1px solid #e5e5e5", borderRadius: 12, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 20px", color: "#1a3329" }}>
            {editingId ? "Artikel bearbeiten" : "Neuer Artikel"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Title */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Titel *</label>
              <input
                style={inputStyle}
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({ ...f, title, slug: editingId ? f.slug : slugify(title) }));
                }}
                placeholder="z.B. Unternehmen verkaufen in Deutschland: Der komplette Leitfaden"
              />
            </div>

            {/* Slug */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Slug (URL) *</label>
              <input
                style={inputStyle}
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="unternehmen-verkaufen-leitfaden"
              />
              {form.slug && (
                <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>/blog/{form.slug}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Kategorie</label>
              <select
                style={{ ...inputStyle, background: "white" }}
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>

            {/* Author */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Autor</label>
              <input
                style={inputStyle}
                value={form.author}
                onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                placeholder="z.B. Firmadeal Redaktion"
              />
            </div>

            {/* Excerpt */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Kurzbeschreibung (Excerpt)</label>
              <textarea
                style={{ ...inputStyle, resize: "vertical", minHeight: 70 }}
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                placeholder="1–2 Sätze für die Vorschau und SEO meta description..."
              />
            </div>

            {/* Content */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Inhalt (Markdown) *</label>
              <textarea
                style={{ ...inputStyle, resize: "vertical", minHeight: 320, fontFamily: "monospace", fontSize: 13 }}
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder={"# Überschrift\n\nIhren Artikel hier schreiben...\n\n## Abschnitt\n\nText..."}
              />
            </div>

            {/* Reading time + Cover image */}
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Lesezeit (Minuten)</label>
              <input
                type="number"
                style={inputStyle}
                value={form.reading_time_minutes}
                onChange={(e) => setForm((f) => ({ ...f, reading_time_minutes: e.target.value }))}
                placeholder="5"
                min="1"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Cover-Bild URL</label>
              <input
                style={inputStyle}
                value={form.cover_image}
                onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            {/* Published toggle */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                  style={{ width: 18, height: 18, accentColor: "#1a3329" }}
                />
                <span style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>Sofort veröffentlichen</span>
              </label>
            </div>
          </div>

          {saveError && (
            <p style={{ fontSize: 13, color: "#dc2626", marginTop: 12 }}>{saveError}</p>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowForm(false)}
              style={{ fontSize: 14, color: "#666", background: "none", border: "1px solid #e5e5e5", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontFamily: "inherit" }}
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ fontSize: 14, fontWeight: 600, color: "white", background: saving ? "#999" : "#1a3329", border: "none", borderRadius: 8, padding: "10px 28px", cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}
            >
              {saving ? "Speichert…" : editingId ? "Änderungen speichern" : "Artikel erstellen"}
            </button>
          </div>
        </div>
      )}

      {/* Posts list */}
      <div style={{ background: "white", borderRadius: 10, border: "1px solid #e5e5e5", overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: 20, textAlign: "center", color: "#999" }}>Lädt…</p>
        ) : posts.length === 0 ? (
          <p style={{ padding: 40, textAlign: "center", color: "#999" }}>Noch keine Blogartikel.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9f9f9", borderBottom: "1px solid #e5e5e5" }}>
                {["Titel", "Kategorie", "Autor", "Lesezeit", "Status", "Aktionen"].map((h) => (
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
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{post.author || "–"}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, color: "#555" }}>{post.reading_time_minutes ?? "–"} Min.</td>
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
                      <button
                        onClick={() => openEdit(post.id)}
                        style={{ fontSize: 12, color: "#1a3329", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
                      >
                        Bearbeiten
                      </button>
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
