"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie_consent")) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "all");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie_consent", "necessary");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto sm:mx-0 sm:max-w-xl bg-white border border-[var(--border)] rounded-2xl shadow-xl p-5 sm:p-6">
        <p className="font-sans text-[13px] text-[var(--ink)] leading-relaxed mb-4">
          Wir verwenden Cookies, um Ihnen die beste Erfahrung zu bieten. Weitere Informationen in
          unserer{" "}
          <Link href="/datenschutz" className="text-[var(--accent)] hover:underline">
            Datenschutzerklärung
          </Link>
          .
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={accept}
            className="flex-1 bg-[var(--accent)] text-white font-sans font-semibold text-[13px] px-5 py-2.5 rounded-full hover:bg-[var(--accent-hover)] transition-colors"
          >
            Alle akzeptieren
          </button>
          <button
            onClick={decline}
            className="flex-1 bg-[var(--surface2)] text-[var(--muted)] font-sans font-semibold text-[13px] px-5 py-2.5 rounded-full hover:bg-[var(--border)] transition-colors"
          >
            Nur notwendige
          </button>
        </div>
      </div>
    </div>
  );
}
