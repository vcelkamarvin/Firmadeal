"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center px-4">
        <p className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-[0.15em] mb-4">
          404
        </p>
        <h1 className="font-fraunces text-[48px] text-[var(--ink)] mb-3 leading-none">
          Seite nicht gefunden
        </h1>
        <p className="font-sans text-[16px] text-[var(--muted)] mb-8">
          Diese Seite existiert nicht oder wurde verschoben.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="bg-[var(--accent)] text-white font-sans font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Zur Startseite
          </Link>
          <Link
            href="/listings"
            className="border border-[var(--border)] text-[var(--ink)] font-sans font-medium px-6 py-3 rounded-full hover:bg-[var(--surface2)] transition-colors"
          >
            Inserate durchsuchen
          </Link>
        </div>
      </div>
    </div>
  );
}
