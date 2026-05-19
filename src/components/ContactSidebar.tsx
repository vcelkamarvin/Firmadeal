"use client";

import { useState } from "react";
import { Send, Phone, CheckCircle } from "lucide-react";

interface ContactSidebarProps {
  listingId: string;
  listingTitle: string;
  sellerPhone: string | null;
  showPhone: boolean;
  lang?: "de" | "en";
}

export default function ContactSidebar({
  listingId,
  listingTitle,
  sellerPhone,
  showPhone,
  lang = "de",
}: ContactSidebarProps) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id:   listingId,
          sender_name:  name,
          sender_email: email,
          sender_phone: phone || null,
          message,
        }),
      });
      if (!res.ok) throw new Error("server error");
      setSent(true);
    } catch {
      setError(lang === "de" ? "Fehler beim Senden. Bitte erneut versuchen." : "Error sending. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-sans text-[10px] bg-[var(--accent-light)] text-[var(--accent)] px-2 py-0.5 rounded uppercase tracking-widest">
            Privatanbieter
          </span>
        </div>
        <h3 className="font-sans text-[15px] font-bold text-[var(--ink)] tracking-tight">
          {lang === "de" ? "Verkäufer kontaktieren" : "Contact seller"}
        </h3>
      </div>

      {sent ? (
        <div className="px-5 py-8 text-center">
          <CheckCircle size={28} className="text-[var(--green)] mx-auto mb-3" />
          <p className="font-sans text-[14px] font-semibold text-[var(--ink)] mb-1">
            {lang === "de" ? "Nachricht gesendet" : "Message sent"}
          </p>
          <p className="font-sans text-[13px] text-[var(--muted)]">
            {lang === "de"
              ? "Der Anbieter meldet sich in der Regel innerhalb von 24 Stunden."
              : "The seller usually responds within 24 hours."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="px-5 py-5 space-y-3">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={lang === "de" ? "Ihr vollständiger Name" : "Your full name"}
              className="w-full px-3 py-2.5 text-sm font-sans border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white transition-colors"
            />
          </div>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ihre@email.de"
              className="w-full px-3 py-2.5 text-sm font-sans border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white transition-colors"
            />
          </div>
          <div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={lang === "de" ? "+49 171 … (optional)" : "+49 171 … (optional)"}
              className="w-full px-3 py-2.5 text-sm font-sans border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white transition-colors"
            />
          </div>
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              placeholder={
                lang === "de"
                  ? "Ich interessiere mich für Ihr Unternehmen und würde gerne mehr erfahren…"
                  : "I'm interested in your business and would like to learn more…"
              }
              className="w-full px-3 py-2.5 text-sm font-sans border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white resize-none transition-colors"
            />
          </div>

          {error && (
            <p className="font-sans text-[12px] text-[var(--danger)]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[var(--accent)] text-white font-sans font-bold text-sm rounded-xl hover:bg-[var(--accent-hover)] disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={14} />
                {lang === "de" ? "Nachricht senden" : "Send message"}
              </>
            )}
          </button>

          {/* Phone reveal */}
          {showPhone && sellerPhone && (
            <>
              <div className="relative flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="font-sans text-[10px] text-[var(--muted)]">oder</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>
              {phoneRevealed ? (
                <div className="flex items-center justify-center gap-2 py-2.5 border border-[var(--border)] rounded-xl">
                  <Phone size={14} className="text-[var(--accent)]" />
                  <span className="font-sans text-[14px] font-semibold text-[var(--ink)] tabular-nums">{sellerPhone}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPhoneRevealed(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--border)] rounded-xl font-sans text-sm text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors"
                >
                  <Phone size={14} />
                  {lang === "de" ? "Telefonnummer anzeigen" : "Show phone number"}
                </button>
              )}
            </>
          )}

          <p className="font-sans text-[10px] text-[var(--muted)] leading-relaxed">
            {lang === "de"
              ? "Ihre Anfrage wird direkt an den Anbieter weitergeleitet. Firmadeal speichert keine Nachrichtenverläufe."
              : "Your inquiry is sent directly to the seller. Firmadeal does not store message history."}
          </p>
        </form>
      )}
    </div>
  );
}
