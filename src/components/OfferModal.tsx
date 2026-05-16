"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { Listing } from "@/lib/types";

interface OfferModalProps {
  listing: Listing;
  onClose: () => void;
}

function fmt(price: number): string {
  if (price >= 1_000_000) return `€${(price / 1_000_000).toFixed(2).replace(".", ",")}M`;
  if (price >= 1_000)     return `€${(price / 1_000).toFixed(0)}k`;
  return `€${price}`;
}

export default function OfferModal({ listing, onClose }: OfferModalProps) {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [offerPrice, setOfferPrice] = useState(
    listing.asking_price ? String(Math.round(listing.asking_price * 0.95 / 1000) * 1000) : ""
  );
  const [message, setMessage]   = useState("");
  const [sent, setSent]         = useState(false);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Simulate send (replace with real API call)
    await new Promise((r) => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="modal-backdrop flex items-center justify-center p-4 z-[70]" onClick={onClose}>
      <div
        className="bg-white rounded-xl border border-[var(--border)] w-full max-w-md shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="font-sans text-[16px] font-bold text-[var(--ink)] tracking-tight">
              Angebot abgeben
            </h2>
            <p className="font-mono text-[11px] text-[var(--muted)] mt-0.5 line-clamp-1">
              {listing.title}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface2)] transition-colors">
            <X size={18} className="text-[var(--muted)]" />
          </button>
        </div>

        {sent ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 bg-[var(--accent-light)] rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={22} className="text-[var(--accent)]" />
            </div>
            <h3 className="font-sans text-[16px] font-bold text-[var(--ink)] mb-2">Angebot gesendet</h3>
            <p className="font-sans text-sm text-[var(--muted)]">
              Der Verkäufer wird sich innerhalb von 48 Stunden bei Ihnen melden.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-[var(--accent)] text-white text-sm font-sans font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
            >
              Schließen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
            {/* Offer price */}
            <div>
              <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-1.5">
                Ihr Angebotspreis
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-[var(--muted)]">€</span>
                <input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  required
                  min="1"
                  className="w-full pl-7 pr-4 py-2.5 text-sm font-mono border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white"
                  placeholder="0"
                />
              </div>
              {listing.asking_price && !listing.price_confidential && (
                <p className="font-mono text-[10px] text-[var(--muted)] mt-1">
                  Kaufpreis: {fmt(listing.asking_price)}
                </p>
              )}
            </div>

            {/* Name + Email */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm font-sans border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white"
                  placeholder="Max Müller"
                />
              </div>
              <div>
                <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-1.5">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm font-sans border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white"
                  placeholder="max@firma.de"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wide block mb-1.5">
                Nachricht (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 text-sm font-sans border border-[var(--border)] rounded-lg outline-none focus:border-[var(--accent)] bg-white resize-none"
                placeholder="Kurze Vorstellung und Ihre Motivation..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--accent)] text-white font-sans text-sm font-semibold rounded-lg hover:bg-[var(--accent-hover)] disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={14} />
                  Angebot senden
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
