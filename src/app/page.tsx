"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, MessageCircle, Lock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ListingCard from "@/components/ListingCard";
import { MOCK_LISTINGS, CATEGORY_ICONS } from "@/lib/mockData";
import { CATEGORIES } from "@/lib/types";

const FEATURED_LISTINGS = MOCK_LISTINGS.filter((l) => l.featured).slice(0, 3);

const TESTIMONIALS = [
  {
    quote:
      "Innerhalb von 3 Wochen hatte ich 12 qualifizierte Anfragen. Die Übergabe lief reibungslos – kein Makler nötig.",
    name: "Thomas K.",
    city: "München",
    rating: 5,
    role: "Verkäufer, Gastronomiebetrieb",
  },
  {
    quote:
      "Als Käufer schätze ich die Transparenz. Alle Informationen direkt zugänglich, ohne Zwischenhändler.",
    name: "Sabine W.",
    city: "Hamburg",
    rating: 5,
    role: "Käuferin, IT-Dienstleister",
  },
  {
    quote:
      "Günstigste Plattform die ich gefunden habe. Und die Qualität der Inserate ist deutlich besser als bei der Konkurrenz.",
    name: "Markus P.",
    city: "Wien",
    rating: 5,
    role: "Käufer, E-Commerce",
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { t, lang } = useLanguage();

  const categoryCounts: Record<string, number> = {};
  MOCK_LISTINGS.forEach((l) => {
    categoryCounts[l.category] = (categoryCounts[l.category] || 0) + 1;
  });

  const displayCategories = [
    "Gastronomie",
    "Einzelhandel",
    "Produktion",
    "Dienstleistungen",
    "IT & Tech",
    "Gesundheit",
    "Handwerk",
    "Immobilien",
  ];

  return (
    <div className="bg-[var(--bg)]">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <p className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-[0.15em] mb-5">
          {t("hero.eyebrow")}
        </p>
        <h1 className="font-fraunces text-[clamp(36px,6vw,56px)] text-[var(--ink)] leading-[1.05] max-w-[700px] mb-5">
          {t("hero.h1")}
        </h1>
        <p className="font-sans text-lg text-[var(--muted)] max-w-[520px] mb-8 leading-relaxed">
          {t("hero.subtitle")}
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href="/sell"
            className="flex items-center gap-2 bg-[var(--accent)] text-white font-sans font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            {t("hero.cta_primary")}
          </Link>
          <Link
            href="/listings"
            className="flex items-center gap-2 border border-[var(--border)] text-[var(--ink)] font-sans font-medium px-6 py-3 rounded-full hover:bg-[var(--surface2)] transition-colors"
          >
            {t("hero.cta_secondary")}
          </Link>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap gap-6">
          {[
            t("hero.trust_commission"),
            t("hero.trust_dach"),
            t("hero.trust_verified"),
            t("hero.trust_time"),
          ].map((item) => (
            <span key={item} className="font-mono text-[12px] text-[var(--muted)]">
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* Stats Row */}
      <section className="border-t border-b border-[var(--border)] bg-[var(--surface2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "1.200+", label: t("stats.buyers") },
              { value: "0%", label: t("stats.commission") },
              { value: "4 Min.", label: t("stats.create") },
              { value: "€0", label: t("stats.costs") },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-fraunces text-[36px] text-[var(--accent)] leading-none mb-1">
                  {stat.value}
                </div>
                <div className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-fraunces text-[28px] text-[var(--ink)]">
            {t("listings.featured")}
          </h2>
          <Link
            href="/listings"
            className="font-sans text-sm text-[var(--accent)] hover:underline"
          >
            {t("listings.view_all")}
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED_LISTINGS.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-[var(--surface2)] border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="font-fraunces text-[28px] text-[var(--ink)] mb-8">
            {t("categories.title")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {displayCategories.map((cat) => (
              <Link
                key={cat}
                href={`/listings?category=${encodeURIComponent(cat)}`}
                className="flex items-center gap-3 bg-white border border-[var(--border)] rounded-lg px-4 py-4 hover:border-[var(--accent)] hover:shadow-sm transition-all duration-200 group"
              >
                <span className="text-2xl">{CATEGORY_ICONS[cat] ?? "🏢"}</span>
                <div>
                  <div className="font-sans text-[14px] font-medium text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                    {cat}
                  </div>
                  <div className="font-mono text-[11px] text-[var(--muted)]">
                    {categoryCounts[cat] ?? 0} {t("categories.listings")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="font-fraunces text-[28px] text-[var(--ink)] text-center mb-12">
          {t("value.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[var(--accent-light)] rounded-xl mb-5">
              <ShieldCheck className="text-[var(--accent)]" size={24} />
            </div>
            <h3 className="font-fraunces text-[20px] text-[var(--ink)] mb-3">
              {t("value.commission_title")}
            </h3>
            <p className="font-sans text-[14px] text-[var(--muted)] leading-relaxed">
              {t("value.commission_desc")}
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[var(--accent-light)] rounded-xl mb-5">
              <MessageCircle className="text-[var(--accent)]" size={24} />
            </div>
            <h3 className="font-fraunces text-[20px] text-[var(--ink)] mb-3">
              {t("value.direct_title")}
            </h3>
            <p className="font-sans text-[14px] text-[var(--muted)] leading-relaxed">
              {t("value.direct_desc")}
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[var(--accent-light)] rounded-xl mb-5">
              <Lock className="text-[var(--accent)]" size={24} />
            </div>
            <h3 className="font-fraunces text-[20px] text-[var(--ink)] mb-3">
              {t("value.safe_title")}
            </h3>
            <p className="font-sans text-[14px] text-[var(--muted)] leading-relaxed">
              {t("value.safe_desc")}
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[var(--surface2)] border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t_) => (
              <div
                key={t_.name}
                className="bg-white border border-[var(--border)] rounded-xl p-6"
              >
                <StarRating count={t_.rating} />
                <blockquote className="font-sans text-[14px] text-[var(--ink)] leading-relaxed mt-4 mb-5">
                  &ldquo;{t_.quote}&rdquo;
                </blockquote>
                <div>
                  <div className="font-sans text-sm font-semibold text-[var(--ink)]">
                    {t_.name}
                  </div>
                  <div className="font-mono text-[11px] text-[var(--muted)]">
                    {t_.role} · {t_.city}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[var(--accent)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="font-fraunces text-[clamp(28px,4vw,40px)] text-white mb-8 leading-tight">
            {t("cta.title")}
          </h2>
          <Link
            href="/sell"
            className="inline-flex items-center gap-2 bg-white text-[var(--accent)] font-sans font-semibold px-8 py-4 rounded-full hover:bg-[var(--accent-light)] transition-colors"
          >
            {t("cta.button")}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
