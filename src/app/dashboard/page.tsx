"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  MessageSquare,
  Plus,
  Edit,
  Pause,
  Trash2,
  Play,
  BarChart3,
  Calendar,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { createClient } from "@/lib/supabase";
import { Listing } from "@/lib/types";
import { calcCompletionScore } from "@/lib/completionScore";
import MilestoneBadges from "@/components/MilestoneBadges";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    active: { label: "Aktiv", className: "bg-green-50 text-[var(--green)]" },
    draft: { label: "Entwurf", className: "bg-amber-50 text-amber-700" },
    paused: { label: "Pausiert", className: "bg-[var(--surface2)] text-[var(--muted)]" },
    expired: { label: "Abgelaufen", className: "bg-red-50 text-[var(--red)]" },
  };
  const c = config[status] ?? config.draft;
  return (
    <span className={`font-mono text-[10px] px-2 py-1 rounded-full ${c.className}`}>
      {c.label}
    </span>
  );
}

function PlanBadge({ plan }: { plan: string | null }) {
  if (!plan) return <span className="font-mono text-[10px] text-[var(--muted)]">—</span>;
  const colors: Record<string, string> = {
    basic:    "bg-[var(--surface2)] text-[var(--muted)]",
    advanced: "bg-[var(--accent-light)] text-[var(--accent)]",
    premium:  "bg-amber-50 text-amber-700",
  };
  return (
    <span className={`font-mono text-[10px] px-2 py-1 rounded-full ${colors[plan] ?? ""}`}>
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </span>
  );
}

function DashboardContent() {
  const { lang } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const trialStarted = searchParams.get("trial_started") === "true";
  const [user, setUser] = useState<{ id: string; email: string; user_metadata: Record<string, string> } | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) {
        router.push("/login?redirect=/dashboard");
        return;
      }
      setUser(u as typeof user);

      // Try to load from Supabase; fall back to mock data filtered by user
      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false });

      setListings(data ?? []);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(lang === "de" ? "Inserat wirklich löschen?" : "Really delete this listing?"))
      return;
    setDeletingId(id);
    await supabase.from("listings").delete().eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    setDeletingId(null);
  };

  const handleTogglePause = async (listing: Listing) => {
    const newStatus = listing.status === "active" ? "paused" : "active";
    await supabase.from("listings").update({ status: newStatus }).eq("id", listing.id);
    setListings((prev) =>
      prev.map((l) => (l.id === listing.id ? { ...l, status: newStatus } : l))
    );
  };

  const handleCancelTrial = async (listingId: string) => {
    if (!confirm(lang === "de" ? "Test wirklich kündigen? Ihr Inserat wird nach dem Testzeitraum deaktiviert." : "Really cancel? Your listing will be deactivated after the trial.")) return;
    setCancellingId(listingId);
    await fetch("/api/cancel-subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    setListings((prev) => prev.map((l) => l.id === listingId ? { ...l, status: "cancelling" } : l));
    setCancellingId(null);
  };

  const totalViews = listings.reduce((s, l) => s + l.views_count, 0);
  const totalInquiries = listings.reduce((s, l) => s + l.inquiries_count, 0);
  const activeListings = listings.filter((l) => l.status === "active").length;

  const userName =
    user?.user_metadata?.name ?? user?.email?.split("@")[0] ?? "—";
  const memberSince = user ? new Date().toLocaleDateString(lang === "de" ? "de-DE" : "en-GB", { month: "long", year: "numeric" }) : "—";

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="font-mono text-sm text-[var(--muted)]">
          {lang === "de" ? "Wird geladen..." : "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-fraunces text-[32px] text-[var(--ink)]">
              {lang === "de" ? "Willkommen," : "Welcome,"}{" "}
              <span className="text-[var(--accent)]">{userName}</span>
            </h1>
            <p className="font-mono text-[12px] text-[var(--muted)] mt-1">
              {user?.email}
            </p>
          </div>
          <Link
            href="/sell"
            className="flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-medium text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap self-start sm:self-auto"
          >
            <Plus size={16} />
            {lang === "de" ? "Neues Inserat" : "New listing"}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: <BarChart3 size={18} />,
              value: activeListings,
              label: lang === "de" ? "Aktive Inserate" : "Active listings",
            },
            {
              icon: <Eye size={18} />,
              value: totalViews.toLocaleString("de-DE"),
              label: lang === "de" ? "Gesamtansichten" : "Total views",
            },
            {
              icon: <MessageSquare size={18} />,
              value: totalInquiries,
              label: lang === "de" ? "Anfragen" : "Inquiries",
            },
            {
              icon: <Calendar size={18} />,
              value: memberSince,
              label: lang === "de" ? "Mitglied seit" : "Member since",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[var(--border)] rounded-xl p-5"
            >
              <div className="text-[var(--muted)] mb-3">{stat.icon}</div>
              <div className="font-fraunces text-[26px] text-[var(--ink)] leading-none mb-1">
                {stat.value}
              </div>
              <div className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Trial started success banner */}
        {trialStarted && (
          <div className="bg-[var(--accent-light)] border border-[var(--accent)]/25 rounded-xl px-5 py-4 flex items-center gap-3 mb-6">
            <span className="text-xl flex-shrink-0">🎉</span>
            <p className="font-sans text-[14px] text-[var(--ink)]">
              {lang === "de"
                ? "Ihr Inserat ist jetzt live! 7 Tage kostenlos — viel Erfolg beim Verkauf."
                : "Your listing is now live! 7 days free — good luck with the sale."}
            </p>
          </div>
        )}

        {/* Per-listing trial banners */}
        {listings.map((listing) => {
          if (!listing.trial_ends_at) return null;
          const daysLeft = Math.ceil((new Date(listing.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysLeft <= 0) return null;
          const urgent = daysLeft <= 2;
          return (
            <div
              key={`trial-${listing.id}`}
              className="rounded-xl px-5 py-4 mb-4 flex items-center justify-between gap-4"
              style={{
                background: urgent ? "#fef3cd" : "var(--accent-light)",
                border: `1px solid ${urgent ? "#f59e0b" : "rgba(45,90,61,0.2)"}`,
              }}
            >
              <div>
                <p className="font-sans text-[14px] font-semibold text-[var(--ink)]">
                  {urgent ? "⚠ " : "✓ "}
                  {lang === "de"
                    ? `Kostenloser Test — noch ${daysLeft} ${daysLeft === 1 ? "Tag" : "Tage"} · ${listing.title}`
                    : `Free trial — ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left · ${listing.title}`}
                </p>
                <p className="font-sans text-[12px] text-[var(--muted)]">
                  {urgent
                    ? lang === "de" ? "Kündigen Sie jetzt, um Kosten zu vermeiden." : "Cancel now to avoid charges."
                    : lang === "de" ? "Ab Tag 8 wird Ihre Karte belastet." : "Your card will be charged on day 8."}
                </p>
              </div>
              {urgent && (
                <button
                  onClick={() => handleCancelTrial(listing.id)}
                  disabled={cancellingId === listing.id}
                  className="flex-shrink-0 font-sans text-[13px] px-4 py-2 border border-amber-400 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors disabled:opacity-50"
                >
                  {lang === "de" ? "Kündigen" : "Cancel"}
                </button>
              )}
            </div>
          );
        })}

        {/* Listings table / empty state */}
        {listings.length === 0 ? (
          <div className="bg-white border border-[var(--border)] rounded-2xl p-16 text-center">
            <div className="text-5xl mb-5">📋</div>
            <h2 className="font-fraunces text-[24px] text-[var(--ink)] mb-2">
              {lang === "de"
                ? "Noch kein Inserat"
                : "No listings yet"}
            </h2>
            <p className="font-sans text-sm text-[var(--muted)] mb-6">
              {lang === "de"
                ? "Erstellen Sie Ihr erstes Inserat und erreichen Sie tausende Käufer."
                : "Create your first listing and reach thousands of buyers."}
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              <Plus size={16} />
              {lang === "de" ? "Jetzt inserieren →" : "Start listing now →"}
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="font-sans text-sm font-semibold text-[var(--ink)]">
                {lang === "de" ? "Ihre Inserate" : "Your listings"}
              </h2>
              <span className="font-mono text-[11px] text-[var(--muted)]">
                {listings.length} {lang === "de" ? "total" : "total"}
              </span>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {[
                      lang === "de" ? "Titel" : "Title",
                      "Status",
                      "Plan",
                      lang === "de" ? "Ansichten" : "Views",
                      lang === "de" ? "Anfragen" : "Inquiries",
                      lang === "de" ? "Läuft ab" : "Expires",
                      lang === "de" ? "Aktionen" : "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-3 font-mono text-[10px] text-[var(--muted)] uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing, i) => (
                    <tr
                      key={listing.id}
                      className={`${
                        i < listings.length - 1 ? "border-b border-[var(--border)]" : ""
                      } hover:bg-[var(--bg)] transition-colors`}
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="font-sans text-sm font-medium text-[var(--ink)] hover:text-[var(--accent)] transition-colors line-clamp-2 max-w-[240px]"
                        >
                          {listing.title}
                        </Link>
                        <p className="font-mono text-[10px] text-[var(--muted)] mt-0.5">
                          {listing.city}, {listing.country}
                        </p>
                        {(() => {
                          const { score, topMissing } = calcCompletionScore(listing);
                          const barColor = score >= 80 ? "#2d5a3d" : score >= 50 ? "#f59e0b" : "#e5e5e5";
                          return (
                            <div className="mt-2 max-w-[240px]">
                              <div className="flex justify-between mb-1">
                                <span className="font-sans text-[11px] text-[var(--muted)]">{score}% vollständig</span>
                                {score >= 80 && <span className="font-sans text-[11px] font-semibold text-[var(--green)]">Sehr vollständig ✓</span>}
                              </div>
                              <div className="h-1.5 bg-[var(--surface2)] rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: barColor }} />
                              </div>
                              {topMissing && score < 100 && (
                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                  <span className="font-sans text-[11px] text-[var(--muted)]">💡 {topMissing.hint}</span>
                                  <span className="font-sans text-[10px] font-semibold text-[var(--green)] bg-[var(--accent-light)] px-2 py-0.5 rounded-full">{topMissing.impact}</span>
                                </div>
                              )}
                              <MilestoneBadges listing={listing} completionScore={score} />
                              {(() => {
                                const trialDaysLeft = listing.trial_ends_at
                                  ? Math.ceil((new Date(listing.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                                  : null;
                                if (!trialDaysLeft || trialDaysLeft <= 0) return null;
                                return (
                                  <div style={{
                                    background: trialDaysLeft <= 2 ? "#fef3cd" : "#e8f5ed",
                                    border: `1px solid ${trialDaysLeft <= 2 ? "#f59e0b" : "#c6e6d0"}`,
                                    borderRadius: 8,
                                    padding: "8px 12px",
                                    marginTop: 8,
                                    fontSize: 12,
                                    fontFamily: "Helvetica Neue, Arial, sans-serif",
                                    color: trialDaysLeft <= 2 ? "#92600a" : "#1a3329",
                                  }}>
                                    {trialDaysLeft <= 2
                                      ? `⚠️ Testzeitraum endet in ${trialDaysLeft} Tag${trialDaysLeft === 1 ? "" : "en"}`
                                      : `✓ Kostenloser Testzeitraum — noch ${trialDaysLeft} Tage`}
                                  </div>
                                );
                              })()}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={listing.status} />
                      </td>
                      <td className="px-6 py-4">
                        <PlanBadge plan={listing.plan} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-[12px] text-[var(--muted)]">
                          <Eye size={12} />
                          {listing.views_count}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-[12px] text-[var(--muted)]">
                          <MessageSquare size={12} />
                          {listing.inquiries_count}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-[11px] text-[var(--muted)]">
                          {listing.plan_expires_at
                            ? new Date(listing.plan_expires_at).toLocaleDateString(
                                lang === "de" ? "de-DE" : "en-GB"
                              )
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/listings/${listing.id}`}
                            title={lang === "de" ? "Anzeigen" : "View"}
                            className="p-1.5 text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-light)] rounded-lg transition-all"
                          >
                            <Eye size={14} />
                          </Link>
                          <button
                            onClick={() => handleTogglePause(listing)}
                            title={listing.status === "active"
                              ? lang === "de" ? "Pausieren" : "Pause"
                              : lang === "de" ? "Aktivieren" : "Activate"}
                            className="p-1.5 text-[var(--muted)] hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          >
                            {listing.status === "active" ? <Pause size={14} /> : <Play size={14} />}
                          </button>
                          <button
                            onClick={() => handleDelete(listing.id)}
                            disabled={deletingId === listing.id}
                            title={lang === "de" ? "Löschen" : "Delete"}
                            className="p-1.5 text-[var(--muted)] hover:text-[var(--red)] hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-[var(--border)]">
              {listings.map((listing) => (
                <div key={listing.id} className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="font-sans text-sm font-medium text-[var(--ink)] hover:text-[var(--accent)] flex-1"
                    >
                      {listing.title}
                    </Link>
                    <StatusBadge status={listing.status} />
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[11px] text-[var(--muted)] mb-2">
                    <span className="flex items-center gap-1">
                      <Eye size={11} /> {listing.views_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={11} /> {listing.inquiries_count}
                    </span>
                    <PlanBadge plan={listing.plan} />
                  </div>
                  {(() => {
                    const { score, topMissing } = calcCompletionScore(listing);
                    const barColor = score >= 80 ? "#2d5a3d" : score >= 50 ? "#f59e0b" : "#e5e5e5";
                    return (
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="font-sans text-[11px] text-[var(--muted)]">{score}% vollständig</span>
                        </div>
                        <div className="h-1.5 bg-[var(--surface2)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, background: barColor }} />
                        </div>
                        {topMissing && score < 100 && (
                          <p className="font-sans text-[11px] text-[var(--muted)] mt-1">💡 {topMissing.hint} · <span className="text-[var(--green)] font-semibold">{topMissing.impact}</span></p>
                        )}
                        <MilestoneBadges listing={listing} completionScore={score} />
                        {(() => {
                          const trialDaysLeft = listing.trial_ends_at
                            ? Math.ceil((new Date(listing.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                            : null;
                          if (!trialDaysLeft || trialDaysLeft <= 0) return null;
                          return (
                            <div style={{
                              background: trialDaysLeft <= 2 ? "#fef3cd" : "#e8f5ed",
                              border: `1px solid ${trialDaysLeft <= 2 ? "#f59e0b" : "#c6e6d0"}`,
                              borderRadius: 8,
                              padding: "8px 12px",
                              marginTop: 8,
                              fontSize: 12,
                              fontFamily: "Helvetica Neue, Arial, sans-serif",
                              color: trialDaysLeft <= 2 ? "#92600a" : "#1a3329",
                            }}>
                              {trialDaysLeft <= 2
                                ? `⚠️ Testzeitraum endet in ${trialDaysLeft} Tag${trialDaysLeft === 1 ? "" : "en"}`
                                : `✓ Kostenloser Testzeitraum — noch ${trialDaysLeft} Tage`}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePause(listing)}
                      className="flex-1 py-2 border border-[var(--border)] rounded-lg text-sm font-sans text-[var(--ink)] hover:bg-[var(--surface2)] transition-colors"
                    >
                      {listing.status === "active"
                        ? lang === "de" ? "Pausieren" : "Pause"
                        : lang === "de" ? "Aktivieren" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      disabled={deletingId === listing.id}
                      className="p-2 border border-[var(--border)] rounded-lg text-[var(--muted)] hover:text-[var(--red)] hover:border-red-200 transition-all"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Account management */}
        <div className="mt-10 border-t border-[var(--border)] pt-8">
          <h2 className="font-sans text-sm font-semibold text-[var(--ink)] mb-4">
            {lang === "de" ? "Konto" : "Account"}
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/");
              }}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg font-sans text-sm text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface2)] transition-all"
            >
              <LogOut size={14} />
              {lang === "de" ? "Abmelden" : "Sign out"}
            </button>
            <button
              onClick={async () => {
                if (!confirm(lang === "de"
                  ? "Konto wirklich löschen? Alle Inserate werden entfernt. Diese Aktion ist unwiderruflich."
                  : "Really delete your account? All listings will be removed. This is irreversible."))
                  return;
                const res = await fetch("/api/delete-account", { method: "DELETE" });
                if (res.ok) {
                  await supabase.auth.signOut();
                  router.push("/");
                } else {
                  alert(lang === "de" ? "Fehler beim Löschen. Bitte erneut versuchen." : "Error deleting account. Please try again.");
                }
              }}
              className="flex items-center gap-2 px-4 py-2 border border-red-200 rounded-lg font-sans text-sm text-[var(--red)] hover:bg-red-50 transition-all"
            >
              <Trash2 size={14} />
              {lang === "de" ? "Konto löschen (DSGVO)" : "Delete account (GDPR)"}
            </button>
          </div>
          <p className="font-mono text-[10px] text-[var(--muted)] mt-3">
            {lang === "de"
              ? "Datenlöschung gemäß DSGVO Art. 17 — Recht auf Vergessenwerden. Alle Ihre Daten werden sofort und unwiderruflich gelöscht."
              : "Data deletion per GDPR Art. 17 — Right to erasure. All your data is immediately and permanently deleted."}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg)]" />}>
      <DashboardContent />
    </Suspense>
  );
}
