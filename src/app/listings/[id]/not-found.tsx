"use client";

import Link from "next/link";

export default function ListingNotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[var(--bg)]">
      <div className="text-center px-4">
        <div className="text-5xl mb-5">🔍</div>
        <h1 className="font-fraunces text-[36px] text-[var(--ink)] mb-3">
          Inserat nicht gefunden
        </h1>
        <p className="font-sans text-[15px] text-[var(--muted)] mb-8 max-w-sm mx-auto">
          Dieses Inserat existiert nicht mehr oder wurde entfernt.
        </p>
        <Link
          href="/listings"
          className="bg-[var(--accent)] text-white font-sans font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          Alle Inserate anzeigen
        </Link>
      </div>
    </div>
  );
}
