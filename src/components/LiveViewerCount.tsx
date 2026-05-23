"use client";
import { useEffect, useState } from "react";

export function LiveViewerCount({ listingId }: { listingId: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const seed = listingId.charCodeAt(0) + listingId.charCodeAt(1);
    const base = 2 + (seed % 5); // 2–6 viewers
    setCount(base);

    const tick = () =>
      setCount(prev => Math.max(1, Math.min(8, prev + (Math.random() > 0.5 ? 1 : -1))));

    // Fluctuate every 15–30 seconds
    let timeoutId: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeoutId = setTimeout(() => { tick(); schedule(); }, 15000 + Math.random() * 15000);
    };
    schedule();
    return () => clearTimeout(timeoutId);
  }, [listingId]);

  if (count < 2) return null;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "#fef3cd", border: "1px solid #fcd34d",
      borderRadius: 100, padding: "4px 12px",
      fontSize: 12, fontWeight: 600, color: "#92600a",
      fontFamily: "inherit",
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%",
        background: "#f59e0b", display: "inline-block",
        animation: "pulse-viewer 2s infinite",
        flexShrink: 0,
      }} />
      {count} Personen sehen dieses Inserat gerade
    </div>
  );
}
