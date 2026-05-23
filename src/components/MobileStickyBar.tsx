"use client";
import { useState, useEffect } from "react";

interface Props {
  price: number | null;
  priceConfidential: boolean;
  listingTitle: string;
  listingId: string;
}

export function MobileStickyBar({ price, priceConfidential, listingId }: Props) {
  const [visible, setVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 200);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (!visible) return null;

  const fmtPrice = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  return (
    <>
      <div style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        background: "white",
        borderTop: "1px solid #e5e5e5",
        padding: "12px 16px",
        paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
        zIndex: 150,
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "inherit" }}>
            Kaufpreis
          </p>
          <p style={{ fontSize: 20, fontWeight: 800, color: "#1a3329", margin: 0, letterSpacing: "-0.5px", fontFamily: "inherit" }}>
            {priceConfidential || !price ? "Auf Anfrage" : fmtPrice(price)}
          </p>
        </div>
        <button
          onClick={() => setShowPopup(true)}
          style={{
            background: "#1a3329", color: "white", border: "none",
            borderRadius: 10, padding: "14px 20px",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit", minHeight: 50, whiteSpace: "nowrap",
          }}
        >
          Verkäufer kontaktieren
        </button>
      </div>

      {showPopup && (
        <div
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 300, display: "flex", alignItems: "flex-end",
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowPopup(false); }}
        >
          <div style={{
            background: "white",
            borderRadius: "20px 20px 0 0",
            padding: "24px 20px",
            paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
            width: "100%",
            maxHeight: "92vh",
            overflowY: "auto",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
          }}>
            <div style={{ width: 40, height: 4, background: "#e5e5e5", borderRadius: 2, margin: "0 auto 20px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0, fontFamily: "inherit" }}>Privatanbieter</p>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: "4px 0 0", fontFamily: "inherit" }}>Verkäufer kontaktieren</h3>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  background: "#f5f5f5", border: "none", borderRadius: "50%",
                  width: 36, height: 36, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16,
                }}
              >
                ✕
              </button>
            </div>
            <ContactFormInline listingId={listingId} onSuccess={() => setShowPopup(false)} />
          </div>
        </div>
      )}
    </>
  );
}

function ContactFormInline({ listingId, onSuccess }: { listingId: string; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("Ich interessiere mich für dieses Unternehmen und würde gerne mehr erfahren.");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name || !email || !message) { setError("Bitte Name, E-Mail und Nachricht ausfüllen."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, sender_name: name, sender_email: email, sender_phone: phone, message }),
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
      setTimeout(onSuccess, 1500);
    } catch {
      setError("Fehler beim Senden. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>✓</p>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#1a3329", fontFamily: "inherit" }}>Nachricht gesendet!</p>
        <p style={{ fontSize: 14, color: "#888", fontFamily: "inherit" }}>Der Anbieter meldet sich in Kürze.</p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 52, padding: "0 14px",
    borderRadius: 10, border: "1.5px solid #e5e5e5",
    fontSize: 16, boxSizing: "border-box", outline: "none",
    marginBottom: 10, fontFamily: "inherit",
  };

  return (
    <div>
      <input type="text" placeholder="Ihr Name *" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
      <input type="email" placeholder="ihre@email.de *" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
      <input type="tel" placeholder="+49 ... (optional)" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
      <textarea
        placeholder="Ihre Nachricht..."
        value={message}
        onChange={e => setMessage(e.target.value)}
        rows={3}
        style={{ ...inputStyle, height: "auto", padding: "14px", resize: "none" }}
      />
      {error && <p style={{ color: "#dc2626", fontSize: 13, margin: "0 0 10px", fontFamily: "inherit" }}>{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%", height: 54,
          background: loading ? "#ccc" : "#1a3329",
          color: "white", border: "none", borderRadius: 10,
          fontSize: 16, fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "inherit", marginBottom: 12,
        }}
      >
        {loading ? "Senden..." : "Nachricht senden →"}
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 12px" }}>
        <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
        <span style={{ fontSize: 12, color: "#999", fontFamily: "inherit" }}>oder</span>
        <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
      </div>

      <PhoneRevealButton listingId={listingId} />

      <p style={{ fontSize: 11, color: "#bbb", textAlign: "center", marginTop: 12, lineHeight: 1.5, fontFamily: "inherit" }}>
        Ihre Anfrage wird direkt an den Anbieter weitergeleitet.<br />Firmadeal speichert keine Nachrichtenverläufe.
      </p>
    </div>
  );
}

function PhoneRevealButton({ listingId }: { listingId: string }) {
  const [revealed, setRevealed] = useState(false);
  const [phone, setPhone] = useState("");

  const handleReveal = async () => {
    const res = await fetch(`/api/listings/${listingId}/phone`);
    const data = await res.json();
    setPhone(data.phone || "Nicht verfügbar");
    setRevealed(true);
  };

  return (
    <button
      onClick={!revealed ? handleReveal : undefined}
      style={{
        width: "100%", height: 48,
        background: "white", color: "#1a3329",
        border: "1.5px solid #1a3329", borderRadius: 10,
        fontSize: 15, fontWeight: 600, cursor: "pointer",
        fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      }}
    >
      {revealed ? `📞 ${phone}` : "📞 Telefonnummer anzeigen"}
    </button>
  );
}
