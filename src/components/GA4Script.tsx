"use client";

import { useEffect } from "react";

export default function GA4Script() {
  useEffect(() => {
    const load = () => {
      if (typeof window === "undefined") return;
      if ((window as any).GA4_LOADED) return;
      (window as any).GA4_LOADED = true;

      // Grant analytics consent
      if (typeof (window as any).gtag === "function") {
        (window as any).gtag("consent", "update", {
          analytics_storage: "granted",
        });
      }

      // Load gtag.js
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-R49DGXK1H3";
      document.head.appendChild(script);

      script.onload = () => {
        (window as any).gtag("js", new Date());
        (window as any).gtag("config", "G-R49DGXK1H3");
      };
    };

    if (localStorage.getItem("cookie_consent") === "all") {
      load();
      return;
    }

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
