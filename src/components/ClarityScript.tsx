"use client";

import { useEffect } from "react";

export default function ClarityScript() {
  useEffect(() => {
    const load = () => {
      if (typeof window === "undefined") return;
      if ((window as any).clarity) return; // already loaded

      (function (c: any, l: any, a: string, r: string, i: string) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        const t = l.createElement(r);
        t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
        const y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", "wtgoim4mun");
    };

    // Load immediately if already consented
    if (localStorage.getItem("cookie_consent") === "all") {
      load();
      return;
    }

    // Otherwise wait for consent to be granted via storage event
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cookie_consent" && e.newValue === "all") {
        load();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
