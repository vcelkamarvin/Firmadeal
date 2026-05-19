import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung von Firmadeal.de gemäß DSGVO",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-bold text-[11px] uppercase tracking-widest text-[var(--muted)] mb-3">
        {title}
      </h2>
      <div className="font-sans text-[14px] text-[var(--muted)] leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  );
}

export default function DatenschutzPage() {
  return (
    <div className="bg-[var(--bg)] min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-sans text-[32px] font-bold text-[var(--ink)] tracking-tight mb-2">
          Datenschutzerklärung
        </h1>
        <p className="font-sans text-[13px] text-[var(--muted)] mb-10">
          Zuletzt aktualisiert: Mai 2026
        </p>

        <div className="space-y-10">

          <Section title="1. Verantwortlicher">
            <p>
              Verantwortlich im Sinne der DSGVO ist Firmadeal.de, erreichbar unter{" "}
              <a href="mailto:info@firmadeal.de" className="text-[var(--accent)] hover:underline">
                info@firmadeal.de
              </a>. Die vollständigen Kontaktdaten entnehmen Sie bitte unserem{" "}
              <a href="/impressum" className="text-[var(--accent)] hover:underline">Impressum</a>.
            </p>
          </Section>

          <Section title="2. Welche Daten wir erheben">
            <p>
              Wir erheben und verarbeiten folgende personenbezogene Daten:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-[var(--ink)]">Registrierungsdaten:</strong> Name, E-Mail-Adresse, Passwort (verschlüsselt)</li>
              <li><strong className="text-[var(--ink)]">Inseratdaten:</strong> Unternehmensinformationen, Finanzangaben, Beschreibungen und Fotos, die Sie beim Erstellen eines Inserats eingeben</li>
              <li><strong className="text-[var(--ink)]">Zahlungsdaten:</strong> Abwicklung über Stripe; wir speichern keine Kartendaten — nur Stripe-Kunden-ID und Abonnement-ID</li>
              <li><strong className="text-[var(--ink)]">Kommunikationsdaten:</strong> Anfragen, die über die Plattform an Inserenten gesendet werden</li>
              <li><strong className="text-[var(--ink)]">Nutzungsdaten:</strong> IP-Adresse, Browser-Typ, Seitenaufrufe (für technischen Betrieb)</li>
            </ul>
          </Section>

          <Section title="3. Zweck der Datenverarbeitung">
            <p>Wir verarbeiten Ihre Daten zu folgenden Zwecken:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Bereitstellung und Betrieb der Marktplatz-Plattform (Art. 6 Abs. 1 lit. b DSGVO)</li>
              <li>Abrechnung und Zahlungsabwicklung über Stripe (Art. 6 Abs. 1 lit. b DSGVO)</li>
              <li>Erfüllung gesetzlicher Pflichten (Art. 6 Abs. 1 lit. c DSGVO)</li>
              <li>Betrugsprävention und Sicherheit (Art. 6 Abs. 1 lit. f DSGVO)</li>
            </ul>
          </Section>

          <Section title="4. Hosting & Infrastruktur">
            <p>
              <strong className="text-[var(--ink)]">Vercel Inc.</strong> (USA) — Hosting der Web-Applikation. Vercel ist nach EU-US Data Privacy Framework zertifiziert. Weitere Informationen:{" "}
              <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">vercel.com/legal/privacy-policy</a>
            </p>
            <p>
              <strong className="text-[var(--ink)]">Supabase Inc.</strong> (USA) — Datenbank und Authentifizierung. Daten werden in der EU-Region gespeichert (Frankfurt). Weitere Informationen:{" "}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">supabase.com/privacy</a>
            </p>
            <p>
              <strong className="text-[var(--ink)]">Stripe Inc.</strong> (USA) — Zahlungsabwicklung. Stripe ist PCI-DSS-zertifiziert. Weitere Informationen:{" "}
              <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">stripe.com/de/privacy</a>
            </p>
          </Section>

          <Section title="5. Cookies">
            <p>
              Wir verwenden ausschließlich technisch notwendige Cookies, die für den Betrieb der Plattform
              erforderlich sind (Sitzungsverwaltung, Authentifizierung). Diese Cookies erfordern keine
              Einwilligung gemäß § 25 Abs. 2 TTDSG. Optionale Cookies werden nur mit Ihrer Einwilligung
              gesetzt.
            </p>
          </Section>

          <Section title="6. Aufbewahrungsfristen">
            <p>
              Personenbezogene Daten werden gelöscht, sobald der Zweck der Verarbeitung entfällt und
              keine gesetzlichen Aufbewahrungspflichten bestehen. Rechnungsrelevante Daten werden gemäß
              § 147 AO für 10 Jahre aufbewahrt.
            </p>
          </Section>

          <Section title="7. Ihre Rechte">
            <p>Sie haben folgende Rechte gemäß DSGVO:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
            </ul>
            <p>
              Zur Ausübung Ihrer Rechte wenden Sie sich an:{" "}
              <a href="mailto:info@firmadeal.de" className="text-[var(--accent)] hover:underline">
                info@firmadeal.de
              </a>
            </p>
            <p>
              Sie haben außerdem das Recht, sich bei der zuständigen Datenschutzaufsichtsbehörde zu
              beschweren.
            </p>
          </Section>

          <Section title="8. Kontakt Datenschutz">
            <p>
              Bei Fragen zum Datenschutz:{" "}
              <a href="mailto:info@firmadeal.de" className="text-[var(--accent)] hover:underline">
                info@firmadeal.de
              </a>
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
}
